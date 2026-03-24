# Termux Mobile Access Guide
## Control Your Empire From Android

---

## Quick Setup

On your Android device (via Termux):

```bash
# Download and run setup
curl -sL https://raw.githubusercontent.com/gringo/botwave/main/scripts/setup-termux.sh | bash

# Or copy from desktop via Tailscale
scp gringo@100.124.152.86:~/Projects/botwave/scripts/setup-termux.sh ~/ && bash ~/setup-termux.sh
```

---

## Commands

| Command | Description |
|---------|-------------|
| `bw-status` | Check empire status from phone |
| `bw-spawn claude "fix login"` | Spawn Claude agent with task |
| `bw-spawn kali "nmap -sV target"` | Spawn Kali pentesting agent |
| `bw-stop claude` | Stop an agent |
| `bw-logs` | View recent Razor logs |
| `bw-razor` | SSH to Razor master node |
| `bw-kali` | SSH to Kali laptop |

---

## Telegram Commands

Via @deth1_bot:

```
/status - Full system status
/spawn claude [task] - Start coding agent
/spawn kali [task] - Start pentesting agent
/stop [agent] - Stop agent
/agents - List all agents
/nodes - Check mesh health
/task [agent] [description] - Assign task
/logs [agent] - View logs
/help - All commands
```

---

## SSH Shortcuts

```bash
ssh razor    # Connect to desktop (pop-os)
ssh kali     # Connect to laptop (fyl)
ssh pop-os   # Same as above
ssh fyl      # Same as kali
```

---

## File Transfer

```bash
# From phone to desktop
scp file.txt razor:~/

# From desktop to phone
scp razor:~/file.txt ~/downloads/

# From phone to Kali
scp script.sh kali:~/
```

---

## Persistent Connection (Tmux)

Keep sessions running even if you disconnect:

```bash
# On desktop via SSH
ssh razor -t "tmux new-session -s work"

# Reconnect later
ssh razor -t "tmux attach -t work"
```

---

## Notifications

Get alerts on your phone when agents complete tasks:

```bash
# From desktop to phone via Termux:API
ssh phone "termux-notification --title 'Agent Complete' --content 'Claude finished the task'"
```

---

## Security

- All connections use Tailscale (encrypted WireGuard)
- SSH keys required (no passwords)
- Only your Telegram ID can control @deth1_bot
- Nodes isolated from public internet

---

## Troubleshooting

**SSH fails:**
```bash
# Regenerate keys
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
ssh-copy-id gringo@100.124.152.86
```

**Node offline:**
```bash
# Check Tailscale on node
ssh razor "sudo systemctl restart tailscaled"
```

**Agent won't spawn:**
```bash
# Check logs
bw-logs
```

---

## Workflow Examples

### Emergency Fix From Phone

```bash
# 1. Check status
bw-status

# 2. Spawn agent with task
bw-spawn claude "fix the login bug in auth.js"

# 3. Monitor
bw-logs

# 4. When done, stop
bw-stop claude
```

### Mobile Pentesting

```bash
# Connect to Kali
bw-kali

# Or spawn remote task
bw-spawn kali "nmap -sV 192.168.1.1"

# View results via Telegram
# Send: /logs kali
```

---

**Your empire is now in your pocket.**
