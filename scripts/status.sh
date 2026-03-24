#!/bin/bash
# Botwave System Status - Zero API Cost Check
# SCRIPT KEEPER v2026.4

echo "=== BOTWAVE SYSTEM STATUS ==="
echo ""

# Check LM Studio
echo -n "Local LM Studio (127.0.0.1:1234): "
if curl -s http://127.0.0.1:1234/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"huihui-qwen3.5-9b-abliterated","messages":[{"role":"user","content":"OK"}]}' | grep -q "choices"; then
  echo "✓ ONLINE - Zero API Cost"
else
  echo "✗ OFFLINE - Start LM Studio"
fi

# Check Hub
echo -n "Botwave Hub (7 Telegram bots): "
if ps aux | grep -E "node hub.secure" | grep -v grep > /dev/null; then
  echo "✓ RUNNING"
  HUB_PID=$(pgrep -f "node hub.secure")
  echo "  PID: $HUB_PID"
else
  echo "✗ STOPPED - Run: node hub.secure.js &"
fi

# Check Server
echo -n "Dashboard Server (port 3001): "
if ps aux | grep -E "node server" | grep -v grep > /dev/null; then
  echo "✓ RUNNING"
  SERVER_PID=$(pgrep -f "node server")
  echo "  PID: $SERVER_PID"
else
  echo "✗ STOPPED - Run: node server.js &"
fi

# Check Orchestrator
echo -n "Orchestrator (Mobile Control): "
if ps aux | grep -E "node orchestrator" | grep -v grep > /dev/null; then
  echo "✓ RUNNING"
  ORCH_PID=$(pgrep -f "node orchestrator")
  echo "  PID: $ORCH_PID"
else
  echo "✗ STOPPED - Run: node orchestrator.js &"
fi

# Check Bots
echo ""
echo "=== TELEGRAM BOTS ==="
echo "Boti1904 (Plumber)     - @Boti1904"
echo "PaperChaser (Electrician) - @PaperChaser"
echo "Trades (HVAC)          - @Trades"
echo "Design (GC)            - @Design"
echo "Captain (Locksmith)    - @Captain"
echo "Business (Small Biz)   - @Business"
echo "Mamma (Restaurant)     - @Mamma"

# Check Logs
echo ""
echo "=== TODAY'S LOGS ==="
TODAY=$(date +%Y-%m-%d)
if [ -f "/home/gringo/Projects/botwave/logs/audit_$TODAY.log" ]; then
  LINES=$(wc -l < "/home/gringo/Projects/botwave/logs/audit_$TODAY.log")
  echo "Audit log: $LINES entries today"
else
  echo "No audit log yet (starts when calls come in)"
fi

# Check Data
echo ""
echo "=== CAPTURED LEADS ==="
if [ -f "/home/gringo/Projects/botwave/data/leads.json" ]; then
  LEADS=$(cat /home/gringo/Projects/botwave/data/leads.json | grep -c '"id"' 2>/dev/null || echo "0")
  echo "Total leads captured: $LEADS"
else
  echo "No leads captured yet"
fi

echo ""
echo "=== DASHBOARD URLS ==="
echo "Landing Page: http://localhost:3001"
echo "Agent Dashboard: http://localhost:3001/agent.html"
echo ""
echo "=== ALIASES ==="
echo "bw       - cd to botwave"
echo "bwstart  - start hub"
echo "bwstop   - stop hub"
echo "bwstatus - this command"
echo "bwtest   - test local model"
echo ""
