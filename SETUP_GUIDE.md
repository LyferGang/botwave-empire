# Botwave Production Setup Guide
**For Baby Boomer Business Owners - No AI Jargon**
**SCRIPT KEEPER v2026.4**

---

## WHAT YOU'RE BUILDING

**Botwave answers phones 24/7 for small businesses.**

- Plumber: Emergency calls → dispatches plumber
- Electrician: Dangerous calls → qualifies jobs
- HVAC: AC/heat calls → books appointments
- Locksmith: Lockout calls → instant dispatch
- General Contractor: Remodel leads → site visits
- Small Business: All calls → messages + bookings
- Restaurant: Reservations → table bookings

**One captured call pays for the month. Everything else is profit.**

---

## PART 1: VERIFY WHAT YOU HAVE

### Step 1: Check Your Files

```bash
cd /home/gringo/Projects/botwave
ls -la
```

**You should see:**
- `hub.secure.js` - 7 Telegram bots
- `verticals.js` - Business vertical configs
- `server.js` - Dashboard server
- `.env` - API keys (bot tokens)
- `brand/public/` - Landing page
- `logs/` - Audit logs
- `data/` - Customer data

---

### Step 2: Check LM Studio (Your Local AI)

**Open LM Studio:**
1. Launch LM Studio application
2. Search for model: `huihui-qwen3.5-9b-abliterated`
3. Click "Download" if not installed
4. Click "Load" to load model
5. Click "Start Server" (port 1234)

**Test it works:**
```bash
curl http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "huihui-qwen3.5-9b-abliterated", "messages": [{"role": "user", "content": "Say hello"}]}'
```

**Expected output:**
```json
{"choices": [{"message": {"content": "Hello! How can I help you?"}}]}
```

---

### Step 3: Check Telegram Bots

Your 7 bots are already created:

| Bot | Username | Purpose |
|-----|----------|---------|
| Boti1904 | @Boti1904 | Plumber |
| PaperChaser | @PaperChaser | Electrician |
| Trades | @Trades | HVAC |
| Design | @Design | General Contractor |
| Captain | @Captain | Locksmith |
| Business | @Business | Small Business |
| Mamma | @Mamma | Restaurant |

**Test in Telegram:**
1. Open Telegram
2. Search: `@Boti1904`
3. Click "Start"
4. Bot should reply with welcome message

---

## PART 2: START THE SYSTEM

### Step 4: Start the Bot Hub

```bash
cd /home/gringo/Projects/botwave
node hub.secure.js &
```

**Expected output:**
```
✅ Boti1904 bot started
✅ PaperChaser bot started
✅ Trades bot started
✅ Design bot started
✅ Captain bot started
✅ Business bot started
✅ Mamma bot started

🎯 Botwave Hub running - 7 Telegram bots active
📊 Dashboard: http://localhost:3001
```

**Verify it's running:**
```bash
ps aux | grep "node hub"
```

---

### Step 5: Start the Dashboard

```bash
cd /home/gringo/Projects/botwave
node server.js &
```

**Expected output:**
```
Botwave Dashboard: http://localhost:3001
```

**Open in browser:**
1. Go to: `http://localhost:3001`
2. You should see landing page with:
   - "Never Miss Another Customer Call"
   - Loss calculator
   - 7 business verticals
   - Pricing

---

### Step 6: Open Agent Dashboard

**Go to:** `http://localhost:3001/agent.html`

**You should see:**
- Stats bar (7 bots active, LM Studio online)
- Agent control panel with 4 cards:
  - Local LM Studio (Chat, Test buttons)
  - Razor Agent (Chat, Spawn, Logs buttons)
  - Botwave Hub (Test Boti1904, Restart Hub)
  - Vertical Estimator (Test Flow)

**Test the chat:**
1. Click "Chat" on Local LM Studio card
2. Type: "What is Botwave?"
3. Click "Send"
4. You should get a reply from your local model

---

## PART 3: CONFIGURATION FILES EXPLAINED

### File 1: `.env` (Secrets - Never Share)

```
# Telegram Bot Tokens (7 bots)
TELEGRAM_BOT_BOTI1904=8747407183:AAHimCXAm0SleFh7DCW_xxmH7vn09nnAZ3k
TELEGRAM_BOT_PAPERCHASER=...
...

# Local Model (No API key needed)
LM_STUDIO_HOST=http://127.0.0.1:1234
LM_STUDIO_MODEL=huihui-qwen3.5-9b-abliterated
```

**Why:** Tokens authenticate your bots with Telegram. Local model = free, no quota.

---

### File 2: `hub.secure.js` (Bot Controller)

**What it does:**
- Starts all 7 Telegram bots
- Routes messages to vertical-specific handlers
- Rate limits (100 requests/minute per user)
- Logs all activity to `logs/`

**Key sections:**
```javascript
// Line 82-90: Bot config (which bot does what)
const BOTS = {
  'Boti1904': { vertical: 'Plumber', ... },
  'PaperChaser': { vertical: 'Electrician', ... },
  ...
};

// Line 123-157: LLM function (calls your local model)
async function askLLM(prompt) {
  // Calls http://127.0.0.1:1234/v1/chat/completions
}

// Line 205-361: Bot command handlers
bot.command('start', async ctx => {
  // Shows welcome message
});
```

---

### File 3: `verticals.js` (Business Logic)

**What it does:**
- Defines 10 business verticals
- Keyword classification (what type of call)
- Conversational flows (ask questions → give estimate)
- Response generation (what bot says back)

**Key sections:**
```javascript
// Line 15-107: Vertical configs
const VERTICALS = {
  'Boti1904': {
    vertical: 'Plumber',
    pricing: { critical: 450, high: 350, ... },
    keywords: {
      critical: ['burst', 'flooding', ...],
      high: ['overflow', 'no water', ...]
    },
    flow: {
      steps: ['issue', 'location', 'timing'],
      questions: {
        issue: 'What\'s the plumbing issue?',
        ...
      }
    }
  },
  ...
};

// Line 340-377: Conversational flow handler
export function startFlow(botName, userId) {
  // Starts the question flow
}

// Line 379-400: Process user response
export function processFlowResponse(botName, userId, userMessage) {
  // Moves to next question or returns estimate
}
```

---

### File 4: `server.js` (Dashboard Server)

**What it does:**
- Serves landing page (`brand/public/index.html`)
- Serves agent dashboard (`brand/public/agent.html`)
- API endpoints for stats, leads, tickets

**Key sections:**
```javascript
// Line 5-7: Paths
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'brand', 'public');

// Line 24-78: API routes
if (pathname === '/api/stats') {
  // Returns lead count, ticket count, etc.
}

// Line 80-91: Serve static files
filePath = path.join(PUBLIC_DIR, filePath);
```

---

## PART 4: TEST THE FULL SYSTEM

### Test 1: Plumber Bot Flow

1. **Open Telegram**
2. **Go to:** `@Boti1904`
3. **Type:** `/start`
4. **Expected reply:**
   ```
   🚨 NEVER MISS ANOTHER EMERGENCY CALL

   Your phone goes to voicemail at night? That's $450 to your competitor.

   Boti1904 answers 24/7. Books jobs. Dispatches you.

   One emergency job pays for the whole month. Rest is profit.

   Try it now:
   /estimate - Get instant price quote
   /emergency - Test emergency dispatch
   ```

5. **Type:** `/estimate`
6. **Expected reply:**
   ```
   💬 What's the plumbing issue? (burst pipe, leak, clog, water heater, other)
   ```

7. **Type:** `water heater burst`
8. **Expected reply:**
   ```
   💬 Where is it? (kitchen, bathroom, basement, outside, other)
   ```

9. **Type:** `bathroom`
10. **Expected reply:**
    ```
    💬 How urgent? (now/emergency, today, this week, whenever)
    ```

11. **Type:** `emergency`
12. **Expected reply:**
    ```
    🔧 PLUMBING ESTIMATE

    Issue: water heater burst
    Location: bathroom
    Timing: emergency

    Estimated: $450

    Dispatching plumber now.
    ```

---

### Test 2: Dashboard Analytics

1. **Open:** `http://localhost:3001`
2. **Scroll to:** Loss Calculator
3. **Select:** "Plumber"
4. **Enter:** 5 missed calls/week, $450/job
5. **Expected:** "$9,000 Lost Per Month"
6. **Expected:** "$8,601/mo profit with Botwave"

---

### Test 3: Agent Dashboard

1. **Open:** `http://localhost:3001/agent.html`
2. **Click:** "Chat" on Local LM Studio card
3. **Type:** "What is Botwave?"
4. **Click:** "Send"
5. **Expected:** Model replies with answer

---

## PART 5: DEPLOY FOR DAD'S PLUMBING BUSINESS

### Step 7: Get Dad's Business Phone Number

```
Dad's plumbing business phone: 555-0123
```

### Step 8: Forward Calls to Botwave

**Option A: Telegram Bot (No Phone Forwarding)**
- Customers message @Boti1904 on Telegram
- Bot qualifies, dispatches via SMS

**Option B: Phone Forwarding (Requires Twilio)**
- Forward business phone to Twilio
- Twilio webhook → Botwave intake
- Bot qualifies, dispatches via SMS

---

### Step 9: Test With Real Calls

1. **Call Dad's business number** (after hours)
2. **Bot should answer** (if using Option A, message instead)
3. **Say:** "Water heater burst"
4. **Bot should:** Qualify, dispatch, text dad

---

### Step 10: Track Results

**Check logs:**
```bash
cat /home/gringo/Projects/botwave/logs/audit_$(date +%Y-%m-%d).log
```

**Check data:**
```bash
cat /home/gringo/Projects/botwave/data/leads.json
```

**Expected:** Each call logged with timestamp, user, vertical, intent.

---

## PART 6: TROUBLESHOOTING

### Problem: "Cannot find package 'grammy'"

**Fix:**
```bash
cd /home/gringo/Projects/botwave
npm install grammy dotenv
```

---

### Problem: "Bot doesn't reply"

**Check:**
1. Is hub running? `ps aux | grep "node hub"`
2. Is token correct? Check `.env`
3. Is LM Studio running? Test with `curl`

---

### Problem: "Dashboard shows 404"

**Fix:**
1. Check `server.js` path: `brand/public/`
2. Restart server: `pkill -f "node server"; node server.js &`

---

### Problem: "Model not responding"

**Fix:**
1. Open LM Studio
2. Ensure model is loaded
3. Click "Start Server"
4. Test: `curl http://127.0.0.1:1234/v1/chat/completions ...`

---

## PART 7: NEXT STEPS (Learn More)

### Read These Files:
1. `docs/BOTWAVE_BUSINESS_2026.md` - Business plan
2. `docs/WARM_MARKET_CLOSE.md` - How to sell to family/friends
3. `docs/MISSED_CALL_MATH.md` - How much each business loses
4. `docs/MASTER_PLAYBOOK.md` - 0→$10k MRR in 90 days

### Modify These Files:
1. `verticals.js` - Add new business types
2. `hub.secure.js` - Change bot responses
3. `brand/public/index.html` - Update landing page copy

### Build New Features:
1. Add Twilio for phone forwarding
2. Add calendar sync (Google Calendar API)
3. Add SMS dispatch (Twilio SMS)
4. Add payment processing (Stripe)

---

## YOU'RE GOLDEN

**You have:**
- 7 running Telegram bots
- Local AI (no API quota)
- Landing page with loss calculator
- Agent dashboard for chat/testing
- Full documentation

**Next:**
1. Test @Boti1904 flow
2. Show dad the demo
3. Deploy on his business number
4. Track captured calls
5. Close 3 pilot customers

---

**SCRIPT KEEPER v2026.4**
*One captured call pays for the month. Everything else is profit.*
