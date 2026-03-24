#!/bin/bash
# Deth1 Status - Professional Empire Overview
# ===========================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Clear screen for pro look
clear

echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    🪙 DETH1 EMPIRE STATUS                        ║"
echo "║                      $(date '+%H:%M:%S')                             ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check Razor Master
RAZOR_PID=$(pgrep -f "razor-master.js" 2>/dev/null)
if [ -n "$RAZOR_PID" ]; then
    RAZOR_STATUS="${GREEN}● ONLINE${NC} (PID: $RAZOR_PID)"
else
    RAZOR_STATUS="${RED}● OFFLINE${NC}"
fi

# Check Botwave Hub
HUB_PID=$(pgrep -f "hub.secure.js" 2>/dev/null)
if [ -n "$HUB_PID" ]; then
    HUB_STATUS="${GREEN}● ONLINE${NC} (PID: $HUB_PID)"
else
    HUB_STATUS="${RED}● OFFLINE${NC}"
fi

# Check Tailscale
if systemctl is-active --quiet tailscaled 2>/dev/null; then
    TAIL_STATUS="${GREEN}● CONNECTED${NC}"
else
    TAIL_STATUS="${RED}● DISCONNECTED${NC}"
fi

echo -e "${CYAN}┌─ SERVICES ─────────────────────────────────────────────────────┐${NC}"
echo -e "│  Razor Master:  $RAZOR_STATUS"
echo -e "│  Botwave Hub:   $HUB_STATUS"
echo -e "│  Tailscale:     $TAIL_STATUS"
echo -e "${CYAN}└────────────────────────────────────────────────────────────────┘${NC}"

# Node status
echo -e "\n${CYAN}┌─ MESH NODES ───────────────────────────────────────────────────┐${NC}"
echo -n "│  pop-os (100.124.152.86): "
if ping -c 1 -W 2 100.124.152.86 > /dev/null 2>&1; then
    echo -e "${GREEN}● ONLINE${NC}  capabilities: coding, building, docker"
else
    echo -e "${RED}● OFFLINE${NC}"
fi

echo -n "│  fyl    (100.114.102.1):  "
if ping -c 1 -W 2 100.114.102.1 > /dev/null 2>&1; then
    echo -e "${GREEN}● ONLINE${NC}  capabilities: pentesting, security"
else
    echo -e "${RED}● OFFLINE${NC}"
fi
echo -e "${CYAN}└────────────────────────────────────────────────────────────────┘${NC}"

# Agent status
echo -e "\n${CYAN}┌─ AGENTS ───────────────────────────────────────────────────────┐${NC}"
for agent in claude aider kali; do
    AGENT_PID=$(pgrep -f "agent-bridge.*$agent" 2>/dev/null)
    if [ -n "$AGENT_PID" ]; then
        echo -e "│  ${GREEN}●${NC} $agent"
    else
        echo -e "│  ${RED}○${NC} $agent"
    fi
done
echo -e "${CYAN}└────────────────────────────────────────────────────────────────┘${NC}"

# Quick stats
echo -e "\n${CYAN}┌─ QUICK ACTIONS ────────────────────────────────────────────────┐${NC}"
echo -e "│  ${YELLOW}dt claude 'task'${NC}  → Spawn Claude agent              │"
echo -e "│  ${YELLOW}dt kali 'nmap'${NC}    → Spawn Kali pentesting          │"
echo -e "│  ${YELLOW}mesh-ssh pop-os${NC}   → SSH to desktop                  │"
echo -e "│  ${YELLOW}deth-deploy${NC}       → Git push + restart              │"
echo -e "${CYAN}└────────────────────────────────────────────────────────────────┘${NC}"

# Telegram reminder
echo -e "\n${YELLOW}💬 Telegram: @deth1_bot${NC} (send /status for full control)"
