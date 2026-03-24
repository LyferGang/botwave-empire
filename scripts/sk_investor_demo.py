#!/usr/bin/env python3
"""
SK_Investor_Demo.py
BOTWAVE Investor Demo Script - Automated Flow

Shows: 2AM call → AI triage → dispatch → calendar → cost savings counter

Run: python sk_investor_demo.py
"""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, Any

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    RESET = '\033[0m'

# Demo data storage
DEMO_DIR = Path.home() / '.botwave' / 'demo'
DEMO_DIR.mkdir(parents=True, exist_ok=True)

class InvestorDemo:
    """Automated investor demo flow"""

    def __init__(self):
        self.scenario_data = {
            'plumber': {
                'name': 'Acme Plumbing',
                'owner': 'Mike Johnson',
                'phone': '+1-555-0123',
                'location': 'Seattle, WA'
            },
            'customer': {
                'name': 'Sarah Chen',
                'phone': '+1-555-0456',
                'issue': 'Water heater burst - flooding basement'
            },
            'pricing': {
                'solo': 299,
                'team': 399,
                'enterprise': 499
            },
            'savings': {
                'dispatcher_salary': 45000,  # Annual salary for dispatcher
                'missed_calls_value': 15000,  # Revenue from missed emergency calls
                'after_hours_premium': 12000,  # Extra revenue from 24/7 coverage
                'total_annual': 72000,
                'botwave_monthly': 399,
                'botwave_annual': 4788
            }
        }

    def print_header(self, title: str):
        """Print section header"""
        print(f"\n{Colors.HEADER}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}{title}{Colors.RESET}")
        print(f"{Colors.HEADER}{'='*60}{Colors.RESET}\n")
        time.sleep(0.5)

    def print_step(self, step_num: int, title: str, details: str = ''):
        """Print step in demo flow"""
        print(f"{Colors.CYAN}┌─────────────────────────────────────────────────────────┐{Colors.RESET}")
        print(f"{Colors.CYAN}│{Colors.RESET}  {Colors.BOLD}Step {step_num}: {title}{Colors.RESET}")
        if details:
            print(f"{Colors.CYAN}│{Colors.RESET}  {details}")
        print(f"{Colors.CYAN}└─────────────────────────────────────────────────────────┘{Colors.RESET}\n")

    def print_data(self, label: str, value: str, highlight: bool = False):
        """Print data point"""
        color = Colors.GREEN if highlight else Colors.RESET
        print(f"  {label}: {color}{value}{Colors.RESET}")

    def print_savings(self, label: str, amount: float, is_savings: bool = True):
        """Print savings/amount with formatting"""
        formatted = f"${amount:,.2f}"
        color = Colors.GREEN if is_savings else Colors.RED
        print(f"  {label}: {color}{formatted}{Colors.RESET}")

    def run_demo(self):
        """Run complete investor demo flow"""

        print(f"\n{Colors.BOLD}╔══════════════════════════════════════════════════════════╗{Colors.RESET}")
        print(f"{Colors.BOLD}║     BOTWAVE INVESTOR DEMO - 24/7 AI DISPATCH              ║{Colors.RESET}")
        print(f"{Colors.BOLD}╚══════════════════════════════════════════════════════════╝{Colors.RESET}")
        print(f"\n{Colors.YELLOW}Scenario: It's 2:17 AM. A customer's water heater bursts.{Colors.RESET}")
        print(f"{Colors.YELLOW}Watch how Botwave handles it automatically.{Colors.RESET}\n")
        time.sleep(1)

        # Step 1: Customer Call
        self.print_step(1, "Customer Call Received", "2:17 AM - Sarah Chen calls about flooding")
        self.print_data("Customer", self.scenario_data['customer']['name'])
        self.print_data("Phone", self.scenario_data['customer']['phone'])
        self.print_data("Issue", self.scenario_data['customer']['issue'])
        self.print_data("Time", "2:17 AM", True)
        time.sleep(1)

        # Step 2: AI Triage
        self.print_step(2, "AI Urgency Classification", "Analyzing call transcription...")
        self.print_data("Keywords Detected", "burst, flooding, water, emergency")
        self.print_data("Urgency Level", "CRITICAL", True)
        self.print_data("SLA Target", "15 minutes")
        time.sleep(1)

        # Step 3: Auto-Dispatch
        self.print_step(3, "Automatic Dispatch", "Notifying on-call plumber")
        self.print_data("Plumber", self.scenario_data['plumber']['owner'])
        self.print_data("Company", self.scenario_data['plumber']['name'])
        self.print_data("Notification", "Telegram + SMS")
        self.print_data("Dispatched At", datetime.now().strftime('%I:%M %p'), True)
        time.sleep(1)

        # Step 4: Calendar Booking
        self.print_step(4, "Calendar Auto-Booking", "Job added to plumber's schedule")
        self.print_data("Job ID", "JOB-" + datetime.now().strftime('%Y%m%d') + "-001")
        self.print_data("Scheduled", "3:00 AM (43 minutes from call)")
        self.print_data("Customer Notified", "SMS confirmation sent")
        time.sleep(1)

        # Step 5: Revenue Captured
        self.print_step(5, "Revenue Captured", "Job that would have been missed")
        self.print_data("Job Value", "$450 (emergency call-out)", True)
        self.print_data("Without Botwave", "Call goes to voicemail → Customer calls competitor")
        self.print_data("Revenue Lost", "$450", False)
        time.sleep(1)

        # Cost Savings Presentation
        self.print_header("💰 COST SAVINGS ANALYSIS")

        print(f"{Colors.BOLD}Annual Costs WITHOUT Botwave:{Colors.RESET}\n")
        self.print_savings("Dispatcher Salary", self.scenario_data['savings']['dispatcher_salary'], False)
        self.print_savings("Missed Calls (Lost Revenue)", self.scenario_data['savings']['missed_calls_value'], False)
        self.print_savings("After Hours Coverage (Lost)", self.scenario_data['savings']['after_hours_premium'], False)
        print(f"  ─────────────────────────────────")
        total_without = self.scenario_data['savings']['total_annual']
        print(f"  {Colors.BOLD}Total Annual Cost: ${total_without:,}{Colors.RESET}\n")

        print(f"{Colors.BOLD}Annual Costs WITH Botwave ({self.scenario_data['plumber']['name']}):{Colors.RESET}\n")
        self.print_savings("Botwave Team Plan", self.scenario_data['savings']['botwave_annual'], False)
        print(f"  ─────────────────────────────────")
        total_with = self.scenario_data['savings']['botwave_annual']
        print(f"  {Colors.BOLD}Total Annual Cost: ${total_with:,}{Colors.RESET}\n")

        print(f"{Colors.BOLD}NET SAVINGS:{Colors.RESET}\n")
        savings = total_without - total_with
        self.print_savings("Annual Savings", savings, True)
        self.print_savings("Monthly Savings", savings / 12, True)
        self.print_savings("ROI", (savings / total_with) * 100, True)
        print()

        # ROI Calculator
        self.print_header("📊 ROI BREAKDOWN")
        print(f"  Investment: ${self.scenario_data['savings']['botwave_annual']:,}/year")
        print(f"  Return: ${savings:,}/year")
        print(f"  Payback Period: {self.scenario_data['savings']['botwave_annual'] / (savings / 12):.1f} months")
        print(f"  LTV:CAC Ratio: 36:1 (industry: 3:1)")
        print()

        # Close
        self.print_header("✅ DEMO COMPLETE")
        print(f"{Colors.GREEN}Botwave delivers:{Colors.RESET}")
        print(f"  • 24/7 coverage without hiring")
        print(f"  • Zero missed emergency calls")
        print(f"  • ${savings:,}/year in costs saved")
        print(f"  • 3-5x revenue lift from captured jobs")
        print()
        print(f"{Colors.CYAN}Pricing:{Colors.RESET}")
        print(f"  • Solo: ${self.scenario_data['pricing']['solo']}/mo (500 dispatches)")
        print(f"  • Team: ${self.scenario_data['pricing']['team']}/mo (unlimited)")
        print(f"  • Enterprise: ${self.scenario_data['pricing']['enterprise']}/mo (multi-location)")
        print()
        print(f"{Colors.GREEN}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}Questions?{Colors.RESET}")
        print(f"{Colors.GREEN}{'='*60}{Colors.RESET}\n")

    def save_demo_data(self):
        """Save demo data for review"""
        output_file = DEMO_DIR / 'demo_scenario.json'
        with open(output_file, 'w') as f:
            json.dump(self.scenario_data, f, indent=2)
        print(f"Demo data saved to: {output_file}")

    def generate_one_pager(self):
        """Generate investor one-pager"""
        output_file = DEMO_DIR / 'investor_onepager.txt'

        content = f"""
BOTWAVE INVESTOR ONE-PAGER
{'='*50}

PROBLEM
- Plumbers miss 40% of after-hours calls
- Each missed emergency = $300-500 lost revenue
- Hiring dispatcher = $45k/year minimum

SOLUTION
- 24/7 AI dispatch at $399/month
- Auto triage, scheduling, customer notification
- Zero missed calls, zero hiring needed

MARKET
- 75,000 plumbing businesses in US
- TAM: $2.4B (10% adoption at $399/mo)
- SAM: 15,000 small plumbers (2-15 employees)

TRACTION
- Working PoC with {self.scenario_data['plumber']['name']}
- Pilot: 3 plumbers at $150/mo (beta pricing)
- Waitlist: 100+ plumbers

FINANCIALS
- Year 1: $897k ARR (3 pilots → 10 customers)
- Year 2: $3.5M ARR (50 customers)
- Year 3: $10M ARR (150 customers + MSP partners)

ASK
- Raising: $500k-2M pre-seed
- Use: Sales hire, infrastructure, compliance
- Runway: 18 months to Series A

CONTACT
hello@botwave.io
"""

        with open(output_file, 'w') as f:
            f.write(content)
        print(f"One-pager saved to: {output_file}")

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Botwave Investor Demo')
    parser.add_argument('--full', action='store_true', help='Run full demo with one-pager')
    parser.add_argument('--quick', action='store_true', help='Quick demo (savings only)')
    parser.add_argument('--save', action='store_true', help='Save demo data')

    args = parser.parse_args()

    demo = InvestorDemo()

    if args.quick:
        demo.print_header("💰 BOTWAVE COST SAVINGS")
        savings = demo.scenario_data['savings']['total_annual'] - demo.scenario_data['savings']['botwave_annual']
        print(f"Annual Savings: ${savings:,}")
        print(f"Monthly Savings: ${savings/12:,.2f}")
        print(f"ROI: {(savings / demo.scenario_data['savings']['botwave_annual']) * 100:.0f}%")
    elif args.full:
        demo.run_demo()
        demo.generate_one_pager()
    else:
        demo.run_demo()

    if args.save:
        demo.save_demo_data()
