#!/bin/bash
# Quick Task - Assign Task to Agent
# ================================
# Usage: quick-task.sh [agent] [task]

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

AGENT=$1
shift
TASK="$@"

if [ -z "$AGENT" ] || [ -z "$TASK" ]; then
    echo -e "${YELLOW}Usage: dt [agent] [task]${NC}"
    echo "Example: dt claude fix the login bug"
    echo "         dt kali nmap -sV 192.168.1.1"
    exit 1
fi

echo -e "${CYAN}🎯 Assigning task to $AGENT${NC}"
echo -e "   Task: $TASK\n"

cd /home/gringo/Projects/botwave

# Check if agent is already running
PID=$(pgrep -f "agent-bridge.*$AGENT" 2>/dev/null)

if [ -n "$PID" ]; then
    # Agent running - could send task via IPC or restart
    echo -e "${YELLOW}⚠ Agent already running (PID: $PID)${NC}"
    echo -e "   ${GREEN}Restarting with new task...${NC}"
    pkill -f "agent-bridge.*$AGENT" 2>/dev/null
    sleep 1
fi

# Spawn with task
node agent-bridge.js "$AGENT" "$TASK" &

echo -e "${GREEN}✓ Task assigned${NC}"
echo -e "   Use ${CYAN}dl $AGENT${NC} to view logs"
