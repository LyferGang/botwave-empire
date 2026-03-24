#!/bin/bash
# Botwave Poor Man's Forge - Startup Script
# Usage: ./start-forge.sh

set -e

echo "🚀 Starting Botwave Forge..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check Ollama
echo -n "📡 Checking Ollama... "
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Starting Ollama...${NC}"
    ollama serve &
    sleep 3
fi

# Check OpenClaw
echo -n "🦞 Checking OpenClaw... "
if lsof -i :18789 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running on port 18789${NC}"
else
    echo -e "${YELLOW}⚠ Starting OpenClaw...${NC}"
    source ~/.apiconfig/botwave.env
    openclaw gateway --port 18789 --verbose &
    sleep 5
fi

# Show status
echo ""
echo "📊 Status:"
echo "  Ollama:   http://localhost:11434"
echo "  OpenClaw: ws://localhost:18789"
echo "  Telegram: @Boti1904_bot"
echo ""
echo "🔗 Test: Send /critique to Telegram bot"
echo ""
echo "Press Ctrl+C to stop, or run 'openclaw gateway stop' to kill"

# Wait
wait
