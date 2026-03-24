#!/bin/bash
# View Logs - Professional Log Viewer
# ===================================
# Usage: view-logs.sh [agent]

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AGENT=$1
LOG_DIR="/home/gringo/Projects/botwave/logs"

echo -e "${CYAN}📝 Recent Logs${NC}\n"

if [ -n "$AGENT" ]; then
    # Agent-specific logs
    LOG_FILE="$LOG_DIR/agents/${AGENT}.log"
    if [ -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}Last 20 lines of $AGENT logs:${NC}"
        tail -20 "$LOG_FILE" | while IFS= read -r line; do
            echo "  $line"
        done
    else
        echo -e "${YELLOW}No logs for $AGENT yet${NC}"
    fi
else
    # Razor master logs
    LOG_FILE="$LOG_DIR/razor/razor_$(date +%Y-%m-%d).log"
    if [ -f "$LOG_FILE" ]; then
        echo -e "${YELLOW}Last 15 log entries:${NC}\n"
        tail -15 "$LOG_FILE" | while IFS= read -r line; do
            # Try to parse JSON
            if echo "$line" | jq -e . >/dev/null 2>&1; then
                TIMESTAMP=$(echo "$line" | jq -r '.timestamp' | cut -d'T' -f2 | cut -d'.' -f1)
                ACTION=$(echo "$line" | jq -r '.action')
                echo -e "  ${GREEN}[${TIMESTAMP}]${NC} $ACTION"
            else
                echo "  $line"
            fi
        done
    else
        # Fallback to audit logs
        AUDIT_LOG="$LOG_DIR/audit_$(date +%Y-%m-%d).log"
        if [ -f "$AUDIT_LOG" ]; then
            tail -15 "$AUDIT_LOG"
        else
            echo -e "${YELLOW}No logs found${NC}"
        fi
    fi
fi

echo -e "\n${CYAN}💡 Tip: Use 'deth-watch $AGENT' to spawn and follow logs${NC}"
