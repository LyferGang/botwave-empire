#!/bin/bash
# Stop Agent - Professional Agent Control
# =======================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AGENT=$1

if [ -z "$AGENT" ]; then
    echo -e "${RED}Usage: stop-agent.sh [agent]${NC}"
    echo "Agents: claude, aider, kali"
    exit 1
fi

echo -e "${YELLOW}🛑 Stopping $AGENT...${NC}"

# Kill agent-bridge
pkill -f "agent-bridge.*$AGENT" 2>/dev/null

# Kill specific process types
if [ "$AGENT" = "claude" ]; then
    pkill -f "claude-code" 2>/dev/null
elif [ "$AGENT" = "aider" ]; then
    pkill -f "aider" 2>/dev/null
elif [ "$AGENT" = "kali" ]; then
    # Remote kill via SSH
    ssh -o ConnectTimeout=5 lyfer1904@100.114.102.1 "pkill -f kali-agent" 2>/dev/null
fi

echo -e "${GREEN}✓ $AGENT stopped${NC}"
