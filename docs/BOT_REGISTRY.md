# Botwave Bot Registry
**Active Telegram Bots - Production Inventory**

---

## ALL 7 ACTIVE BOTS

| # | Bot Name | Token | Username | Utility | Status |
|---|----------|-------|----------|---------|--------|
| 1 | **Boti1904** | `8747407183:AAHimCXAm0SleFh7DCW_xxmH7vn09nnAZ3k` | [@Boti1904](https://t.me/Boti1904) | Main business bot - AI dispatch, lead capture, customer support | ✅ ACTIVE |
| 2 | **PaperChaser** | `8706909962:AAFDukM98cnkjoUGR3tBS9qCPB_04U7sxws` | [@PaperChaser](https://t.me/PaperChaser) | Paper trading - stock/crypto simulation, portfolio tracking | ✅ ACTIVE |
| 3 | **Trades** | `8721939422:AAHkaabGThUbuJfIH_bWPcQPvgP5NeNK3p4` | [@Trades](https://t.me/Trades) | Job listings & trades - plumbing dispatch, technician alerts | ✅ ACTIVE |
| 4 | **Design** | `8738524829:AAHQj7Td3ecK_0K8CgOe-zYGJjBHjBM7OIE` | [@Design](https://t.me/Design) | Image/video generation - AI creative, marketing assets | ✅ ACTIVE |
| 5 | **Captain** | `8249528887:AAGjc386QGaG_-TJLkj3WOS03CYMqF0LOsc` | [@Captain](https://t.me/Captain) | Proof of concept - original test bot, feature demos | ✅ ACTIVE |
| 6 | **Business** | `8611028472:AAEcrgEgg3oGYo_W6xcxCXGCJU2WpPruAFs` | [@Business](https://t.me/Business) | Crypto & finance - market alerts, trading signals | ✅ ACTIVE |
| 7 | **Mamma** | `8649924686:AAEweJV0FoH-BnT95EV9Rf890eYPUxHawaM` | [@Mamma](https://t.me/Mamma) | Personal assistant - reminders, tasks, family coordination | ✅ ACTIVE |

---

## BOT DETAILS

### 1. Boti1904 (Primary Business Bot)
**Purpose:** Main customer-facing bot for plumbing dispatch

**Commands:**
- `/start` - Activate bot
- `/ai <prompt>` - Ask AI questions
- `/search <query>` - Web search
- `/lead` - Capture customer lead
- `/ticket` - Create support ticket
- `/stats` - View dashboard stats

**Use Cases:**
- 24/7 emergency call intake
- AI-powered urgency classification
- Automatic plumber dispatch
- Lead tracking & CRM
- Customer support tickets

**Connected To:**
- Groq LLM (llama-3.1-70b)
- Brave Search API
- Local SQLite database

---

### 2. PaperChaser
**Purpose:** Paper trading simulator for stocks/crypto

**Commands:**
- `/start` - Initialize portfolio
- `/buy <symbol>` - Buy stock
- `/sell <symbol>` - Sell stock
- `/portfolio` - View holdings
- `/price <symbol>` - Get current price
- `/ai <prompt>` - Ask about markets

**Use Cases:**
- Simulated trading practice
- Portfolio tracking
- Market analysis via AI
- Learning tool for investors

---

### 3. Trades
**Purpose:** Plumbing job dispatch & technician alerts

**Commands:**
- `/start` - Register as technician
- `/jobs` - View available jobs
- `/accept <job_id>` - Accept job
- `/dispatch` - Request new dispatch
- `/status` - Update availability

**Use Cases:**
- Technician job notifications
- Real-time dispatch alerts
- Job acceptance workflow
- Schedule management

---

### 4. Design
**Purpose:** AI image/video generation

**Commands:**
- `/start` - Activate bot
- `/image <prompt>` - Generate image
- `/video <prompt>` - Generate video
- `/style <style>` - Set art style
- `/gallery` - View creations

**Use Cases:**
- Marketing asset creation
- Logo design
- Social media content
- Product mockups

---

### 5. Captain (PoC Bot)
**Purpose:** Original proof of concept, feature testing

**Commands:**
- `/start` - Show capabilities
- `/test` - Run feature test
- `/demo` - Trigger demo flow
- `/help` - All commands

**Use Cases:**
- Feature prototyping
- Investor demos
- Internal testing
- POC presentations

---

### 6. Business
**Purpose:** Crypto & finance alerts

**Commands:**
- `/start` - Activate alerts
- `/crypto <symbol>` - Get crypto price
- `/stock <symbol>` - Get stock price
- `/alert <symbol>` - Set price alert
- `/news` - Market news summary

**Use Cases:**
- Real-time price tracking
- Portfolio alerts
- Market news aggregation
- Trading signal notifications

---

### 7. Mamma
**Purpose:** Personal & family assistant

**Commands:**
- `/start` - Activate assistant
- `/reminder <task>` - Set reminder
- `/task <task>` - Add to todo list
- `/calendar` - View schedule
- `/family` - Family coordination

**Use Cases:**
- Personal task management
- Family calendar sync
- Reminder notifications
- Shopping lists

---

## REACHING BOTS

### Direct Telegram Links
```
https://t.me/Boti1904       # Main business
https://t.me/PaperChaser    # Paper trading
https://t.me/Trades         # Job dispatch
https://t.me/Design         # AI creative
https://t.me/Captain        # Demo/testing
https://t.me/Business       # Finance alerts
https://t.me/Mamma          # Personal assistant
```

### Start Bot via Username
In Telegram search bar, type:
- `@Boti1904`
- `@PaperChaser`
- `@Trades`
- `@Design`
- `@Captain`
- `@Business`
- `@Mamma`

---

## BOT STATUS CHECK

```bash
# Check all bots running
cd /home/gringo/Projects/botwave
node hub.secure.js 2>&1 | grep "started"

# Expected output:
# ✅ Boti1904 bot started
# ✅ PaperChaser bot started
# ✅ Trades bot started
# ✅ Design bot started
# ✅ Captain bot started
# ✅ Business bot started
# ✅ Mamma bot started
```

---

## API INTEGRATIONS

| Bot | LLM Provider | Search API | Other APIs |
|-----|--------------|------------|------------|
| Boti1904 | Groq, Ollama | Brave | SQLite DB |
| PaperChaser | Groq | - | Stock API |
| Trades | Ollama | - | Dispatch DB |
| Design | OpenRouter | - | Image API |
| Captain | Ollama | - | Test harness |
| Business | Groq, XAI | - | Crypto API |
| Mamma | Ollama | - | Calendar API |

---

## RATE LIMITS

All bots share rate limiter:
- **100 requests per minute** per user
- **5 dispatches per hour** per phone number (Trades bot)
- Auto-retry after window expires

---

## AUDIT LOGGING

All bot activity logged to:
```
/home/gringo/Projects/botwave/logs/audit_YYYY-MM-DD.log
```

Each entry contains:
- Timestamp
- Event type
- User ID
- Bot name
- Action details

---

**Last Updated:** 2026-03-23
**SCRIPT KEEPER v2026.4**
