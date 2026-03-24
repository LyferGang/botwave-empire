#!/usr/bin/env node
/**
 * Botwave Empire Orchestrator
 * Control your entire empire from your phone via Telegram
 * Only YOU can access it (owner ID check)
 */

import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs');
const DATA_DIR = path.join(__dirname, 'data');
const LOCAL_FORGE_DIR = path.join(__dirname, 'local-forge');

// Owner verification - ONLY your Telegram ID can control this
const OWNER_ID = parseInt(process.env.ORCHESTRATOR_OWNER_ID || '0');
const BOT_TOKEN = process.env.TELEGRAM_ORCHESTRATOR_TOKEN;

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_ORCHESTRATOR_TOKEN not set in .env');
  console.error('1. Create bot via @BotFather');
  console.error('2. Get your ID via @userinfobot');
  console.error('3. Add both to .env');
  process.exit(1);
}

if (!OWNER_ID || OWNER_ID === 0) {
  console.error('❌ ORCHESTRATOR_OWNER_ID not set in .env');
  console.error('Find your Telegram ID: message @userinfobot');
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// Security: Only owner can use commands
function isOwner(userId) {
  return parseInt(userId) === OWNER_ID;
}

// Reject unauthorized users
async function checkAuth(ctx) {
  if (!isOwner(ctx.from?.id)) {
    await ctx.reply('⛔ ACCESS DENIED\n\nThis bot is for owner only.');
    return false;
  }
  return true;
}

// ========== EMPIRE COMMANDS ==========

bot.command('start', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply(`👑 BOTWAVE EMPIRE ORCHESTRATOR

Control your entire operation from your phone.

┌─ BOTS ─────────────────────┐
│ /bots - List all 7 bots    │
│ /startbot - Start hub      │
│ /stopbot - Stop hub        │
│ /restart - Restart hub     │
│ /testbot - Test @Boti1904  │
└────────────────────────────┘

┌─ RAZOR AGENT ──────────────┐
│ /spawn - Spawn Razor       │
│ /razorstatus - Check Razor │
│ /razorstop - Stop Razor    │
└────────────────────────────┘

┌─ ANALYTICS ────────────────┐
│ /stats - Today's stats     │
│ /leads - View leads        │
│ /logs - View audit logs    │
│ /revenue - Revenue calc    │
└────────────────────────────┘

┌─ SYSTEM ───────────────────┐
│ /lmstudio - Check LM       │
│ /dashboard - Dashboard URL │
│ /help - All commands       │
└────────────────────────────┘

Only YOUR Telegram ID can use these commands.`);
});

// ========== BOT CONTROL ==========

bot.command('bots', async ctx => {
  if (!await checkAuth(ctx)) return;

  const bots = [
    { name: 'Boti1904', vertical: 'Plumber', handle: '@Boti1904' },
    { name: 'PaperChaser', vertical: 'Electrician', handle: '@PaperChaser' },
    { name: 'Trades', vertical: 'HVAC', handle: '@Trades' },
    { name: 'Design', vertical: 'General Contractor', handle: '@Design' },
    { name: 'Captain', vertical: 'Locksmith', handle: '@Captain' },
    { name: 'Business', vertical: 'Small Business', handle: '@Business' },
    { name: 'Mamma', vertical: 'Restaurant', handle: '@Mamma' },
  ];

  const ps = execSync('ps aux | grep "node hub.secure" | grep -v grep', { encoding: 'utf8' }).trim();
  const status = ps ? '🟢 RUNNING' : '🔴 STOPPED';

  let msg = `📞 BOTWAVE HUB STATUS: ${status}\n\n`;
  bots.forEach(b => {
    msg += `• ${b.name} (${b.vertical})\n  ${b.handle}\n\n`;
  });

  msg += `Test any bot: open Telegram → search handle → /start → /estimate`;
  await ctx.reply(msg);
});

bot.command('startbot', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply('🚀 Starting Botwave Hub...');

  try {
    const result = execSync(`cd ${__dirname} && node hub.secure.js &`, { encoding: 'utf8' });
    setTimeout(() => {}, 2000);
    const ps = execSync('ps aux | grep "node hub.secure" | grep -v grep', { encoding: 'utf8' });
    await ctx.reply(`✅ Hub started\n\n${ps}`);
  } catch (e) {
    await ctx.reply(`❌ Start failed: ${e.message}`);
  }
});

bot.command('stopbot', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply('🛑 Stopping Botwave Hub...');

  try {
    execSync('pkill -f "node hub.secure"', { encoding: 'utf8' });
    await ctx.reply('✅ Hub stopped');
  } catch (e) {
    await ctx.reply(`❌ Stop failed: ${e.message}`);
  }
});

bot.command('restart', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply('🔄 Restarting Botwave Hub...');

  try {
    execSync('pkill -f "node hub.secure"; sleep 1; node hub.secure.js &', { cwd: __dirname, encoding: 'utf8' });
    setTimeout(() => {}, 2000);
    await ctx.reply('✅ Hub restarted');
  } catch (e) {
    await ctx.reply(`❌ Restart failed: ${e.message}`);
  }
});

bot.command('testbot', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply('🧪 Test a bot:\n\n1. Open Telegram\n2. Search: @Boti1904\n3. Send: /start\n4. Send: /estimate\n5. Follow the flow\n\nExpected: 3 questions → instant estimate');
});

// ========== RAZOR AGENT ==========

bot.command('spawn', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply('🪙 Spawning Razor agent...');

  try {
    const result = execSync(`cd ${LOCAL_FORGE_DIR} && npm run spawn -- razor 2>&1`, { encoding: 'utf8' });
    await ctx.reply(`✅ Razor spawned\n\n${result.slice(0, 3500)}`);
  } catch (e) {
    await ctx.reply(`❌ Spawn failed\n\n${e.message.slice(0, 3500)}`);
  }
});

bot.command('razorstatus', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const docker = execSync('docker ps --filter "name=razor" --format "{{.Names}}\\t{{.Status}}" 2>&1', { encoding: 'utf8' });
    const ps = execSync('ps aux | grep -E "razor|claude" | grep -v grep', { encoding: 'utf8' });

    await ctx.reply(`🪙 RAZOR STATUS\n\nDocker:\n${docker || 'No Razor containers'}\n\nProcesses:\n${ps || 'None'}`);
  } catch (e) {
    await ctx.reply(`Status: ${e.message}`);
  }
});

bot.command('razorstop', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    execSync('docker ps --filter "name=razor" -q | xargs docker stop 2>/dev/null || true', { encoding: 'utf8' });
    await ctx.reply('🛑 Razor stopped');
  } catch (e) {
    await ctx.reply(`Stop: ${e.message}`);
  }
});

// ========== ANALYTICS ==========

bot.command('stats', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
    const tickets = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tickets.json'), 'utf8'));
    const messages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'messages.json'), 'utf8'));

    const logFile = path.join(LOG_DIR, 'audit_' + new Date().toISOString().split('T')[0] + '.log');
    const logCount = fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8').split('\n').filter(l => l.trim()).length : 0;

    await ctx.reply(`📊 BOTWAVE STATS

Leads captured: ${leads.length}
Tickets: ${tickets.length}
Messages: ${messages.length}
Log entries today: ${logCount}

Dashboard: http://localhost:3001`);
  } catch (e) {
    await ctx.reply(`Stats error: ${e.message}`);
  }
});

bot.command('leads', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
    if (leads.length === 0) {
      await ctx.reply('No leads captured yet.');
      return;
    }

    let msg = '📋 CAPTURED LEADS\n\n';
    leads.slice(-10).forEach((l, i) => {
      msg += `${i + 1}. ${l.vertical || 'unknown'} - $${l.value || 0}\n   ${new Date(l.created).toLocaleString()}\n\n`;
    });

    if (leads.length > 10) msg += `...and ${leads.length - 10} more`;
    await ctx.reply(msg);
  } catch (e) {
    await ctx.reply(`Leads error: ${e.message}`);
  }
});

bot.command('logs', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const logFile = path.join(LOG_DIR, 'audit_' + new Date().toISOString().split('T')[0] + '.log');
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8').slice(-3500);
      await ctx.reply(`📝 TODAY'S LOGS\n\n${content}`);
    } else {
      await ctx.reply('No audit log today (starts when calls come in)');
    }
  } catch (e) {
    await ctx.reply(`Log error: ${e.message}`);
  }
});

bot.command('revenue', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
    const total = leads.reduce((sum, l) => sum + (parseInt(l.value) || 0), 0);

    await ctx.reply(`💰 REVENUE CAPTURED

Total leads: ${leads.length}
Total value: $${total.toLocaleString()}

Pricing:
- Solo: $299/mo
- Team: $399/mo
- Enterprise: $499/mo

One captured call pays for the month. Rest is profit.`);
  } catch (e) {
    await ctx.reply(`Revenue error: ${e.message}`);
  }
});

// ========== SYSTEM ==========

bot.command('lmstudio', async ctx => {
  if (!await checkAuth(ctx)) return;

  try {
    const result = execSync('curl -s http://127.0.0.1:1234/v1/chat/completions -H "Content-Type: application/json" -d \'{"model":"huihui-qwen3.5-9b-abliterated","messages":[{"role":"user","content":"OK"}]}\'', { encoding: 'utf8' });

    if (result.includes('choices')) {
      await ctx.reply('✅ LM STUDIO: ONLINE\n\nModel: huihui-qwen3.5-9b-abliterated\nEndpoint: 127.0.0.1:1234\nCost: $0 (local)');
    } else {
      await ctx.reply('❌ LM STUDIO: OFFLINE\n\nStart LM Studio → Load model → Start Server');
    }
  } catch (e) {
    await ctx.reply(`❌ LM STUDIO: OFFLINE\n\n${e.message}`);
  }
});

bot.command('dashboard', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply(`📊 DASHBOARD URLS

Landing Page: http://localhost:3001
Agent Dashboard: http://localhost:3001/agent.html

Open in browser to see:
- Loss calculator
- 7 vertical cards
- Pricing tiers
- Agent control panel`);
});

bot.command('help', async ctx => {
  if (!await checkAuth(ctx)) return;

  await ctx.reply(`👑 BOTWAVE COMMANDS

BOTS:
  /bots - List all 7 bots
  /startbot - Start hub
  /stopbot - Stop hub
  /restart - Restart hub
  /testbot - Test flow

RAZOR:
  /spawn - Spawn Razor agent
  /razorstatus - Check status
  /razorstop - Stop Razor

ANALYTICS:
  /stats - Today's stats
  /leads - View leads
  /logs - Audit logs
  /revenue - Revenue calc

SYSTEM:
  /lmstudio - Check LM Studio
  /dashboard - Dashboard URLs
  /start - Main menu

Only YOUR Telegram ID can use these.`);
});

// ========== CANCEL ALL FOR NON-OWNER ==========

bot.on('message', async ctx => {
  if (!await checkAuth(ctx)) return;
  await ctx.reply('Unknown command. Use /help for commands.');
});

// ========== START ==========

bot.start();
console.log(`✅ Orchestrator bot started`);
console.log(`🔒 Owner-only: Telegram ID ${OWNER_ID}`);
console.log(`📱 Control empire from your phone`);
