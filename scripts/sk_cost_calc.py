#!/usr/bin/env python3
"""
SK_Cost_Calculator.py
BOTWAVE Cost Savings Calculator

Calculates ROI for plumbing businesses considering AI dispatch.
Outputs formatted table, JSON, and presentation-ready stats.

Run: python sk_cost_calc.py --help
"""

import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

# Output directory
OUTPUT_DIR = Path.home() / '.botwave' / 'calculations'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

class CostCalculator:
    """Calculate ROI and cost savings for Botwave"""

    def __init__(self, company_name: str = "Demo Plumbing"):
        self.company_name = company_name
        self.defaults = {
            # Current costs (without Botwave)
            'dispatcher_salary': 45000,  # Annual salary for full-time dispatcher
            'dispatcher_benefits': 12000,  # Benefits, payroll tax, insurance
            'answering_service': 0,  # If using external service (optional)
            'missed_calls_per_month': 20,  # Average missed after-hours calls
            'avg_job_value': 350,  # Average revenue per plumbing job
            'after_hours_premium': 1.5,  # Emergency jobs worth 1.5x normal

            # Botwave pricing
            'botwave_solo': 299,
            'botwave_team': 399,
            'botwave_enterprise': 499,
        }

    def calculate_annual_costs(self, plan: str = 'team') -> Dict[str, Any]:
        """Calculate annual costs with and without Botwave"""

        # Without Botwave
        dispatcher_total = self.defaults['dispatcher_salary'] + self.defaults['dispatcher_benefits']
        missed_calls_annual = self.defaults['missed_calls_per_month'] * 12
        missed_revenue = missed_calls_annual * self.defaults['avg_job_value'] * self.defaults['after_hours_premium']
        answering_service = self.defaults['answering_service'] * 12

        total_without = dispatcher_total + missed_revenue + answering_service

        # With Botwave
        plan_pricing = {
            'solo': self.defaults['botwave_solo'],
            'team': self.defaults['botwave_team'],
            'enterprise': self.defaults['botwave_enterprise']
        }
        botwave_annual = plan_pricing.get(plan, self.defaults['botwave_team']) * 12

        total_with = botwave_annual

        # Savings
        annual_savings = total_without - total_with
        monthly_savings = annual_savings / 12
        roi_percent = ((annual_savings - botwave_annual) / botwave_annual) * 100
        payback_months = botwave_annual / (annual_savings / 12) if annual_savings > 0 else float('inf')

        return {
            'company_name': self.company_name,
            'calculation_date': datetime.now().isoformat(),
            'plan': plan,
            'without_botwave': {
                'dispatcher_salary': self.defaults['dispatcher_salary'],
                'dispatcher_benefits': self.defaults['dispatcher_benefits'],
                'missed_calls_annual': missed_calls_annual,
                'missed_revenue': missed_revenue,
                'answering_service': answering_service,
                'total_annual': total_without
            },
            'with_botwave': {
                'plan': plan,
                'monthly_cost': botwave_annual / 12,
                'annual_cost': botwave_annual,
                'total_annual': total_with
            },
            'savings': {
                'annual': annual_savings,
                'monthly': monthly_savings,
                'roi_percent': round(roi_percent, 1),
                'payback_months': round(payback_months, 1),
                'ltv_cac_ratio': '36:1'  # Industry benchmark
            }
        }

    def print_table(self, results: Dict[str, Any]):
        """Print formatted cost comparison table"""

        print("\n" + "=" * 70)
        print(f"  BOTWAVE COST ANALYSIS: {results['company_name']}")
        print(f"  Plan: {results['with_botwave']['plan'].title()} | Date: {results['calculation_date'][:10]}")
        print("=" * 70)

        print("\n📊 ANNUAL COSTS WITHOUT BOTWAVE\n")
        print(f"  Dispatcher Salary:          ${results['without_botwave']['dispatcher_salary']:>12,}")
        print(f"  Dispatcher Benefits:        ${results['without_botwave']['dispatcher_benefits']:>12,}")
        print(f"  Missed Calls (Lost Rev):    ${results['without_botwave']['missed_revenue']:>12,}")
        print(f"  Answering Service:          ${results['without_botwave']['answering_service']:>12,}")
        print("  " + "-" * 46)
        print(f"  TOTAL:                      ${results['without_botwave']['total_annual']:>12,}")

        print("\n📊 ANNUAL COSTS WITH BOTWAVE\n")
        print(f"  Botwave {results['with_botwave']['plan'].title()} Plan:      ${results['with_botwave']['annual_cost']:>12,}")
        print("  " + "-" * 46)
        print(f"  TOTAL:                      ${results['with_botwave']['total_annual']:>12,}")

        print("\n💰 NET SAVINGS\n")
        savings = results['savings']
        print(f"  Annual Savings:             ${savings['annual']:>12,}")
        print(f"  Monthly Savings:            ${savings['monthly']:>12,.2f}")
        print(f"  ROI:                        {savings['roi_percent']:>12.1f}%")
        print(f"  Payback Period:             {savings['payback_months']:>12.1f} months")
        print(f"  LTV:CAC Ratio:              {savings['ltv_cac_ratio']:>12}")

        print("\n" + "=" * 70)

    def print_summary(self, results: Dict[str, Any]):
        """Print executive summary"""

        savings = results['savings']

        print("\n" + "=" * 70)
        print(f"  EXECUTIVE SUMMARY: {results['company_name']}")
        print("=" * 70)

        print(f"\n  Switching to Botwave {results['with_botwave']['plan'].title()} saves:")
        print(f"\n  💵 ${savings['annual']:>10,.0f} per year")
        print(f"  💵 ${savings['monthly']:>10,.2f} per month")
        print(f"  📈 {savings['roi_percent']:>10.1f}% ROI")
        print(f"  ⏱️  {savings['payback_months']:>10.1f} month payback")

        print("\n  Compared to:")
        print(f"  • Hiring dispatcher: ${self.defaults['dispatcher_salary'] + self.defaults['dispatcher_benefits']:,}/year")
        print(f"  • Missing {self.defaults['missed_calls_per_month']}/month calls: ${results['without_botwave']['missed_revenue']:,}/year lost")

        print("\n" + "=" * 70)

    def save_json(self, results: Dict[str, Any]):
        """Save results to JSON file"""

        filename = OUTPUT_DIR / f"cost_analysis_{self.company_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.json"
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n💾 Results saved to: {filename}")

    def save_csv(self, results: Dict[str, Any]):
        """Save results to CSV for spreadsheet import"""

        filename = OUTPUT_DIR / f"cost_analysis_{self.company_name.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.csv"

        csv_content = f"""Metric,Value
Company Name,{results['company_name']}
Date,{results['calculation_date']}
Plan,{results['with_botwave']['plan']}

Without Botwave - Dispatcher Salary,{results['without_botwave']['dispatcher_salary']}
Without Botwave - Dispatcher Benefits,{results['without_botwave']['dispatcher_benefits']}
Without Botwave - Missed Revenue,{results['without_botwave']['missed_revenue']}
Without Botwave - Answering Service,{results['without_botwave']['answering_service']}
Without Botwave - Total,{results['without_botwave']['total_annual']}

With Botwave - Plan,{results['with_botwave']['plan']}
With Botwave - Monthly Cost,{results['with_botwave']['monthly_cost']}
With Botwave - Annual Cost,{results['with_botwave']['annual_cost']}
With Botwave - Total,{results['with_botwave']['total_annual']}

Savings - Annual,{results['savings']['annual']}
Savings - Monthly,{results['savings']['monthly']}
Savings - ROI %, {results['savings']['roi_percent']}
Savings - Payback Months,{results['savings']['payback_months']}
"""

        with open(filename, 'w') as f:
            f.write(csv_content)
        print(f"📊 CSV saved to: {filename}")

    def interactive_mode(self):
        """Run interactive calculator with user inputs"""

        print("\n" + "=" * 70)
        print("  BOTWAVE COST CALCULATOR - Interactive Mode")
        print("=" * 70)

        self.company_name = input("\nCompany Name [Demo Plumbing]: ") or "Demo Plumbing"

        print("\n--- Current Costs ---")
        self.defaults['dispatcher_salary'] = int(input(f"Dispatcher Annual Salary [{self.defaults['dispatcher_salary']}]: ") or self.defaults['dispatcher_salary'])
        self.defaults['dispatcher_benefits'] = int(input(f"Benefits/Payroll Tax [{self.defaults['dispatcher_benefits']}]: ") or self.defaults['dispatcher_benefits'])
        self.defaults['missed_calls_per_month'] = int(input(f"Missed Calls/Month [{self.defaults['missed_calls_per_month']}]: ") or self.defaults['missed_calls_per_month'])
        self.defaults['avg_job_value'] = int(input(f"Average Job Value [{self.defaults['avg_job_value']}]: ") or self.defaults['avg_job_value'])
        self.defaults['answering_service'] = int(input(f"Current Answering Service Monthly Cost [0]: ") or 0)

        print("\n--- Botwave Plan Selection ---")
        print("  1. Solo   - $299/mo  (500 dispatches)")
        print("  2. Team   - $399/mo  (unlimited)")
        print("  3. Enterprise - $499/mo  (multi-location)")

        plan_choice = input("\nSelect plan [2]: ") or "2"
        plan_map = {"1": "solo", "2": "team", "3": "enterprise"}
        plan = plan_map.get(plan_choice, "team")

        return plan


def main():
    parser = argparse.ArgumentParser(description='Botwave Cost Savings Calculator')
    parser.add_argument('--company', type=str, default='Demo Plumbing', help='Company name')
    parser.add_argument('--plan', type=str, default='team', choices=['solo', 'team', 'enterprise'], help='Botwave plan')
    parser.add_argument('--interactive', action='store_true', help='Interactive mode')
    parser.add_argument('--json', action='store_true', help='Save JSON output')
    parser.add_argument('--csv', action='store_true', help='Save CSV output')
    parser.add_argument('--summary', action='store_true', help='Show summary only')

    args = parser.parse_args()

    calc = CostCalculator(args.company)

    if args.interactive:
        plan = calc.interactive_mode()
        results = calc.calculate_annual_costs(plan)
    else:
        results = calc.calculate_annual_costs(args.plan)

    if args.summary:
        calc.print_summary(results)
    else:
        calc.print_table(results)
        calc.print_summary(results)

    if args.json:
        calc.save_json(results)

    if args.csv:
        calc.save_csv(results)

    # Demo mode - show quick stats
    if not args.interactive and not args.json and not args.csv:
        print("\n💡 Tip: Use --interactive to customize for your prospect")
        print("   Use --json to save for investor deck")
        print("   Use --company 'Acme Plumbing' to customize\n")


if __name__ == '__main__':
    main()
