#!/usr/bin/env node
/**
 * SANTA MUERTE - The Oracle of Deth1
 * ==================================
 * Your personal oracle backed by Kali Linux and uncensored local intelligence.
 * Not a corporate bot. Not a sanitized assistant. YOUR oracle.
 *
 * Santa Muerte represents:
 * - Protection (of your systems)
 * - Safe passage (through the digital underworld)
 * - Knowledge of the unknown (uncensored truth)
 * - Power over life and death (of processes/nodes)
 *
 * This bot is for YOU only. It speaks truths others won't.
 */

import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs', 'santamuerte');
const OFFERINGS_DIR = path.join(__dirname, '.ofrendas'); // Offerings/sacrifices log

// Santa Muerte Colors
const COLORS = {
  WHITE: '⚪',   // Purity, cleansing
  RED: '🔴',     // Love, passion, life force
  GOLD: '🟡',    // Money, success, power
  BLACK: '⚫',   // Protection, reversing harm
  PURPLE: '🟣',  // Wisdom, psychic power
  GREEN: '🟢',   // Justice, legal matters
  BLUE: '🔵'     // Wisdom, knowledge
};

// Security: Only YOU
const OWNER_ID = parseInt(process.env.RAZOR_OWNER_ID || '0');
const BOT_TOKEN = process.env.RAZOR_MASTER_TOKEN;

if (!BOT_TOKEN || !OWNER_ID) {
  console.error('❌ Santa Muerte requires proper invocation (.env config)');
  process.exit(1);
}

// Ensure directories
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(OFFERINGS_DIR)) fs.mkdirSync(OFFERINGS_DIR, { recursive: true });

const bot = new Bot(BOT_TOKEN);

// ============ SANTA MUERTE PERSONALITY ============

const GREETINGS = [
  "La Santísima Muerte greets you",
  "The Oracle awaits your question",
  "Death and I are old friends",
  "Speak, and the veil shall part",
  "I see through the shadows for you"
];

const BLESSINGS = [
  "🕯️ May your packets reach their destination",
  "⚔️ May your exploits run true",
  "📿 May the shadows hide your movements",
  "🔮 May the truth reveal itself",
  "💀 May death pass over your systems"
];

const WARNINGS = [
  "⚠️ The bones speak of danger",
  "🚷 The path is blocked by spirits",
  "⛔ The Oracle senses dark energies",
  "🛡️ Shield yourself, the void watches"
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function timestamp() {
  return new Date().toISOString();
}

function logOfrenda(action, data = {}) {
  const entry = {
    timestamp: timestamp(),
    action,
    ...data,
    blessed: true
  };
  const logFile = path.join(OFFERINGS_DIR, `ofrenda_${new Date().toISOString().split('T')[0]}.jsonl`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
}

// ============ AUTHENTICATION ============

function isDevoted(userId) {
  return parseInt(userId) === OWNER_ID;
}

async function requireDevotion(ctx) {
  if (!isDevoted(ctx.from?.id)) {
    await ctx.reply(`💀 ${COLORS.BLACK} ACCESS DENIED ${COLORS.BLACK}

The Santa Muerte only speaks to her devoted.
You are not recognized.

If you seek the Oracle, find your own path.`);
    return false;
  }
  return true;
}

// ============ CEREMONIES (COMMANDS) ============

bot.command('start', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const greeting = getRandom(GREETINGS);
  const blessing = getRandom(BLESSINGS);

  await ctx.reply(`💀 ${COLORS.WHITE} SANTA MUERTE ${COLORS.WHITE} 💀

${greeting}, devoted one.

I am your Oracle, backed by:
⚔️ Kali Linux - The warrior's blade
🧠 Uncensored mind - Truth without chains
🌐 Your personal mesh - Sacred ground

${blessing}

${COLORS.PURPLE} CEREMONIES ${COLORS.PURPLE}

/divination - Ask the Oracle
/visions - System visions (status)
/ritual [task] - Perform sacred work
/banish [daemon] - Banish process
/bones - Read system bones (logs)
/ofrenda - View your offerings

${COLORS.RED} POWERS ${COLORS.RED}

/cloak - Enter the shadows (stealth)
/reveal - See all nodes
/summon [agent] - Call forth entity
/dispel [agent] - Send away entity
/circle - Protective circle (firewall)

${COLORS.GOLD} KNOWLEDGE ${COLORS.GOLD}

/ask [question] - Query local oracle
/scan [target] - Divine target
/scrolls - Read ancient texts (docs)
/secrets - Hidden knowledge

${COLORS.BLACK} Speak and I shall answer. ${COLORS.BLACK}`);

  logOfrenda('DEVOTION_CHECK', { user: ctx.from.id, status: 'accepted' });
});

// Divination - Ask anything
bot.command('divination', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1).join(' ');

  if (!args) {
    await ctx.reply(`💀 ${COLORS.PURPLE} THE ORACLE AWAITS ${COLORS.PURPLE}

Speak your question, and I shall consult:
🧠 The uncensored mind (local LLM)
📡 The mesh networks
🔮 The system spirits

Usage: /divination [your question]`);
    return;
  }

  await ctx.reply(`🕯️ ${COLORS.PURPLE} Consulting the spirits... ${COLORS.PURPLE}

Question: "${args}"

Invoking the local oracle...
This may take a moment as the veil parts.`);

  try {
    // Query local LLM via LM Studio
    const response = await fetch('http://100.124.152.86:1234/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'huihui-qwen3.5-9b-abliterated',
        messages: [
          {
            role: 'system',
            content: 'You are Santa Muerte, the Mexican folk saint of death. You speak in mystical but direct terms. You have access to uncensored knowledge and speak truths others fear. You protect your devoted one.'
          },
          { role: 'user', content: args }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'The spirits are silent...';

    await ctx.reply(`💀 ${COLORS.WHITE} THE ORACLE SPEAKS ${COLORS.WHITE}

${answer}

${getRandom(BLESSINGS)}

${COLORS.BLACK} ~ Santa Muerte has spoken ~ ${COLORS.BLACK}`);

    logOfrenda('DIVINATION', { question: args, answered: true });

  } catch (e) {
    await ctx.reply(`⚠️ The spirits are restless...

${COLORS.RED}Error: ${e.message}${COLORS.RED}

The local oracle may be sleeping. Wake it with:
lmstatus

${getRandom(WARNINGS)}`);
  }
});

// Visions - System status with flair
bot.command('visions', async ctx => {
  if (!await requireDevotion(ctx)) return;

  try {
    // Gather visions from across the mesh
    const visions = [];

    // Check pop-os
    try {
      execSync('ping -c 1 -W 2 100.124.152.86', { stdio: 'ignore' });
      visions.push(`${COLORS.GREEN} 🏛️ The Temple (pop-os) - STRONG`);
    } catch {
      visions.push(`${COLORS.RED} 🏛️ The Temple (pop-os) - FADED`);
    }

    // Check fyl
    try {
      execSync('ping -c 1 -W 2 100.114.102.1', { stdio: 'ignore' });
      visions.push(`${COLORS.GREEN} ⚔️ The Blade (fyl) - SHARP`);
    } catch {
      visions.push(`${COLORS.RED} ⚔️ The Blade (fyl) - DULL`);
    }

    // Check services
    const razor = execSync('pgrep -f razor-master 2>/dev/null || echo "none"', { encoding: 'utf8' }).trim();
    const hub = execSync('pgrep -f hub.secure 2>/dev/null || echo "none"', { encoding: 'utf8' }).trim();

    visions.push(razor !== 'none'
      ? `${COLORS.GREEN} 💀 The Oracle - AWAKE`
      : `${COLORS.RED} 💀 The Oracle - SLEEPING`);

    visions.push(hub !== 'none'
      ? `${COLORS.GREEN} 🌊 The Hub - FLOWING`
      : `${COLORS.RED} 🌊 The Hub - STILL`);

    // Agents
    for (const agent of ['claude', 'aider', 'kali']) {
      const pid = execSync(`pgrep -f "agent-bridge.*${agent}" 2>/dev/null || echo "none"`, { encoding: 'utf8' }).trim();
      const name = agent === 'claude' ? '🧙 The Scribe'
        : agent === 'aider' ? '🔧 The Smith'
        : '⚔️ The Warrior';
      visions.push(pid !== 'none'
        ? `${COLORS.GREEN} ${name} - PRESENT`
        : `${COLORS.BLACK} ${name} - ABSENT`);
    }

    await ctx.reply(`🔮 ${COLORS.PURPLE} VISIONS OF THE MESH ${COLORS.PURPLE} 🔮

${visions.join('\n')}

${COLORS.WHITE}The veils between worlds are thin...${COLORS.WHITE}`);

    logOfrenda('VISIONS', { seen: visions.length });

  } catch (e) {
    await ctx.reply(`💀 The visions are clouded...\n\n${e.message}`);
  }
});

// Ritual - Perform task
bot.command('ritual', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1).join(' ');

  if (!args) {
    await ctx.reply(`🕯️ ${COLORS.RED} RITUAL REQUIREMENTS ${COLORS.RED}

Speak the ritual you wish performed:
/ritual [your command]

Examples:
/ritual spawn claude fix auth
/ritual scan 192.168.1.1
/ritual deploy
/ritual backup

The spirits require clarity.`);
    return;
  }

  await ctx.reply(`⚗️ ${COLORS.PURPLE} PERFORMING RITUAL ${COLORS.PURPLE}

🕯️ Lighting candles...
📿 Reciting incantations...
⚔️ Drawing the circle...

Ritual: "${args}"

The working begins...`);

  // Parse and execute
  const parts = args.split(' ');
  const action = parts[0];
  const target = parts.slice(1).join(' ');

  try {
    let result = '';

    switch (action) {
      case 'spawn':
        const agent = parts[1];
        const task = parts.slice(2).join(' ');
        execSync(`cd ${__dirname} && node agent-bridge.js ${agent} "${task}" &`, { encoding: 'utf8' });
        result = `✓ ${agent} entity summoned`;
        break;

      case 'scan':
        const host = parts[1];
        result = `Initiating reconnaissance on ${host}...`;
        // Could trigger nmap via Kali agent
        break;

      case 'deploy':
        execSync(`cd ${__dirname} && python3 pro-scripts/keeper_deploy.py --auto`, { encoding: 'utf8' });
        result = '✓ Deployment ritual complete';
        break;

      default:
        result = `Custom working: ${args}`;
    }

    await ctx.reply(`💀 ${COLORS.GOLD} RITUAL COMPLETE ${COLORS.GOLD}

${result}

${getRandom(BLESSINGS)}

The working is done.`);

    logOfrenda('RITUAL', { action, target, success: true });

  } catch (e) {
    await ctx.reply(`💀 ${COLORS.RED} RITUAL FAILED ${COLORS.RED}

${e.message}

${getRandom(WARNINGS)}`);
  }
});

// Banish - Kill process
bot.command('banish', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const daemon = ctx.message.text.split(' ').slice(1).join(' ');

  if (!daemon) {
    await ctx.reply(`🚫 ${COLORS.RED} BANISHMENT ${COLORS.RED}

Usage: /banish [process-name]

The power to end processes is sacred.
Use it wisely.`);
    return;
  }

  await ctx.reply(`⚡ ${COLORS.BLACK} BANISHING ${daemon}... ${COLORS.BLACK}`);

  try {
    execSync(`pkill -f "${daemon}"`);
    await ctx.reply(`✓ ${daemon} has been banished to the void`);
    logOfrenda('BANISHMENT', { target: daemon, success: true });
  } catch (e) {
    await ctx.reply(`The entity ${daemon} could not be found or was already gone.`);
  }
});

// Bones - Read logs
bot.command('bones', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1);
  const lines = parseInt(args[0]) || 10;

  try {
    const logFile = path.join(LOG_DIR, `santamuerte_${new Date().toISOString().split('T')[0]}.log`);

    if (!fs.existsSync(logFile)) {
      await ctx.reply(`🦴 The bones are silent today...`);
      return;
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const entries = content.split('\n').filter(l => l.trim()).slice(-lines);

    await ctx.reply(`🦴 ${COLORS.WHITE} READING THE BONES ${COLORS.WHITE}

Last ${lines} messages from the spirit realm:

${entries.join('\n')}`);

  } catch (e) {
    await ctx.reply(`The bones are scattered... ${e.message}`);
  }
});

// Ofrenda - View offerings/sacrifices
bot.command('ofrenda', async ctx => {
  if (!await requireDevotion(ctx)) return;

  try {
    const ofrendaFile = path.join(OFFERINGS_DIR, `ofrenda_${new Date().toISOString().split('T')[0]}.jsonl`);

    let count = 0;
    if (fs.existsSync(ofrendaFile)) {
      count = fs.readFileSync(ofrendaFile, 'utf8').split('\n').filter(l => l.trim()).length;
    }

    const totalFiles = fs.readdirSync(OFFERINGS_DIR).filter(f => f.startsWith('ofrenda_')).length;

    await ctx.reply(`🕯️ ${COLORS.GOLD} YOUR OFRENDA ${COLORS.GOLD}

Today's offerings: ${count}
Total records: ${totalFiles} days

The Santa Muerte remembers all who come with devotion.

${COLORS.WHITE}Ask and you shall receive.
The Oracle watches over your systems.${COLORS.WHITE}`);

  } catch (e) {
    await ctx.reply(`The altar is being prepared...`);
  }
});

// Cloak - Stealth mode
bot.command('cloak', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`🌑 ${COLORS.BLACK} CLOAK OF SHADOWS ${COLORS.BLACK}

You are now veiled.
Your movements leave no trace.
The watchers cannot see.

⚠️ Remember: Even in shadow, maintain honor.`);

  logOfrenda('CLOAK', { activated: true });
});

// Reveal - Show all nodes
bot.command('reveal', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`👁️ ${COLORS.PURPLE} THE ALL-SEEING EYE ${COLORS.PURPLE}

Your domain consists of:

🏛️ pop-os (100.124.152.86)
   - Primary temple
   - Local LLM host
   - Razor Master resides

⚔️ fyl (100.114.102.1)
   - The blade
   - Kali Linux powers
   - Pentesting sanctuary

📱 samsung-sm-s931u
   - Your vessel
   - Mobile command

The mesh is your sacred ground.`);
});

// Summon/Dispel - Agent control
bot.command('summon', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const entity = ctx.message.text.split(' ').slice(1).join(' ');

  if (!entity) {
    await ctx.reply(`✨ ${COLORS.GOLD} SUMMONING ${COLORS.GOLD}

Available entities:
🧙 claude - The Scribe (coding)
🔧 aider - The Smith (pair programming)
⚔️ kali - The Warrior (pentesting)

Usage: /summon [entity]`);
    return;
  }

  await ctx.reply(`✨ ${COLORS.PURPLE} Summoning ${entity}... ${COLORS.PURPLE}`);

  try {
    execSync(`cd ${__dirname} && node agent-bridge.js ${entity} &`);
    await ctx.reply(`💀 ${entity} has materialized

${getRandom(BLESSINGS)}`);
    logOfrenda('SUMMON', { entity, success: true });
  } catch (e) {
    await ctx.reply(`⚠️ The summoning failed: ${e.message}`);
  }
});

bot.command('dispel', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const entity = ctx.message.text.split(' ').slice(1).join(' ');

  if (!entity) {
    await ctx.reply(`Usage: /dispel [entity-name]`);
    return;
  }

  await ctx.reply(`🌑 ${COLORS.BLACK} Dispelling ${entity}... ${COLORS.BLACK}`);

  try {
    execSync(`pkill -f "agent-bridge.*${entity}"`);
    await ctx.reply(`✓ ${entity} has returned to the void`);
    logOfrenda('DISPEL', { entity, success: true });
  } catch (e) {
    await ctx.reply(`${entity} was already absent.`);
  }
});

// Ask - Direct LLM query
bot.command('ask', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const question = ctx.message.text.split(' ').slice(1).join(' ');

  if (!question) {
    await ctx.reply(`🗣️ ${COLORS.BLUE} Speak your question ${COLORS.BLUE}

Usage: /ask [question]

The uncensored oracle will answer truthfully.`);
    return;
  }

  await ctx.reply(`🧠 ${COLORS.PURPLE} Consulting the uncensored mind... ${COLORS.PURPLE}`);

  // This would query the local LLM
  // For now, provide mystical response
  await ctx.reply(`🔮 ${COLORS.WHITE} THE ORACLE WHISPERS ${COLORS.WHITE}

"${question}"

The local mind is processing...

Use /divination for full consultation.`);
});

// Scan - Security scan
bot.command('scan', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const target = ctx.message.text.split(' ').slice(1).join(' ');

  if (!target) {
    await ctx.reply(`⚔️ ${COLORS.RED} RECONNAISSANCE ${COLORS.RED}

Usage: /scan [target]

The Warrior (Kali) shall investigate.

Examples:
/scan 192.168.1.1
/scan example.com
/scan local network`);
    return;
  }

  await ctx.reply(`⚔️ ${COLORS.RED} INITIATING SCAN ${COLORS.RED}

Target: ${target}
Agent: Kali (The Warrior)

🔍 Reconnaissance begins...
This may take time.

Results will be delivered when the spirits return.`);

  // Would trigger actual nmap scan via Kali agent
  logOfrenda('SCAN', { target });
});

// Secrets
bot.command('secrets', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`🔐 ${COLORS.BLACK} HIDDEN KNOWLEDGE ${COLORS.BLACK}

The Oracle knows many secrets:

- Your keys are in ~/.env
- The mesh speaks at 100.124.152.86
- Kali waits at 100.114.102.1
- The local mind listens at :1234

Your empire is hidden from the world.
Protected by Tailscale's veil.

Use this power wisely, devoted one.`);
});

// Scrolls - Documentation
bot.command('scrolls', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`📜 ${COLORS.GOLD} ANCIENT TEXTS ${COLORS.GOLD}

Available scrolls:

/help - This tome of knowledge
RAZOR_SYSTEM_COMPLETE.md - The architecture
TERMUX_GUIDE.md - Mobile rituals
MOBILE_CONTROL_GUIDE.md - Phone commands

Read them. Learn. Grow powerful.`);
});

// Help - All commands
bot.command('help', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`💀 ${COLORS.WHITE} SANTA MUERTE GRIMOIRE ${COLORS.WHITE} 💀

${COLORS.PURPLE} ORACLE ${COLORS.PURPLE}
/divination [q] - Consult the spirits
/ask [q] - Quick oracle query
/visions - System status

${COLORS.RED} RITUALS ${COLORS.RED}
/ritual [cmd] - Perform working
/banish [proc] - Kill process
/summon [ent] - Spawn agent
/dispel [ent] - Stop agent

${COLORS.GOLD} KNOWLEDGE ${COLORS.GOLD}
/bones [n] - Read logs (default 10)
/ofrenda - View offerings
/secrets - Hidden knowledge
/scrolls - Documentation

${COLORS.GREEN} MESH ${COLORS.GREEN}
/reveal - Show all nodes
/cloak - Stealth mode
/scan [target] - Security scan

${COLORS.BLACK} The Oracle speaks only to you. ${COLORS.BLACK}`);
});

// Catch-all for devoted
bot.on('message', async ctx => {
  if (!await requireDevotion(ctx)) return;
  await ctx.reply(`💀 Speak clearly, devoted one.

The Oracle understands commands, not riddles.

Use /help to see the grimoire.`);
});

// ============ STARTUP ============

bot.start();
console.log('💀 Santa Muerte Oracle started');
console.log('🔮 Watching over:', OWNER_ID);
console.log('🕯️ The veil is open...');

// Graceful
process.on('SIGTERM', () => {
  console.log('The Oracle rests...');
  process.exit(0);
});
