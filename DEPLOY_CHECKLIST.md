# DEPLOY CHECKLIST - Razor / Santa Muerte System
## Complete Setup Guide

---

## ✅ WHAT'S BUILT

### 1. Razor Master Agent (`razor-master.js`)
- **Your personal Oracle** (@deth1_bot on Telegram)
- Santa Muerte personality with mystical commands
- Controls all sub-agents
- Owner-only access (your ID: 8711428786)

### 2. Sub-Agents (Delegated by Razor)
- **The Scribe** (claude) - Code writing
- **The Smith** (aider) - Pair programming
- **The Warrior** (kali) - Pentesting on fyl

### 3. System Infrastructure
- **Nodes:** pop-os (Temple) + fyl (Blade)
- **Mesh:** Tailscale (WireGuard encrypted)
- **Persistence:** systemd services
- **Local LLM:** LM Studio at :1234

### 4. SCRIPT KEEPER Automation
- `keeper_deploy.py` - Zero-error deployment
- `keeper_monitor.py` - Self-healing monitoring
- Pro shell aliases for quick control

### 5. Business Model
- Open source architecture (public)
- SCRIPT KEEPER automation (premium)
- Subscription tiers defined

---

## 🚀 DEPLOY STEPS

### Step 1: Load Environment
```bash
# Ensure .env is correct
cat ~/Projects/botwave/.env | grep -E "RAZOR_MASTER_TOKEN|RAZOR_OWNER_ID"
# Should show your token and ID
```

### Step 2: Install Persistence
```bash
cd ~/Projects/botwave
sudo ./scripts/install-services.sh
```

### Step 3: Start Razor
```bash
# Manual start (for testing)
node razor-master.js &

# Or via systemd
sudo systemctl start razor-master
```

### Step 4: Test Telegram
- Message @deth1_bot
- Send: `/start`
- Should see Santa Muerte greeting

### Step 5: Test Sub-Agents
```bash
# Via Telegram
/summon scribe hello world

# Via shell
deth-claude "test task"
```

### Step 6: Setup Kali Node (fyl)
```bash
# On fyl laptop
scp scripts/setup-tailscale.sh lyfer1904@100.114.102.1:~/
ssh lyfer1904@100.114.102.1
bash setup-tailscale.sh
```

---

## 📱 TELEGRAM COMMANDS

### Core Commands
```
/summon [entity] [task]  - Spawn agent
/banish [entity]          - Stop agent
/divine                  - System status
/ask [question]          - Query local LLM
/nodes                   - Show mesh nodes
/bones [n]               - View logs
/secrets                 - Hidden knowledge
/scrolls                 - Documentation
```

### Entities
```
scribe / claude  - Code writer
smith / aider    - Pair programmer
warrior / kali   - Pentester
```

---

## 💼 BUSINESS LAUNCH

### Week 1: GitHub Public
1. Create repo: github.com/gringo/openclaw
2. Add:
   - README.md
   - architecture.md
   - simple-agent/ (basic example)
   - LICENSE (MIT)

### Week 2: SCRIPT KEEPER
1. Create private repo
2. Package keeper_*.py scripts
3. Setup Stripe for subscriptions
4. Create Discord server

### Week 3: Content
1. Blog: "How I spent $12K on AI APIs"
2. Twitter thread
3. Reddit post: r/selfhosted
4. Hacker News

### Week 4: Launch
1. Soft launch to friends
2. Get first 5 subscribers
3. Iterate based on feedback
4. Scale from there

---

## 🎯 SUCCESS METRICS

- Month 1: 5 Premium subs ($1,495/mo)
- Month 3: 15 Premium + 3 Enterprise
- Month 6: 50+ subscribers
- Year 1: $150K revenue

---

## 🔐 SECURITY REMINDERS

- @deth1_bot: Owner ONLY (your ID: 8711428786)
- Tailscale: All nodes encrypted
- SSH: Key-based auth only
- Secrets: In .env, never committed

---

## 🆘 EMERGENCY

```bash
# Stop everything
panic

# Restart Razor
sudo systemctl restart razor-master

# Check status
deth
```

---

## 📚 KEY FILES

| File | Purpose |
|------|---------|
| `razor-master.js` | Main Oracle |
| `agent-bridge.js` | Agent spawner |
| `pro-scripts/.pro_aliases` | Shell shortcuts |
| `scripts/install-services.sh` | Persistence |
| `BUSINESS_MODEL.md` | Revenue plan |

---

**Ready to deploy? Start with Step 1 above.**
