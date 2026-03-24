#!/usr/bin/env python3
import sys
import json
import csv
import subprocess
from datetime import datetime

# Local database (No cloud, no SaaS)
EMPLOYEES = {
    "nate fry": {"rate": 25.0},
    "xavier leandro": {"rate": 25.0}
}

def parse_text_with_ollama(text):
    prompt = f"""
    You are a data extraction bot. 
    Extract the employee names and the number of hours they worked from the following text.
    Return ONLY a valid JSON array of objects with keys "name" and "hours". Do not include markdown formatting or any other text.
    
    Text: "{text}"
    """
    
    try:
        result = subprocess.run(
            ['ollama', 'run', 'qwen2.5:7b', prompt],
            capture_output=True, text=True, check=True
        )
        # Clean up output just in case
        output = result.stdout.strip()
        if output.startswith("```json"):
            output = output[7:-3].strip()
        return json.loads(output)
    except Exception as e:
        print(f"Error parsing with local AI: {e}")
        return []

def generate_payroll(raw_text):
    print(f"[*] Intercepted WhatsApp Message: '{raw_text}'")
    print("[*] Piping to local Qwen2.5 model for extraction...")
    
    extracted_data = parse_text_with_ollama(raw_text)
    
    if not extracted_data:
        print("[-] Failed to extract data.")
        return

    report = []
    total_payroll = 0
    
    for entry in extracted_data:
        name = entry.get('name', '').lower()
        hours = float(entry.get('hours', 0))
        
        # Fuzzy match or exact match
        matched_employee = None
        for db_name in EMPLOYEES.keys():
            if db_name.split()[0] in name or name in db_name:
                matched_employee = db_name
                break
                
        if matched_employee:
            rate = EMPLOYEES[matched_employee]['rate']
            
            # Calculate Overtime (Time and a half over 40)
            if hours > 40:
                reg_hours = 40
                ot_hours = hours - 40
                pay = (reg_hours * rate) + (ot_hours * rate * 1.5)
            else:
                reg_hours = hours
                ot_hours = 0
                pay = hours * rate
                
            report.append({
                "Employee": matched_employee.title(),
                "Rate": f"${rate:.2f}/hr",
                "Regular Hours": reg_hours,
                "OT Hours": ot_hours,
                "Total Hours": hours,
                "Gross Pay": f"${pay:.2f}"
            })
            total_payroll += pay
        else:
            print(f"[!] Warning: Unknown employee '{name}' mentioned.")

    # Write to CSV
    date_str = datetime.now().strftime("%Y-%m-%d")
    filename = f"/home/gringo/Projects/botwave/payroll_{date_str}.csv"
    
    if report:
        keys = report[0].keys()
        with open(filename, 'w', newline='') as f:
            dict_writer = csv.DictWriter(f, keys)
            dict_writer.writeheader()
            dict_writer.writerows(report)
            # Add total row
            f.write(f",,,,TOTAL PAYROLL:,${total_payroll:.2f}\n")
            
        print(f"[+] SUCCESS! Payroll generated instantly at: {filename}")
        print(f"[+] Total Payout: ${total_payroll:.2f}")
    else:
        print("[-] No valid employees found in the text.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = " ".join(sys.argv[1:])
    else:
        text = "Nate did 35 hours and Xavier knocked out his 40."
    generate_payroll(text)
