#!/bin/bash
# Termux Mobile Access Setup
# ==========================
# Run this on your Android device via Termux to access your mesh

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== TERMUX MESH ACCESS SETUP ===${NC}"
echo ""

# Install required packages
echo "Installing packages..."
pkg update -y
pkg install -y openssh curl jq termux-api

echo -e "${GREEN}✓ Packages installed${NC}"

# Create SSH directory
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Setup SSH config for mesh
cat > ~/.ssh/config << 'EOF'
# Botwave Empire - Tailscale Mesh
Host razor
    HostName 100.124.152.86
    User gringo
    Port 22
    ServerAliveInterval 60
    ServerAliveCountMax 3
    StrictHostKeyChecking accept-new

Host kali
    HostName 100.114.102.1
    User lyfer1904
    Port 22
    ServerAliveInterval 60
    StrictHostKeyChecking accept-new

Host pop-os
    HostName 100.124.152.86
    User gringo
    Port 22
    ServerAliveInterval 60

Host fyl
    HostName 100.114.102.1
    User lyfer1904
    Port 22
    ServerAliveInterval 60
EOF

chmod 600 ~/.ssh/config

echo -e "${GREEN}✓ SSH config created${NC}"

# Create convenience scripts
mkdir -p ~/bin

# Quick status check
cat > ~/bin/bw-status << 'EOF'
#!/bin/bash
echo "=== BOTWAVE EMPIRE STATUS ==="
echo ""
echo "Razor Master:"
ssh razor "ps aux | grep -E 'razor-master|node' | grep -v grep | head -3"
echo ""
echo "Botwave Hub:"
ssh razor "ps aux | grep hub.secure | grep -v grep"
echo ""
echo "Nodes:"
echo -n "pop-os: "
ping -c 1 -W 2 100.124.152.86 > /dev/null 2>&1 && echo "✓ ONLINE" || echo "✗ OFFLINE"
echo -n "fyl: "
ping -c 1 -W 2 100.114.102.1 > /dev/null 2>&1 && echo "✓ ONLINE" || echo "✗ OFFLINE"
EOF

# Spawn agent command
cat > ~/bin/bw-spawn << 'EOF'
#!/bin/bash
AGENT=$1
TASK="${@:2}"
if [ -z "$AGENT" ]; then
    echo "Usage: bw-spawn [agent] [task]"
    echo "Agents: claude, aider, kali"
    exit 1
fi
ssh razor "cd /home/gringo/Projects/botwave && node agent-bridge.js $AGENT '$TASK'"
EOF

# Stop agent command
cat > ~/bin/bw-stop << 'EOF'
#!/bin/bash
AGENT=$1
if [ -z "$AGENT" ]; then
    echo "Usage: bw-stop [agent]"
    echo "Agents: claude, aider, kali"
    exit 1
fi
ssh razor "pkill -f 'agent-bridge.js $AGENT'"
EOF

# Logs command
cat > ~/bin/bw-logs << 'EOF'
#!/bin/bash
ssh razor "cd /home/gringo/Projects/botwave && tail -50 logs/razor/razor_$(date +%Y-%m-%d).log"
EOF

# Quick SSH to nodes
cat > ~/bin/bw-razor << 'EOF'
#!/bin/bash
ssh -t razor "cd /home/gringo/Projects/botwave && exec bash"
EOF

cat > ~/bin/bw-kali << 'EOF'
#!/bin/bash
ssh -t kali
EOF

# Make executable
chmod +x ~/bin/bw-*

# Add to PATH if needed
if ! echo $PATH | grep -q "~/bin"; then
    echo 'export PATH="$HOME/bin:$PATH"' >> ~/.bashrc
fi

echo -e "${GREEN}✓ Commands installed${NC}"

echo ""
echo -e "${BLUE}=== SETUP COMPLETE ===${NC}"
echo ""
echo "Commands available:"
echo "  bw-status  - Check empire status"
echo "  bw-spawn   - Spawn an agent (bw-spawn claude 'fix bug')"
echo "  bw-stop    - Stop an agent (bw-stop claude)"
echo "  bw-logs    - View Razor logs"
echo "  bw-razor   - SSH to Razor node"
echo "  bw-kali    - SSH to Kali node"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC}"
echo "1. Copy your SSH key to the nodes:"
echo "   ssh-copy-id gringo@100.124.152.86"
echo "   ssh-copy-id lyfer1904@100.114.102.1"
echo ""
echo "2. Reload shell: source ~/.bashrc"
echo ""
echo "3. Test: bw-status"
