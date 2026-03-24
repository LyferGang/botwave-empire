# Botwave Poor Man's Forge — Generalized Template

A free, privacy-first AI orchestration platform chaining multiple providers + local models. No ongoing costs—leverages free tiers and local compute. Inspired by simple bots like thepopebot: modular, Telegram-focused, extensible with fun commands.

## What This Is
Chain AI providers for tasks like strategy, editing, and polishing (e.g., code critique). Runs via a gateway for bots and integrations.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Provider1 │ ──▶ │   Provider2 │ ──▶ │   Local AI  │
│ (Strategy)  │     │   (Edit)    │     │   (Polish)  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                          ▼
              ┌─────────────────────┐
              │     Gateway Tool    │
              │  (Custom Port)      │
              └─────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
    ┌─────────┐    ┌────────────┐   ┌──────────┐
    │Messaging│    │  Webhook   │   │  Repo    │
    │  Bots   │    │  Service   │   │  Tools   │
    └─────────┘    └────────────┘   └──────────┘
```

## Providers (Generalized)
| Provider Type | Use Case | Notes |
|---------------|----------|-------|
| Local AI | Primary polish | Free, runs on your hardware |
| Fast Inference | Quick tasks | Free tier available |
| Open Model Hub | Fallback | Community models |
| Reasoning AI | Strategy | Free beta access |
| Editing AI | Refinement | Free limited use |

## Messaging Bots (Template Setup)
Set up bots on platforms like Telegram. Use placeholders—no real tokens here.

- Primary Bot: [YOUR_BOT_TOKEN]
- Test Bot: [YOUR_TEST_BOT_TOKEN]
- Additional Bots: Create via bot creation tools (e.g., BotFather for Telegram).

## What's Built (Template Features)
- Secure config storage (`~/.apiconfig/`—use chmod 600).
- Gateway config with multiple providers.
- Messaging integration (e.g., Telegram bots).
- Webhook ready (e.g., for collab tools).
- Repo token support (e.g., PAT for PRs).

## Next Steps
1. **Run Locally**: Start local AI server, then launch gateway.
2. **Test Chain**: Send a command like /critique in a test bot.
3. **Deploy to Edge**: Use Docker for small devices.
4. **Expand Skills**: Add code review, image gen, or IoT ties.
5. **Customize**: Add fun themes (e.g., "Pope Mode" for witty replies, emulating thepopebot).

## Files (Template Locations)
| File | Location | Purpose |
|------|----------|---------|
| Config | `~/.apiconfig/config.json` | Provider setup |
| Keys | `~/.apiconfig/keys.txt` (encrypted) | Secure storage—use placeholders |
| This README | `~/Projects/botwave/README.md` | All-in-one guide |

---

## Setup Cheat Sheet (Generalized)

### 1. System Audit & Cleanup (Safe Commands)
```bash
# Audit folders
ls -la ~/Desktop ~/Downloads ~/Documents

# Find config files (non-sensitive)
find ~/ -name "*config*" 2>/dev/null

# Check processes
ps aux | grep -E 'local-ai|container|script|gateway'

# Disk usage
du -sh ~/* | sort -hr | head -10
```

### Cleanup (Safe/Reversible)
```bash
# Secure config folder
mkdir -p ~/.apiconfig
chmod 600 ~/.apiconfig/*

# Backup
cp -r ~/.apiconfig ~/backups/config-$(date +%F)
```

### 2. Local AI Prep
```bash
# Install (example for a local AI tool)
curl -fsSL [INSTALL_SCRIPT_URL] | sh

# Run in background
[LOCAL_AI_COMMAND] serve &

# Pull models (adjust for hardware)
[LOCAL_AI_COMMAND] pull [LIGHT_MODEL]
[LOCAL_AI_COMMAND] pull [HEAVY_MODEL]

# Test
[LOCAL_AI_COMMAND] run [MODEL] "Hello"
```

### 3. Gateway Config (Template JSON)
Save to `~/.apiconfig/config.json`:
```json
{
  "version": "1.0",
  "name": "Botwave Template",
  "primary": "local",
  "debug": true,
  "providers": {
    "local": {
      "enabled": true,
      "endpoint": "http://localhost:[LOCAL_PORT]",
      "model": "[YOUR_MODEL]",
      "api_key": "local"
    },
    "hub": {
      "enabled": true,
      "api_key": "[YOUR_HUB_KEY]",
      "model": "[FALLBACK_MODEL]"
    },
    "fast": {
      "enabled": true,
      "api_key": "[YOUR_FAST_KEY]",
      "model": "[VERSATILE_MODEL]"
    },
    "reasoning": {
      "enabled": true,
      "api_key": "[YOUR_REASONING_KEY]",
      "model": "[STRATEGY_MODEL]"
    },
    "editing": {
      "enabled": true,
      "api_key": "[YOUR_EDITING_KEY]",
      "model": "[FLASH_MODEL]"
    }
  },
  "messaging": {
    "enabled": true,
    "bot_token": "[YOUR_BOT_TOKEN]",
    "allowed_users": ["[YOUR_USER_ID]"]
  },
  "chain": {
    "strategy": "reasoning",
    "edit": "editing",
    "polish": "local",
    "fallback": ["fast", "hub"]
  },
  "features": {
    "critique": true,
    "review": true,
    "privacy": true
  }
}
```

### Run Gateway
```bash
[GATEWAY_COMMAND] --port [CUSTOM_PORT] --verbose
```

### 4. Critique Chain (Template Prompt)
```
Input: {user_idea}
Step 1 (Strategy): Draft plan
Step 2 (Critique): Refine
Step 3 (Polish): Finalize
Output: Result with summary
```

Test via messaging: Send /critique.

### 5. Network Diagnostics (Generalized)
```bash
# Check listening ports
sudo lsof -i -P -n | grep LISTEN

# Scan local network (placeholder IP range)
nmap -sn [LOCAL_SUBNET]/24

# Firewall status
sudo ufw status
```

### 6. Security Notes (Generalized Best Practices)
- **Risks**: Exposed ports, config leaks—use firewall and encryption.
- **Fixes**: Allow only LAN traffic; monitor audits.
- **Privacy**: Keep data local; avoid cloud for sensitive tasks.
- **Score**: Aim for 10/10 with isolated containers.

### 7. Docker Deployment (Template)
```yaml
services:
  local-ai:
    image: [LOCAL_AI_IMAGE]
    ports:
      - "[LOCAL_PORT]:[LOCAL_PORT]"
    volumes:
      - local-data:/data

  gateway:
    image: [GATEWAY_IMAGE]
    ports:
      - "[CUSTOM_PORT]:[CUSTOM_PORT]"
    environment:
      - LOCAL_HOST=http://local-ai:[LOCAL_PORT]
    depends_on:
      - local-ai
```

Run: `docker compose up -d`

### 8. Forge Commands (Emulating thepopebot Flair)
- /critique: Run chain on input.
- /review: Code analysis.
- /pope: Fun, witty response (add for humor).

## Future Expansion
- Add edge deployments.
- More commands and integrations.
- Open-source on repo platforms.

*Template Version: v1 | Date: [CURRENT_DATE]*