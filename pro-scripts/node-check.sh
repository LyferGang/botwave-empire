#!/bin/bash
# Node Check - Mesh Health Monitor
# ================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}🌐 Mesh Node Health Check${NC}\n"

# Check pop-os
echo -ne "  pop-os (100.124.152.86) ... "
if ping -c 1 -W 2 100.124.152.86 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ONLINE${NC}"
    # Check SSH
    echo -ne "    SSH ... "
    if ssh -o ConnectTimeout=3 -o BatchMode=yes gringo@100.124.152.86 "echo ok" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (key needed)${NC}"
    fi
else
    echo -e "${RED}✗ OFFLINE${NC}"
fi

# Check fyl
echo -ne "  fyl    (100.114.102.1)  ... "
if ping -c 1 -W 2 100.114.102.1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ ONLINE${NC}"
    echo -ne "    SSH ... "
    if ssh -o ConnectTimeout=3 -o BatchMode=yes lyfer1904@100.114.102.1 "echo ok" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠ (key needed)${NC}"
    fi
else
    echo -e "${RED}✗ OFFLINE${NC}"
fi

# Tailscale status
echo -e "\n${CYAN}Tailscale Status:${NC}"
tailscale status 2>/dev/null | grep -E "pop-os|fyl" | while read line; do
    echo "  $line"
done

echo -e "\n${CYAN}Quick Connect:${NC}"
echo "  ssh-razor  → Desktop"
echo "  ssh-kali   → Kali laptop"
