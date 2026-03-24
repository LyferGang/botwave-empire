#!/bin/bash
# Botwave Orchestrator Setup - Mobile Phone Control
# SCRIPT KEEPER v2026.4

echo "=== BOTWAVE ORCHESTRATOR SETUP ==="
echo ""
echo "This creates a private Telegram bot ONLY YOU can control."
echo "Run your entire empire from your phone."
echo ""

# Step 1: Create bot via BotFather
echo "STEP 1: Create Telegram Bot"
echo ""
echo "1. Open Telegram"
echo "2. Message: @BotFather"
echo "3. Send: /newbot"
echo "4. Name: 'Botwave Orchestrator'"
echo "5. Username: 'BotwaveControlBot' (or any available)"
echo "6. BotFather gives you a TOKEN"
echo ""
read -p "Paste your bot token: " TOKEN

if [ -z "$TOKEN" ]; then
  echo "❌ Token required"
  exit 1
fi

# Step 2: Get your Telegram ID
echo ""
echo "STEP 2: Get Your Telegram ID"
echo ""
echo "1. Message: @userinfobot"
echo "2. It replies with your ID (numbers)"
echo ""
read -p "Your Telegram ID: " USERID

if [ -z "$USERID" ]; then
  echo "❌ User ID required"
  exit 1
fi

# Step 3: Update .env
echo ""
echo "STEP 3: Updating .env..."

cd /home/gringo/Projects/botwave

# Backup existing .env
cp .env .env.backup.$(date +%Y%m%d%H%M%S)

# Update orchestrator vars
sed -i "/^TELEGRAM_ORCHESTRATOR_TOKEN=/c\\TELEGRAM_ORCHESTRATOR_TOKEN=$TOKEN" .env
sed -i "/^ORCHESTRATOR_OWNER_ID=/c\\ORCHESTRATOR_OWNER_ID=$USERID" .env

echo "✅ .env updated"
echo ""
echo "Token: $TOKEN"
echo "Owner ID: $USERID"

# Step 4: Test
echo ""
echo "STEP 4: Test Orchestrator"
echo ""
echo "Starting orchestrator bot..."
node orchestrator.js &
ORCH_PID=$!
sleep 2

if ps -p $ORCH_PID > /dev/null; then
  echo "✅ Orchestrator running (PID: $ORCH_PID)"
  echo ""
  echo "Now test on your phone:"
  echo "1. Open Telegram"
  echo "2. Search: your bot username"
  echo "3. Send: /start"
  echo "4. Try: /stats, /bots, /spawn"
  echo ""
  echo "To stop: kill $ORCH_PID"
else
  echo "❌ Orchestrator failed to start"
  exit 1
fi

echo "=== SETUP COMPLETE ==="
