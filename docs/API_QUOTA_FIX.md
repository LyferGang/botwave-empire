# API Quota Fix - Use Local Models Only
**SCRIPT KEEPER v2026.4**

---

## THE PROBLEM

You keep running out of API credits from:
- Groq
- OpenRouter
- XAI
- Gemini

**Why:** External APIs charge per request. Free tiers run out fast.

---

## THE SOLUTION

**Use ONLY your local LM Studio model:**
- `huihui-qwen3.5-9b-abliterated` at `http://127.0.0.1:1234`
- Free (you already have the hardware)
- No rate limits
- No quota

---

## WHAT'S ALREADY CONFIGURED

Your `hub.secure.js` already uses local LM Studio:

```javascript
// Line 123-157: LLM function
async function askLLM(prompt) {
  const body = {
    model: 'huihui-qwen3.5-9b-abliterated',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7
  };
  // Calls http://127.0.0.1:1234/v1/chat/completions
}
```

**All 7 Telegram bots use this.** No external API calls.

---

## VERIFY LOCAL MODEL IS RUNNING

```bash
# Test your LM Studio endpoint
curl http://127.0.0.1:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "huihui-qwen3.5-9b-abliterated", "messages": [{"role": "user", "content": "Hello"}]}'
```

**Expected:** JSON response with model reply.

**If fails:** Start LM Studio server:
1. Open LM Studio
2. Load model: `huihui-qwen3.5-9b-abliterated`
3. Click "Start Server" (port 1234)
4. Check "Local Server" tab

---

## DISABLE EXTERNAL API KEYS (Optional)

Comment out external API calls in `hub.secure.js`:

```javascript
// Line 93-100: Comment these out to prevent accidental use
/*
const API_KEYS = {
  openrouter: process.env.OPENROUTER_API_KEY,
  groq: process.env.GROQ_API_KEY,
  xai: process.env.XAI_API_KEY,
  gemini: process.env.GEMINI_API_KEY,
  brave: process.env.BRAVE_SEARCH_API_KEY,
  ollama: process.env.OLLAMA_HOST || 'http://localhost:11434/v1',
};
*/
```

**Keep only:**
- `TELEGRAM_BOT_*` tokens (required for bots)
- Local LM Studio (no key needed)

---

## WEB SEARCH FALLBACK (No Brave API Needed)

If you're using Brave Search API, switch to free alternative:

```javascript
// Replace Brave with free web search
async function webSearch(query) {
  // Option 1: Use local-forge's brave-search skill
  // Option 2: Use Ollama with web plugin
  // Option 3: Disable search, use LLM knowledge only
  return []; // Empty = no search, LLM answers from training
}
```

---

## COST COMPARISON

| Provider | Free Tier | Paid | Your Cost/Month |
|----------|-----------|------|-----------------|
| Groq | 10k req/day | $0.07/1k tokens | $0 if local |
| OpenRouter | Varies | $0.01-0.10/1k tokens | $0 if local |
| XAI | None | $0.05/1k tokens | $0 if local |
| Gemini | 60 req/min | $0.005/1k tokens | $0 if local |
| **LM Studio** | **Unlimited** | **$0** | **$0** |

**Local = Unlimited. No quota. No bills.**

---

## RAZOR AGENT (local-forge) INTEGRATION

Your `local-forge/` has Claude Code integration. Use it like this:

```bash
# Spawn Razor agent (runs in Docker)
cd /home/gringo/Projects/botwave/local-forge
npm run spawn -- razor

# Razor uses Claude Code API directly
# You control quota via .env in local-forge
```

**To set local-forge API key:**
```bash
cd /home/gringo/Projects/botwave/local-forge
cp .env.example .env
# Edit .env: Set your ANTHROPIC_API_KEY
# Or use local model: ANTHROPIC_BASE_URL=http://127.0.0.1:1234
```

---

## THE AGENT DASHBOARD

New dashboard at `http://localhost:3001/agent.html`:

**Features:**
- Chat with local LM Studio
- Spawn Razor agent
- Test all 7 Telegram bots
- View call stats
- Restart hub

**Access:**
1. Start server: `node server.js &`
2. Open: `http://localhost:3001/agent.html`
3. Click "Chat" → Type message → Send

---

## QUICK FIX CHECKLIST

- [ ] LM Studio running on 127.0.0.1:1234?
- [ ] Model loaded: `huihui-qwen3.5-9b-abliterated`?
- [ ] `hub.secure.js` using local endpoint?
- [ ] External API keys commented out (optional)?
- [ ] Test: `curl http://127.0.0.1:1234/v1/chat/completions ...`?

---

**You're golden.** Local model = no quota. No bills. Unlimited.

---

**SCRIPT KEEPER v2026.4**
*Run local. No external API needed.*
