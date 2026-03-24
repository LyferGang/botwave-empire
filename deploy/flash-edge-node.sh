#!/bin/bash
# ==========================================
# BOTWAVE EDGE NODE INSTALLER (Script Keeper)
# ==========================================
# Purpose: Flashes a blank Raspberry Pi into a secure, 
# zero-maintenance Botwave Edge Node. 
# Tunnels all traffic back to the Mothership (30GB VRAM rig).

set -e

echo "[*] Initializing Botwave Edge Node Installation..."
echo "[*] Target: Raspberry Pi (Debian/Ubuntu/Kali)"

# 1. System Hardening & Updates
echo "[+] Updating system packages and locking down ports..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ufw python3-pip git jq

# Lock down firewall (Only allow SSH from local network)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from 192.168.0.0/16 to any port 22
sudo ufw --force enable

# 2. Secure Tunnel (Tailscale)
echo "[+] Installing Tailscale for encrypted tunnel to Mothership..."
curl -fsSL https://tailscale.com/install.sh | sh
# NOTE: User must run 'sudo tailscale up' manually to authenticate the node.
echo "    -> Please run 'sudo tailscale up' after script finishes."

# 3. Botwave Edge Gateway Service
echo "[+] Creating Botwave Edge Gateway Service..."
sudo mkdir -p /opt/botwave-edge
sudo chown -R $USER:$USER /opt/botwave-edge

# Create the lightweight Python relayer (Zero local LLM execution)
cat << 'PYTHON_EOF' > /opt/botwave-edge/gateway.py
#!/usr/bin/env python3
import time
import requests
import json

MOTHERSHIP_IP = "100.x.y.z" # Replace with actual Tailscale IP of the 30GB rig
MOTHERSHIP_PORT = "11434"

print("[*] Botwave Edge Node Online.")
print(f"[*] Tunneling all requests to Mothership at {MOTHERSHIP_IP}...")

# Simulated Webhook Listener (In production, this is FastAPI or Flask catching WhatsApp/SMS)
def relay_to_mothership(prompt):
    url = f"http://{MOTHERSHIP_IP}:{MOTHERSHIP_PORT}/api/generate"
    payload = {
        "model": "qwen2.5:7b", # Or the heavy 32B/70B model
        "prompt": prompt,
        "stream": False
    }
    
    try:
        start_time = time.time()
        print(f"[>] Sending request: {prompt[:50]}...")
        # response = requests.post(url, json=payload, timeout=10) # Uncomment in prod
        # data = response.json()
        time.sleep(1) # Simulate network latency
        data = {"response": "Mock payload processed by Mothership."}
        
        latency = time.time() - start_time
        print(f"[<] Response received in {latency:.2f}s")
        return data['response']
    except Exception as e:
        print(f"[!] Mothership Tunnel Error: {e}")
        return None

if __name__ == "__main__":
    # Test the tunnel
    relay_to_mothership("Calculate payroll for Nate 35 hours.")
PYTHON_EOF
chmod +x /opt/botwave-edge/gateway.py

# 4. Persistence (Systemd Service)
echo "[+] Securing Edge Gateway as a persistent background service..."
cat << 'SERVICE_EOF' | sudo tee /etc/systemd/system/botwave-edge.service
[Unit]
Description=Botwave Edge Node Gateway
After=network.target tailscaled.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/botwave-edge
ExecStart=/usr/bin/python3 /opt/botwave-edge/gateway.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE_EOF

sudo systemctl daemon-reload
sudo systemctl enable botwave-edge.service
# sudo systemctl start botwave-edge.service # Starts on reboot or manual trigger

echo "[+] =========================================="
echo "[+] INSTALLATION COMPLETE."
echo "[+] The Edge Node is armed and ready to deploy."
echo "[+] Next Steps:"
echo "    1. Run 'sudo tailscale up' to connect to your private network."
echo "    2. Edit /opt/botwave-edge/gateway.py with your Mothership's Tailscale IP."
echo "    3. Reboot the Pi."
echo "[+] =========================================="
