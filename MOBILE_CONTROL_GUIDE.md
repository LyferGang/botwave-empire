# Botwave Mobile Control Guide
**Run Your Empire From Your Phone**

---

## WHAT YOU GET

A private Telegram bot that **only YOU** can control:

- Start/stop all 7 customer bots
- Spawn Razor agent from your phone
- View stats, leads, logs instantly
- Check LM Studio status
- Calculate captured revenue
- Full empire control in your pocket

---

## SETUP (5 minutes)

### Step 1: Create Your Private Bot

1. Open Telegram
2. Message: `@BotFather`
3. Send: `/newbot`
4. Name: `Botwave Orchestrator`
5. Username: `BotwaveControlBot` (or any available)
6. BotFather replies with a **TOKEN** (looks like: `123456789:AAH...`)

**Save this token.**

---

### Step 2: Get Your Telegram ID

1. Message: `@userinfobot`
2. It replies instantly with your ID (numbers like: `87474071`)

**Save this ID.**

---

### Step 3: Configure

```bash
cd /home/gringo/Projects/botwave
./scripts/setup-orchestrator.sh
```

Paste your:
- Bot token
- Telegram ID

Script updates `.env` automatically.

---

### Step 4: Start Orchestrator

```bash
node orchestrator.js &
```

Or add to alias:
```bash
bworch  # starts orchestrator
```

---

## PHONE COMMANDS

### Empire Control

| Command | What It Does |
|---------|--------------|
| `/start` | Main menu |
| `/bots` | List all 7 bots with status |
| `/startbot` | Start the hub (all 7 bots) |
| `/stopbot` | Stop the hub |
| `/restart` | Restart hub |
| `/testbot` | Test flow instructions |

---

### Razor Agent

| Command | What It Does |
|---------|--------------|
| `/spawn` | Spawn Razor agent (local-forge) |
| `/razorstatus` | Check Razor containers/processes |
| `/razorstop` | Stop all Razor containers |

---

### Analytics

| Command | What It Does |
|---------|--------------|
| `/stats` | Leads, tickets, messages, log count |
| `/leads` | Last 10 captured leads with value |
| `/logs` | Today's audit log entries |
| `/revenue` | Total captured revenue $$ |

---

### System

| Command | What It Does |
|---------|--------------|
| `/lmstudio` | Test local model endpoint |
| `/dashboard` | Dashboard URLs |
| `/help` | All commands list |

---

## SECURITY

**Only YOUR Telegram ID can use commands.**

Anyone else who messages the bot gets:
```
⛔ ACCESS DENIED

This bot is for owner only.
```

Your `.env` has:
```
TELEGRAM_ORCHESTRATOR_TOKEN=your_bot_token
ORCHESTRATOR_OWNER_ID=your_telegram_id
```

---

## EXAMPLE WORKFLOW

### From Your Couch

```
You: /stats
Bot: 📊 BOTWAVE STATS
     Leads captured: 5
     Tickets: 2
     Messages: 12
     Log entries today: 47

You: /leads
Bot: 📋 CAPTURED LEADS
     1. Plumber - $450
        3/23/2026 10:15 PM
     2. Electrician - $350
        3/23/2026 9:42 PM
     ...

You: /revenue
Bot: 💰 REVENUE CAPTURED
     Total leads: 5
     Total value: $2,050
```

---

### Spawn Razor From Phone

```
You: /spawn
Bot: 🪙 Spawning Razor agent...
     ✅ Razor spawned

     Running npm run spawn -- razor
     Pulling Docker image...
     Starting container...
     Razor ready.
```

---

### Check System Health

```
You: /lmstudio
Bot: ✅ LM STUDIO: ONLINE
     Model: huihui-qwen3.5-9b-abliterated
     Endpoint: 127.0.0.1:1234
     Cost: $0 (local)

You: /bots
Bot: 📞 BOTWAVE HUB STATUS: 🟢 RUNNING

     • Boti1904 (Plumber)
       @Boti1904
     • PaperChaser (Electrician)
       @PaperChaser
     ...
```

---

## DASHBOARD ON PHONE

Open in mobile browser:
```
http://localhost:3001
http://localhost:3001/agent.html
```

See:
- Loss calculator
- 7 vertical cards
- Agent control panel
- Stats bar

---

## ALIASES

Add to `~/.bash_aliases`:

```bash
# Orchestrator control
bworch() { cd /home/gringo/Projects/botwave && node orchestrator.js & }
bworchstop() { pkill -f "node orchestrator" }
```

Usage:
```bash
bworch       # start orchestrator
bworchstop   # stop orchestrator
```

---

## TROUBLESHOOTING

### Bot doesn't reply

1. Check orchestrator running:
   ```bash
   ps aux | grep "node orchestrator"
   ```

2. Check token in `.env`:
   ```bash
   grep TELEGRAM_ORCHESTRATOR_TOKEN .env
   ```

3. Restart:
   ```bash
   pkill -f "node orchestrator"
   node orchestrator.js &
   ```

---

### "Access Denied"

- Only YOUR Telegram ID works
- Double-check `ORCHESTRATOR_OWNER_ID` in `.env`
- Get correct ID from `@userinfobot`

---

### Orchestrator won't start

```bash
# Check .env
cat .env | grep ORCHESTRATOR

# Test manually
node orchestrator.js 2>&1 | head -20
```

Expected error if missing config:
```
❌ TELEGRAM_ORCHESTRATOR_TOKEN not set in .env
```

---

## THE POWER

**Before:**
- Walk to computer
- Open terminal
- Run commands
- Check logs

**Now:**
- Open Telegram on phone
- Send `/stats`
- See entire empire status

**One captured call pays for the month. Rest is profit.**

---

**SCRIPT KEEPER v2026.4**
*Run your empire from your couch.*
