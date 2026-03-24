# Botwave Integration Guide
**How All Systems Work Together - Zero API Cost**

---

## SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     USER (Telegram)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              7 TELEGRAM BOTS (hub.secure.js)                │
│  Boti1904 │ PaperChaser │ Trades │ Design │ Captain │ ...   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           VERTICAL ENGINE (verticals.js)                    │
│  Keywords → Intent → Conversational Flow → Estimate         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         LOCAL LLM (huihui-qwen3.5-9b-abliterated)           │
│              http://127.0.0.1:1234                          │
│                   ZERO API COST                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER (data/*.json)                       │
│  leads.json │ tickets.json │ messages.json │ revenue.json   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           AUDIT LOGS (logs/audit_*.log)                     │
│  Every call logged with timestamp, user, vertical, intent   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           DASHBOARD (server.js :3001)                       │
│  Landing Page │ Agent Dashboard │ API Endpoints             │
└─────────────────────────────────────────────────────────────┘
```

---

## DATA FLOW: Customer Call → Dispatch

### Step 1: Customer Messages Bot
```
User on Telegram → @Boti1904
Types: "water heater burst"
```

### Step 2: Hub Receives Message
```javascript
// hub.secure.js line 205
bot.command('estimate', async ctx => {
  // Gets user message
});
```

### Step 3: Vertical Classifies Intent
```javascript
// verticals.js line 340
classifyIntent('plumber', 'water heater burst')
// Returns: { intent: 'critical', confidence: 0.95 }
```

### Step 4: Starts Conversational Flow
```javascript
// verticals.js line 379
startFlow('Boti1904', userId)
// Asks: "What's the plumbing issue?"
// Then: "Where is it?"
// Then: "How urgent?"
```

### Step 5: Returns Instant Estimate
```javascript
// verticals.js line 400
processFlowResponse('Boti1904', userId, answers)
// Returns: $450 (critical + bathroom + emergency)
```

### Step 6: Logs & Dispatches
```javascript
// hub.secure.js line 400
logAudit('lead', { vertical: 'plumber', value: 450 })
// Dispatches via SMS to plumber
```

---

## ZERO API COST CONFIGURATION

### What You Have
| Component | Value | Cost |
|-----------|-------|------|
| Model | huihui-qwen3.5-9b-abliterated | $0 |
| Host | 127.0.0.1:1234 (local) | $0 |
| Bots | 7 Telegram bots | Free |
| Server | Node.js on your machine | Free |

### What's NOT Being Used (External APIs)
| API | Status | Why |
|-----|--------|-----|
| Groq | In .env but unused | Local model = faster, free |
| OpenRouter | In .env but unused | No need |
| XAI | In .env but unused | No need |
| Gemini | In .env but unused | No need |
| Brave Search | In .env but unused | LLM knowledge sufficient |

### Verify Zero Cost
```bash
# Test local model (free)
bwtest

# Check hub is using local endpoint
grep -A5 "askLLM" hub.secure.js | grep "127.0.0.1"
# Should show: hostname: '127.0.0.1', port: 1234
```

---

## DASHBOARD INTEGRATION

### Landing Page (`brand/public/index.html`)
- Shows loss calculator by vertical
- 7 business cards (Plumber, Electrician, HVAC, GC, Locksmith, Small Biz, Restaurant)
- Pricing: $299/$399/$499 tiers
- Demo CTA: "Call [your number] - See Demo"

### Agent Dashboard (`brand/public/agent.html`)
- Chat with local LM Studio
- Test all 7 bots
- View stats (calls today, revenue captured)
- Spawn Razor agent (local-forge)

### API Endpoints
| Endpoint | Method | Returns |
|----------|--------|---------|
| `/api/stats` | GET | leads, tickets, messages count |
| `/api/leads` | GET | All captured leads |
| `/api/leads` | POST | Create new lead |
| `/api/tickets` | GET | All tickets |
| `/api/tickets` | POST | Create new ticket |

---

## RAZOR AGENT (local-forge) INTEGRATION

### What It Is
Razor = Claude Code agent running in Docker container via local-forge

### How To Use
```bash
# From agent dashboard (http://localhost:3001/agent.html)
1. Click "Spawn" on Razor Agent card
2. Or run: cd local-forge && npm run spawn -- razor
```

### Config
```bash
cd local-forge
cp .env.example .env
# Set ANTHROPIC_API_KEY or use local:
# ANTHROPIC_BASE_URL=http://127.0.0.1:1234
```

---

## QUICK COMMANDS

### Daily Operations
```bash
# Check all systems
bwstatus

# View today's logs
bwlogs

# See captured leads
bwleads

# Test local model
bwtest

# Restart hub if needed
bwstop && bwstart
```

### Deploy Flow
```bash
# 1. Ensure LM Studio running
# 2. Start hub
bwstart

# 3. Start dashboard
node server.js &

# 4. Open agent dashboard
# http://localhost:3001/agent.html

# 5. Test @Boti1904 on Telegram
# Type: /start
# Type: /estimate
# Follow flow
```

---

## TROUBLESHOOTING

### Problem: "Model not responding"
```bash
# Test endpoint
curl http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"huihui-qwen3.5-9b-abliterated","messages":[{"role":"user","content":"OK"}]}'

# If fails: Open LM Studio → Load model → Start Server
```

### Problem: "Bot doesn't reply"
```bash
# Check hub running
ps aux | grep "node hub.secure"

# Check token in .env
grep TELEGRAM_BOT_BOTI1904 .env

# Restart hub
pkill -f "node hub.secure" && node hub.secure.js &
```

### Problem: "Dashboard 404"
```bash
# Check server running
ps aux | grep "node server"

# Restart
pkill -f "node server" && node server.js &
```

---

## THE COMPLETE STACK

**Frontend:**
- Landing page: `brand/public/index.html`
- Agent dashboard: `brand/public/agent.html`

**Backend:**
- Bot hub: `hub.secure.js` (7 Telegram bots)
- Vertical engine: `verticals.js` (10 business types)
- Server: `server.js` (static files + API)

**AI:**
- Local model: `huihui-qwen3.5-9b-abliterated`
- Endpoint: `http://127.0.0.1:1234`
- Cost: $0 (unlimited)

**Data:**
- Leads: `data/leads.json`
- Tickets: `data/tickets.json`
- Messages: `data/messages.json`
- Logs: `logs/audit_*.log`

**Integration:**
- Razor agent: `local-forge/` (Claude Code in Docker)
- Aliases: `~/.bash_aliases` (bw, bwstart, etc.)
- Status script: `scripts/status.sh`

---

**SCRIPT KEEPER v2026.4**
*Local model = Zero API cost. Unlimited. No bills.*
