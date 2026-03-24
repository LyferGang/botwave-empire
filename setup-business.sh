#!/bin/bash
# Botwave Business Platform - One-shot deploy

set -e
cd ~/botwave

# Create data dirs
mkdir -p data skills/active config logs

# ============ CONFIG ============
cat > .env << 'EOF'
# Telegram Bots
TELEGRAM_BOT_1=8747407183:AAHimCXAm0SleFh7DCW_xxmH7vn09nnAZ3k
TELEGRAM_BOT_2=8706909962:AAFDukM98cnkjoUGR3tBS9qCPB_04U7sxws
TELEGRAM_BOT_3=8721939422:AAHkaabGThUbuJfIH_bWPcQPvgP5NeNK3p4
TELEGRAM_BOT_4=8738524829:AAHQj7Td3ecK_0K8CgOe-zYGJjBHjBM7OIE
TELEGRAM_BOT_5=8249528887:AAGjc386QGaG_-TJLkj3WOS03CYMqF0LOsc
TELEGRAM_BOT_6=8611028472:AAEcrgEgg3oGYo_W6xcxCXGCJU2WpPruAFs
TELEGRAM_BOT_7=8649924686:AAEweJV0FoH-BnT95EV9Rf890eYPUxHawaM

# AI Providers
ANTHROPIC_API_KEY=sk-ant-api03-placeholder
OPENAI_API_KEY=crsr_51185a4d4bd8a6691dc7989ce3e59ff4a55708626991bb1b46f99b36ea81b5a4
GOOGLE_API_KEY=AIzaSyC76VHoLPbF93FeXnhuNghLigKxzSxeIEE
XAI_API_KEY=xai-jZQPkln592FkGeI9VujitGd6OIkNBT5gimYGtN3SiysKN322MQTeMEnA5dq4OjhleGg4Qc7NW6r9KXYt
GROQ_API_KEY=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
OPENROUTER_API_KEY=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

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_API_KEY=0a972755fb424441983ce4edfdf11e83

# Discord
DISCORD_WEBHOOK=https://discord.com/api/webhooks/1480066000471986188/tJymvTGjkS-rt4ikAfVYUEeAVCr6JcPaSvacNBzd7SXNG3U8lf8VJETgWMJ_KmGhN1vO
DISCORD_BOT_TOKEN=MTQ4MDA2Nzk0OTIxMjQ3MTQ2OA.Gg0-wA.V74DuPZlpzq03gQDc3w21XEMOQfQlTeF1iaT8w

# Brave Search
BRAVE_API_KEY=BSAVYmWeFDn5-gGfjk2wLrfzjyH1rg5

# GitHub
GITHUB_TOKEN=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

# LLM Config
LLM_PROVIDER=ollama
LLM_MODEL=qwen3-coder:30b
EOF

# ============ SKILLS ============
# Lead Capture
cat > skills/active/lead-capture.json << 'EOF'
{
  "name": "lead-capture",
  "trigger": "/lead",
  "fields": ["name", "email", "interest"],
  "save_to": "data/leads.json",
  "notify": "discord"
}
EOF

# Support
cat > skills/active/support.json << 'EOF'
{
  "name": "support",
  "trigger": "/help",
  "fields": ["issue", "priority"],
  "save_to": "data/tickets.json",
  "notify": "discord"
}
EOF

# Sales
cat > skills/active/sales.json << 'EOF'
{
  "name": "sales",
  "trigger": "/start",
  "qualify": ["budget", "timeline", "role"],
  "route": "lead-capture"
}
EOF

# ============ DATA FILES ============
echo "[]" > data/leads.json
echo "[]" > data/tickets.json
echo "[]" > data/logs.json

# ============ WEB DASHBOARD ============
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Botwave Command Center</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; background: #0d1117; color: #c9d1d9; min-height: 100vh; }
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    h1 { color: #58a6ff; text-align: center; margin-bottom: 30px; font-size: 2.5rem; }
    h1 span { color: #f78166; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
    .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 20px; }
    .card h2 { color: #8b949e; font-size: 0.9rem; text-transform: uppercase; margin-bottom: 15px; }
    .stat { font-size: 2.5rem; color: #58a6ff; font-weight: bold; }
    .stat.green { color: #3fb950; }
    .stat.orange { color: #f78166; }
    .bot-list { list-style: none; }
    .bot-list li { padding: 10px; border-bottom: 1px solid #30363d; display: flex; justify-content: space-between; }
    .bot-list li:last-child { border: none; }
    .status { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 10px; }
    .status.online { background: #3fb950; }
    .status.offline { background: #f85149; }
    .btn { background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 1rem; }
    .btn:hover { background: #2ea043; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #30363d; }
    th { color: #8b949e; font-weight: normal; }
    .api-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    .api-item { background: #0d1117; padding: 10px; border-radius: 4px; font-size: 0.8rem; }
    .api-item .key { color: #8b949e; }
    .api-item .val { color: #3fb950; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🤖 Botwave <span>Command Center</span></h1>

    <div class="grid">
      <div class="card">
        <h2>Leads Captured</h2>
        <div class="stat" id="leadCount">0</div>
      </div>
      <div class="card">
        <h2>Support Tickets</h2>
        <div class="stat orange" id="ticketCount">0</div>
      </div>
      <div class="card">
        <h2>API Calls Today</h2>
        <div class="stat green" id="apiCount">0</div>
      </div>
      <div class="card">
        <h2>Active Bots</h2>
        <div class="stat green" id="botCount">7</div>
      </div>
    </div>

    <div class="grid" style="margin-top: 20px;">
      <div class="card">
        <h2>🤖 Telegram Bots</h2>
        <ul class="bot-list">
          <li><span><span class="status online"></span>Boti1904</span><span>@Boti1904_bot</span></li>
          <li><span><span class="status online"></span>PaperChaser</span><span>@paperchaserSGK_bot</span></li>
          <li><span><span class="status online"></span>Bot-Wave Trades</span><span>@jobsiteSGK_bot</span></li>
          <li><span><span class="status online"></span>Bot-Wave Design</span><span>@banksySGK_bot</span></li>
          <li><span><span class="status online"></span>Captain Obvious</span><span>@CaptainObvious_bot</span></li>
          <li><span><span class="status online"></span>Bot-Wave Business</span><span>@moneymakingmitch1904_bot</span></li>
          <li><span><span class="status online"></span>Big Mamma</span><span>@Deth1_bot</span></li>
        </ul>
      </div>

      <div class="card">
        <h2>📊 Recent Leads</h2>
        <table id="leadsTable">
          <thead><tr><th>Name</th><th>Email</th><th>Interest</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <div class="grid" style="margin-top: 20px;">
      <div class="card">
        <h2>🔗 API Keys Active</h2>
        <div class="api-grid">
          <div class="api-item"><span class="key">OpenAI:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">xAI:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">Groq:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">OpenRouter:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">Google:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">Ollama:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">Brave Search:</span> <span class="val">●</span></div>
          <div class="api-item"><span class="key">Discord:</span> <span class="val">●</span></div>
        </div>
      </div>

      <div class="card">
        <h2>⚡ Quick Actions</h2>
        <button class="btn" onclick="alert('Bot restart initiated!')">Restart All Bots</button>
        <button class="btn" onclick="alert('Exporting data...')" style="margin-left:10px;background:#1f6feb;">Export Data</button>
      </div>
    </div>
  </div>

  <script>
    // Load data
    fetch('data/leads.json').then(r=>r.json()).then(d=>{
      document.getElementById('leadCount').textContent = d.length;
      const tbody = document.querySelector('#leadsTable tbody');
      d.slice(-5).forEach(l=>{
        tbody.innerHTML += `<tr><td>${l.name||'-'}</td><td>${l.email||'-'}</td><td>${l.interest||'-'}</td></tr>`;
      });
    });
    fetch('data/tickets.json').then(r=>r.json()).then(d=>{
      document.getElementById('ticketCount').textContent = d.length;
    });
  </script>
</body>
</html>
EOF

# ============ BOT HANDLER ============
cat > bot-handler.js << 'EOF'
const { Bot } = require('grammy');
const fs = require('fs');
const path = require('path');

const BOTS = {
  bot1: { token: process.env.TELEGRAM_BOT_1, name: 'Boti1904' },
  bot2: { token: process.env.TELEGRAM_BOT_2, name: 'PaperChaser' },
  bot3: { token: process.env.TELEGRAM_BOT_3, name: 'Bot-Wave Trades' },
  bot4: { token: process.env.TELEGRAM_BOT_4, name: 'Bot-Wave Design' },
  bot5: { token: process.env.TELEGRAM_BOT_5, name: 'Captain Obvious' },
  bot6: { token: process.env.TELEGRAM_BOT_6, name: 'Bot-Wave Business' },
  bot7: { token: process.env.TELEGRAM_BOT_7, name: 'Big Mamma' },
};

const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

// Helper to save data
function saveData(file, newData) {
  const data = JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
  data.push({ ...newData, timestamp: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Bot handlers
Object.entries(BOTS).forEach(([key, bot]) => {
  if (!bot.token) return;

  const tbot = new Bot(bot.token);

  tbot.command('start', async (ctx) => {
    await ctx.reply(`🤖 Welcome to ${bot.name}!\n\nI'm your AI assistant. Use /lead to capture leads, /help for support, or just chat with me.`);
  });

  tbot.command('lead', async (ctx) => {
    await ctx.reply('📝 Lead Capture\n\nWhat is your name?');
    // Simple state management - in production use session middleware
  });

  tbot.command('help', async (ctx) => {
    await ctx.reply('🆘 Support\n\nDescribe your issue and I\'ll create a ticket.');
  });

  tbot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;
    // Echo with AI - integrate Ollama here
    await ctx.reply(`💬 Received: ${text}\n\n(This is a demo - connect Ollama for AI responses)`);
  });

  tbot.start();
  console.log(`✅ ${bot.name} running`);
});

console.log('🎯 Botwave handlers started');
EOF

# ============ SYSTEMD SERVICE ============
cat > ~/.config/systemd/user/botwave.service << 'EOF'
[Unit]
Description=Botwave Business Platform
After=network.target

[Service]
Type=simple
WorkingDirectory=%h/botwave
ExecStart=/usr/bin/node %h/botwave/bot-handler.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

echo "✅ Botwave setup complete!"
echo ""
echo "To start 24/7:"
echo "  systemctl --user daemon-reload"
echo "  systemctl --user enable --now botwave"
echo ""
echo "Web dashboard: ~/botwave/public/index.html"
