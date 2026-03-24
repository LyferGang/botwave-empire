#!/bin/bash
# Spawn Agent - Professional Agent Control
# ========================================
# Usage: spawn-agent.sh [agent] [task]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

AGENT=$1
TASK="${@:2}"

if [ -z "$AGENT" ]; then
    echo -e "${RED}Usage: spawn-agent.sh [agent] [task]${NC}"
    echo "Agents: claude, aider, kali"
    exit 1
fi

echo -e "${CYAN}🚀 Spawning $AGENT agent...${NC}"

cd /home/gringo/Projects/botwave

if [ -n "$TASK" ]; then
    node agent-bridge.js "$AGENT" "$TASK" &
    echo -e "${GREEN}✓ $AGENT spawned with task: $TASK${NC}"
else
    node agent-bridge.js "$AGENT" &
    echo -e "${GREEN}✓ $AGENT spawned${NC}"
fi

# Show PID
sleep 1
PID=$(pgrep -f "agent-bridge.*$AGENT" | head -1)
if [ -n "$PID" ]; then
    echo -e "${CYAN}  PID: $PID${NC}"
fi
