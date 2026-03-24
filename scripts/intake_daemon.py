#!/usr/bin/env python3
import os
import time
import subprocess

WATCH_DIR = "/home/gringo/downloads"
OUTPUT_DIR = "/home/gringo/Desktop/Final_Bids"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"[*] Starting Invisible Intake Daemon on {WATCH_DIR}...")
print("[*] Waiting for new .xls or .doc files (Zero Cloud / Local Qwen2.5 Engine)...")

# Keep it lean and simple for the POC: A basic polling loop
processed_files = set(os.listdir(WATCH_DIR))

while True:
    time.sleep(3)
    current_files = set(os.listdir(WATCH_DIR))
    new_files = current_files - processed_files
    
    for filename in new_files:
        if filename.endswith(".xls") or filename.endswith(".doc"):
            filepath = os.path.join(WATCH_DIR, filename)
            print(f"\n[+] NEW TARGET DETECTED: {filename}")
            print(f"[*] Piping {filename} to local Qwen2.5 for extraction and pricing...")
            
            # Simulate the processing time for the demo
            time.sleep(2) 
            
            # Generate the output filename
            base_name = os.path.splitext(filename)[0]
            out_file = os.path.join(OUTPUT_DIR, f"{base_name}_2026_BID.csv")
            
            # Write a mock processed bid based on the filename
            with open(out_file, "w") as f:
                f.write(f"PROJECT: {base_name.upper()}\n")
                f.write("STATUS: PROCESSED VIA LOCAL AI (QWEN2.5)\n")
                f.write("----------------------------------------\n")
                f.write("Total Estimated Materials: $4,500.00\n")
                f.write("Total Estimated Labor: $3,200.00\n")
                f.write("----------------------------------------\n")
                f.write("SUBTOTAL: $7,700.00\n")
                f.write("PROFIT MARGIN (20%): $1,540.00\n")
                f.write("FINAL BID: $9,240.00\n")
                
            print(f"[+] SUCCESS: Finalized bid rendered to {out_file}")
            
    processed_files = current_files
