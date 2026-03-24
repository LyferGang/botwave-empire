#!/usr/bin/env python3
"""
Botwave Plumbing Dispatcher - Secure Production Version
Adds rate limiting, input validation, audit logging, and webhook signature verification
"""

import json
import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, Any

# Configuration
DATA_DIR = Path.home() / '.botwave' / 'plumbing'
LOG_DIR = Path.home() / '.botwave' / 'logs'
DATA_DIR.mkdir(parents=True, exist_ok=True)
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Rate limiter class
class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = {}

    def allow(self, identifier: str) -> bool:
        now = datetime.now()
        if identifier not in self.requests:
            self.requests[identifier] = []

        # Filter to recent requests
        recent = [t for t in self.requests[identifier] if (now - t).total_seconds() < self.window_seconds]

        if len(recent) >= self.max_requests:
            return False

        recent.append(now)
        self.requests[identifier] = recent
        return True

    def get_retry_after(self, identifier: str) -> int:
        if identifier not in self.requests:
            return 0
        oldest = min(self.requests[identifier])
        elapsed = (datetime.now() - oldest).total_seconds()
        return max(0, int(self.window_seconds - elapsed))

# Initialize rate limiter (5 dispatches per hour per phone number)
dispatch_limiter = RateLimiter(max_requests=5, window_seconds=3600)

# Audit logging
def audit_log(event: str, details: Dict[str, Any], user: str = 'unknown'):
    timestamp = datetime.now().isoformat()
    log_entry = json.dumps({'timestamp': timestamp, 'event': event, 'details': details, 'user': user})
    log_file = LOG_DIR / f"audit_{datetime.now().strftime('%Y-%m-%d')}.log"
    with open(log_file, 'a') as f:
        f.write(log_entry + '\n')

# HMAC signature verification
def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    try:
        expected = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)
    except Exception:
        return False

# Generate secure secret if not set
def get_or_create_secret(name: str) -> str:
    env_var = os.environ.get(name)
    if env_var:
        return env_var
    secret = secrets.token_hex(32)
    print(f"Generated {name}: {secret}")
    print(f"export {name}={secret}")
    return secret

# Get HMAC secret
HMAC_SECRET = get_or_create_secret('BOTWAVE_HMAC_SECRET')

# Input validation
def validate_phone(phone: str) -> bool:
    """Validate phone number format (simple E.164 check)"""
    if not phone or not isinstance(phone, str):
        return False
    # Remove non-digits
    digits = ''.join(c for c in phone if c.isdigit())
    return len(digits) >= 10 and len(digits) <= 15

def validate_urgency(urgency: str) -> bool:
    """Validate urgency level"""
    return urgency in ['critical', 'high', 'medium', 'low']

def sanitize_input(text: str, max_length: int = 500) -> str:
    """Sanitize text input"""
    if not text:
        return ''
    return text[:max_length].strip()

# Urgency classification (simple rule-based, can be enhanced with ML)
def classify_urgency(description: str) -> str:
    """Classify urgency from description keywords"""
    description_lower = description.lower()

    critical_keywords = ['burst', 'flooding', 'gas leak', 'sewage', 'no water', 'emergency']
    high_keywords = ['leak', 'overflow', 'clog', 'blocked', 'broken']
    medium_keywords = ['drip', 'slow', 'running', 'noise']

    if any(k in description_lower for k in critical_keywords):
        return 'critical'
    elif any(k in description_lower for k in high_keywords):
        return 'high'
    elif any(k in description_lower for k in medium_keywords):
        return 'medium'
    return 'low'

# Dispatch function with security
def dispatch_job(phone: str, description: str, source: str = 'sms') -> Dict[str, Any]:
    """
    Dispatch a plumbing job with rate limiting and validation
    """
    # Rate limiting check
    if not dispatch_limiter.allow(phone):
        retry_after = dispatch_limiter.get_retry_after(phone)
        audit_log('dispatch_rate_limited', {'phone': phone, 'retry_after': retry_after}, phone)
        return {
            'status': 'rate_limited',
            'message': f'Try again in {retry_after} seconds',
            'retry_after': retry_after
        }

    # Input validation
    if not validate_phone(phone):
        audit_log('dispatch_invalid_phone', {'phone': phone}, phone)
        return {
            'status': 'error',
            'message': 'Invalid phone number'
        }

    description = sanitize_input(description)
    if len(description) < 10:
        audit_log('dispatch_invalid_description', {'phone': phone, 'length': len(description)}, phone)
        return {
            'status': 'error',
            'message': 'Description too short'
        }

    # Classify urgency
    urgency = classify_urgency(description)

    # Create job record
    job_id = secrets.token_hex(8)
    job = {
        'job_id': job_id,
        'phone': phone,
        'description': description,
        'urgency': urgency,
        'source': source,
        'status': 'pending',
        'created': datetime.now().isoformat()
    }

    # Save to file
    jobs_file = DATA_DIR / 'jobs.json'
    jobs = []
    if jobs_file.exists():
        with open(jobs_file) as f:
            jobs = json.load(f)
    jobs.append(job)
    with open(jobs_file, 'w') as f:
        json.dump(jobs, f, indent=2)

    # Audit log
    audit_log('dispatch_created', {'job_id': job_id, 'phone': phone, 'urgency': urgency}, phone)

    # Determine response based on urgency
    if urgency == 'critical':
        message = '🚨 CRITICAL: Dispatching plumber immediately!'
        response_time = '15 minutes'
    elif urgency == 'high':
        message = '⚠️ HIGH: Scheduling within 1 hour'
        response_time = '1 hour'
    elif urgency == 'medium':
        message = '📋 MEDIUM: Scheduling within 4 hours'
        response_time = '4 hours'
    else:
        message = '✅ LOW: Scheduling within 24 hours'
        response_time = '24 hours'

    return {
        'status': 'complete',
        'job_id': job_id,
        'urgency': urgency,
        'message': message,
        'response_time': response_time,
        'created': job['created']
    }

# Webhook handler with signature verification
def handle_webhook(payload: str, signature: str) -> Dict[str, Any]:
    """
    Handle incoming webhook with signature verification
    """
    if not verify_webhook_signature(payload, signature, HMAC_SECRET):
        audit_log('webhook_invalid_signature', {'signature': signature[:10]}, 'webhook')
        return {'status': 'error', 'message': 'Invalid signature'}

    try:
        data = json.loads(payload)
        phone = data.get('phone')
        description = data.get('description')
        source = data.get('source', 'webhook')

        return dispatch_job(phone, description, source)
    except json.JSONDecodeError:
        audit_log('webhook_invalid_json', {'payload': payload[:100]}, 'webhook')
        return {'status': 'error', 'message': 'Invalid JSON'}

# CLI interface
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Botwave Plumbing Dispatcher')
    parser.add_argument('--test', action='store_true', help='Run test dispatch')
    parser.add_argument('--phone', type=str, help='Phone number')
    parser.add_argument('--description', type=str, help='Job description')
    parser.add_argument('--webhook', type=str, help='Webhook payload')
    parser.add_argument('--signature', type=str, help='Webhook signature')

    args = parser.parse_args()

    if args.test:
        print("Running test dispatch...")
        result = dispatch_job('+1234567890', 'Water heater leaking', 'test')
        print(json.dumps(result, indent=2))
        audit_log('test_dispatch', {'result': result}, 'test')

    elif args.webhook and args.signature:
        result = handle_webhook(args.webhook, args.signature)
        print(json.dumps(result, indent=2))

    elif args.phone and args.description:
        result = dispatch_job(args.phone, args.description)
        print(json.dumps(result, indent=2))

    else:
        print("Usage:")
        print("  python dispatcher.py --test")
        print("  python dispatcher.py --phone +1234567890 --description 'Leaking faucet'")
        print("  python dispatcher.py --webhook '<json>' --signature '<hmac>'")
