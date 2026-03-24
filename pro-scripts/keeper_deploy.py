#!/usr/bin/env python3
"""
SCRIPT KEEPER v2026.4 - Deployment Automation
=============================================
Professional deployment with zero human error.
Automates: git → test → deploy → verify → notify

Usage:
    python3 keeper_deploy.py [options]
    python3 keeper_deploy.py --auto        # Full auto mode
    python3 keeper_deploy.py --dry-run     # Test without deploying

Author: SCRIPT KEEPER Utility
Version: 2026.4
"""

import subprocess
import sys
import json
import time
from datetime import datetime
from pathlib import Path
from typing import List, Tuple, Optional

# Configuration
PROJECT_DIR = Path("/home/gringo/Projects/botwave")
LOG_FILE = Path("/home/gringo/Projects/botwave/logs/deployments.jsonl")
SERVICES = ["razor-master", "botwave-hub"]

# Colors for output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def log(message: str, level: str = "INFO"):
    """Timestamped logging with colors"""
    timestamp = datetime.now().isoformat()
    color = {
        "INFO": Colors.OKBLUE,
        "SUCCESS": Colors.OKGREEN,
        "WARNING": Colors.WARNING,
        "ERROR": Colors.FAIL,
        "STEP": Colors.OKCYAN
    }.get(level, Colors.OKBLUE)

    print(f"{color}[{timestamp}] {level}:{Colors.ENDC} {message}")

    # Persist to structured log
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps({
            "timestamp": timestamp,
            "level": level,
            "message": message
        }) + "\n")

def run(cmd: List[str], cwd: Path = PROJECT_DIR, check: bool = True) -> Tuple[int, str, str]:
    """Execute command with error handling"""
    log(f"Executing: {' '.join(cmd)}", "STEP")

    result = subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True
    )

    if check and result.returncode != 0:
        log(f"Command failed: {result.stderr}", "ERROR")
        raise subprocess.CalledProcessError(result.returncode, cmd)

    return result.returncode, result.stdout, result.stderr

def check_git_status() -> bool:
    """Verify repo is clean before deploy"""
    log("Checking git status...", "STEP")

    _, stdout, _ = run(["git", "status", "--porcelain"], check=False)

    if stdout.strip():
        log("Uncommitted changes detected:", "WARNING")
        for line in stdout.strip().split("\n")[:5]:
            print(f"  {line}")

        response = input("Auto-commit changes? [Y/n]: ").strip().lower()
        if response in ("", "y", "yes"):
            run(["git", "add", "-A"])
            run(["git", "commit", "-m", f"keeper: auto-commit {datetime.now():%H:%M}"])
            log("Changes committed", "SUCCESS")
        else:
            log("Deploy aborted - uncommitted changes", "ERROR")
            return False

    return True

def run_tests() -> bool:
    """Pre-deploy test suite"""
    log("Running pre-deploy tests...", "STEP")

    tests = [
        ("Syntax check", ["node", "--check", "razor-master.js"]),
        ("Env check", ["grep", "-q", "RAZOR_MASTER_TOKEN", ".env"]),
    ]

    passed = 0
    for name, cmd in tests:
        try:
            run(cmd)
            log(f"✓ {name}", "SUCCESS")
            passed += 1
        except subprocess.CalledProcessError:
            log(f"✗ {name}", "ERROR")

    log(f"Tests: {passed}/{len(tests)} passed", "INFO")
    return passed == len(tests)

def deploy_services(dry_run: bool = False) -> bool:
    """Deploy services with zero-downtime restart"""
    log("Deploying services...", "STEP")

    if dry_run:
        log("DRY RUN - no changes made", "WARNING")
        return True

    for service in SERVICES:
        log(f"Restarting {service}...")

        try:
            run(["sudo", "systemctl", "restart", service])
            time.sleep(2)  # Brief pause for startup

            # Verify
            _, stdout, _ = run(["systemctl", "is-active", service], check=False)
            if stdout.strip() == "active":
                log(f"✓ {service} active", "SUCCESS")
            else:
                log(f"✗ {service} failed to start", "ERROR")
                return False

        except Exception as e:
            log(f"Deploy failed for {service}: {e}", "ERROR")
            return False

    return True

def verify_deployment() -> bool:
    """Post-deploy verification"""
    log("Verifying deployment...", "STEP")

    checks = [
        ("Razor process", ["pgrep", "-f", "razor-master"]),
        ("API port", ["ss", "-tlnp", "|", "grep", "9876"]),
    ]

    passed = 0
    for name, cmd in checks:
        try:
            run(cmd)
            log(f"✓ {name}", "SUCCESS")
            passed += 1
        except:
            log(f"✗ {name}", "ERROR")

    return passed == len(checks)

def send_notification(status: str):
    """Notify via Telegram bot"""
    log(f"Sending {status} notification...", "STEP")

    # Could integrate with deth1_bot here
    # For now, just log it
    log(f"Deploy {status} at {datetime.now():%H:%M}", "INFO")

def generate_report(start_time: float) -> dict:
    """Generate deployment report"""
    duration = time.time() - start_time

    report = {
        "timestamp": datetime.now().isoformat(),
        "duration_seconds": round(duration, 2),
        "services_deployed": SERVICES,
        "status": "success"
    }

    return report

def main():
    import argparse

    parser = argparse.ArgumentParser(
        description="SCRIPT KEEPER Deployment Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s --auto          Full automated deployment
    %(prog)s --dry-run       Test without deploying
    %(prog)s --notify        Deploy with notifications
        """
    )

    parser.add_argument("--auto", action="store_true", help="Auto-commit and deploy")
    parser.add_argument("--dry-run", action="store_true", help="Test only, no deployment")
    parser.add_argument("--notify", action="store_true", help="Send notifications")

    args = parser.parse_args()

    start_time = time.time()

    print(f"""
{Colors.HEADER}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════╗
║           SCRIPT KEEPER v2026.4 - Deployment                ║
║              Zero-Error Automation System                     ║
╚══════════════════════════════════════════════════════════════╝
{Colors.ENDC}
    """)

    try:
        # Pre-deploy checks
        if not check_git_status():
            sys.exit(1)

        if not run_tests():
            log("Tests failed - aborting", "ERROR")
            sys.exit(1)

        # Deploy
        if not deploy_services(dry_run=args.dry_run):
            log("Deployment failed", "ERROR")
            sys.exit(1)

        # Verify
        if not args.dry_run and not verify_deployment():
            log("Verification failed", "ERROR")
            sys.exit(1)

        # Report
        report = generate_report(start_time)

        print(f"""
{Colors.OKGREEN}{Colors.BOLD}
╔══════════════════════════════════════════════════════════════╗
║                    DEPLOYMENT SUCCESS                         ║
║                                                               ║
║  Duration: {report['duration_seconds']:>8.2f} seconds                              ║
║  Services: {len(report['services_deployed']):>8} deployed                          ║
║  Time:     {datetime.now().strftime('%H:%M:%S'):>8}                                  ║
╚══════════════════════════════════════════════════════════════╝
{Colors.ENDC}
        """)

        if args.notify:
            send_notification("success")

        # Save report
        report_file = PROJECT_DIR / "logs" / f"deploy_{datetime.now():%Y%m%d_%H%M%S}.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        with open(report_file, "w") as f:
            json.dump(report, f, indent=2)

        log(f"Report saved: {report_file}", "INFO")

    except KeyboardInterrupt:
        log("Deploy cancelled by user", "WARNING")
        sys.exit(130)
    except Exception as e:
        log(f"Unexpected error: {e}", "ERROR")
        sys.exit(1)

if __name__ == "__main__":
    main()
