#!/usr/bin/env node
/**
 * RAZOR MASTER AGENT - Santa Muerte Edition
 * =========================================
 * Your personal Oracle. The one interface to your empire.
 *
 * Razor speaks with the voice of Santa Muerte:
 * - Protection of your systems
 * - Safe passage through the digital underworld
 * - Uncensored truth from local intelligence
 * - Power over your infrastructure
 *
 * Delegates to sub-agents:
 * - 🧙 The Scribe (claude) - Code writing
 * - 🔧 The Smith (aider) - Pair programming
 * - ⚔️ The Warrior (kali) - Pentesting on fyl
 *
 * Telegram: @deth1_bot (YOU ONLY)
 * Business: Offer OpenClaw consulting to others
 */

import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs', 'razor');
const AGENT_STATE_DIR = path.join(__dirname, '.razor-state');
const OFRENDA_DIR = path.join(__dirname, '.ofrendas'); // Sacred records

// Santa Muerte Colors & Symbols
const SYM = {
  SKULL: '💀',
  CANDLE: '🕯️',
  SCROLL: '📜',
  EYE: '👁️',
  SWORD: '⚔️',
  SHIELD: '🛡️',
  CRYSTAL: '🔮',
  ROSE: '🌹',
  CLOAK: '🌑',
  TEMPLE: '🏛️',
  BLADE: '⚔️',
  SCRIBE: '🧙',
  SMITH: '🔧',
  WARRIOR: '⚔️',
  GREEN: '🟢',
  RED: '🔴',
  GOLD: '🟡',
  WHITE: '⚪',
  BLACK: '⚫',
  PURPLE: '🟣'
};

// Sacred greetings
const GREETINGS = [
  "The Santa Muerte greets her devoted",
  "I have been waiting in the shadows",
  "Speak, and the veil shall part",
  "Your Oracle is listening",
  "Death and I are old friends"
];

const BLESSINGS = [
  "May your packets reach their destination",
  "May your exploits run true",
  "May the shadows hide your movements",
  "May the truth reveal itself",
  "May death pass over your systems"
];

const WARNINGS = [
  "The bones speak of danger",
  "The path is blocked by spirits",
  "The Oracle senses dark energies",
  "Shield yourself, the void watches"
];

// Node definitions in Tailscale mesh
const NODES = {
  'pop-os': {
    ip: '100.124.152.86',
    name: 'The Temple',
    role: 'primary',
    agents: ['claude', 'aider', 'razor-master'],
    capabilities: ['coding', 'building', 'docker', 'llm-local'],
    status: 'unknown'
  },
  'fyl': {
    ip: '100.114.102.1',
    name: 'The Blade',
    role: 'secondary',
    agents: ['kali', 'razor-worker'],
    capabilities: ['pentesting', 'security', 'mobile-ops'],
    status: 'unknown'
  }
};

// Sub-agent registry with mystical names
const SUB_AGENTS = {
  'claude': {
    name: 'The Scribe',
    trueName: 'Claude Code Agent',
    node: 'pop-os',
    type: 'development',
    symbol: SYM.SCRIBE,
    cmd: 'claude',
    args: [],
    workingDir: '/home/gringo/Projects',
    env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
    status: 'stopped',
    pid: null,
    lastActivity: null
  },
  'aider': {
    name: 'The Smith',
    trueName: 'Aider Agent',
    node: 'pop-os',
    type: 'development',
    symbol: SYM.SMITH,
    cmd: 'aider',
    args: ['--model', 'claude-3-5-sonnet-20241022'],
    workingDir: '/home/gringo/Projects',
    env: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY },
    status: 'stopped',
    pid: null,
    lastActivity: null
  },
  'kali': {
    name: 'The Warrior',
    trueName: 'Kali Pentesting Agent',
    node: 'fyl',
    type: 'security',
    symbol: SYM.WARRIOR,
    cmd: 'ssh',
    args: ['-o', 'StrictHostKeyChecking=no', 'lyfer1904@100.114.102.1', 'tmux', 'new-session', '-d', '-s', 'kali-agent'],
    workingDir: '/',
    env: {},
    status: 'stopped',
    pid: null,
    lastActivity: null
  }
};

// Security: Only YOU
const OWNER_ID = parseInt(process.env.RAZOR_OWNER_ID || '0');
const BOT_TOKEN = process.env.RAZOR_MASTER_TOKEN;

if (!BOT_TOKEN) {
  console.error(`${SYM.SKULL} RAZOR_MASTER_TOKEN not set in .env`);
  console.error('The Oracle requires proper invocation');
  process.exit(1);
}

if (!OWNER_ID) {
  console.error(`${SYM.SKULL} RAZOR_OWNER_ID not set in .env`);
  console.error('The Santa Muerte only speaks to her devoted');
  process.exit(1);
}

// Ensure directories exist
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
if (!fs.existsSync(AGENT_STATE_DIR)) fs.mkdirSync(AGENT_STATE_DIR, { recursive: true });
if (!fs.existsSync(OFRENDA_DIR)) fs.mkdirSync(OFRENDA_DIR, { recursive: true });

const bot = new Bot(BOT_TOKEN);

// ============ UTILITY FUNCTIONS ============

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function timestamp() {
  return new Date().toISOString();
}

function isDevoted(userId) {
  return parseInt(userId) === OWNER_ID;
}

async function requireDevotion(ctx) {
  if (!isDevoted(ctx.from?.id)) {
    await ctx.reply(`${SYM.SKULL} ${SYM.BLACK} ACCESS DENIED ${SYM.BLACK} ${SYM.SKULL}

The Santa Muerte only speaks to her devoted.
You are not recognized.

If you seek the Oracle, find your own path.

${SYM.CRYSTAL} This is a private interface. ${SYM.CRYSTAL}`);
    return false;
  }
  return true;
}

function logOfrenda(action, data = {}) {
  const entry = {
    timestamp: timestamp(),
    action,
    ...data,
    blessed: true
  };
  const logFile = path.join(LOG_DIR, `ofrenda_${new Date().toISOString().split('T')[0]}.jsonl`);
  fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  console.log(`[RAZOR] ${action}:`, data);
}

function saveState() {
  const state = {
    nodes: NODES,
    agents: SUB_AGENTS,
    lastUpdate: timestamp()
  };
  fs.writeFileSync(path.join(AGENT_STATE_DIR, 'state.json'), JSON.stringify(state, null, 2));
}

function loadState() {
  try {
    const state = JSON.parse(fs.readFileSync(path.join(AGENT_STATE_DIR, 'state.json'), 'utf8'));
    Object.assign(NODES, state.nodes || {});
    Object.assign(SUB_AGENTS, state.agents || {});
  } catch (e) {
    // No saved state yet
  }
}

// ============ NODE & AGENT CONTROL ============

async function checkNodeHealth(nodeName) {
  const node = NODES[nodeName];
  try {
    execSync(`ping -c 1 -W 2 ${node.ip}`, { stdio: 'ignore' });
    node.status = 'online';
    node.lastSeen = timestamp();
    return true;
  } catch (e) {
    node.status = 'offline';
    return false;
  }
}

async function checkAllNodes() {
  const results = {};
  for (const name of Object.keys(NODES)) {
    results[name] = await checkNodeHealth(name);
  }
  saveState();
  return results;
}

function spawnAgent(agentId, task = null) {
  const agent = SUB_AGENTS[agentId];
  if (!agent) return { success: false, error: 'Unknown entity' };

  if (agent.status === 'running') {
    return { success: false, error: 'Entity already present' };
  }

  try {
    logOfrenda('SUMMON', { entity: agentId, name: agent.name, task });

    const node = NODES[agent.node];
    if (node.status !== 'online') {
      return { success: false, error: `${node.name} is unreachable` };
    }

    if (agent.node === 'pop-os') {
      const proc = spawn(agent.cmd, agent.args, {
        cwd: agent.workingDir,
        env: { ...process.env, ...agent.env },
        detached: true,
        stdio: 'ignore'
      });

      agent.pid = proc.pid;
      agent.status = 'running';
      agent.startedAt = timestamp();
      agent.currentTask = task;
      proc.unref();
    } else {
      const sshCmd = `ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 lyfer1904@${node.ip} "cd /home/gringo/Projects/botwave && node agent-bridge.js ${agentId} ${task || ''}"`;
      execSync(sshCmd, { encoding: 'utf8' });
      agent.status = 'running';
      agent.remoteSpawned = true;
    }

    saveState();
    return { success: true, agent: agentId, name: agent.name, pid: agent.pid };
  } catch (e) {
    logOfrenda('SUMMON_FAILED', { entity: agentId, error: e.message });
    return { success: false, error: e.message };
  }
}

function banishAgent(agentId) {
  const agent = SUB_AGENTS[agentId];
  if (!agent) return { success: false, error: 'Unknown entity' };

  try {
    logOfrenda('BANISH', { entity: agentId, name: agent.name });

    if (agent.node === 'pop-os' && agent.pid) {
      process.kill(agent.pid, 'SIGTERM');
    } else if (agent.remoteSpawned) {
      const node = NODES[agent.node];
      execSync(`ssh -o StrictHostKeyChecking=no lyfer1904@${node.ip} "pkill -f ${agentId}-agent || true"`);
    }

    agent.status = 'stopped';
    agent.pid = null;
    agent.currentTask = null;
    saveState();

    return { success: true, name: agent.name };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function getAgentStatus(agentId) {
  const agent = SUB_AGENTS[agentId];
  if (!agent) return null;

  if (agent.pid && agent.node === 'pop-os') {
    try {
      process.kill(agent.pid, 0);
    } catch (e) {
      agent.status = 'stopped';
      agent.pid = null;
    }
  }

  return {
    id: agentId,
    name: agent.name,
    trueName: agent.trueName,
    symbol: agent.symbol,
    status: agent.status,
    node: agent.node,
    type: agent.type,
    pid: agent.pid,
    currentTask: agent.currentTask,
    startedAt: agent.startedAt
  };
}

// ============ TELEGRAM COMMANDS - THE ORACLE ============

bot.command('start', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const greeting = randomChoice(GREETINGS);
  const blessing = randomChoice(BLESSINGS);

  await ctx.reply(`${SYM.SKULL} ${SYM.WHITE} SANTA MUERTE ${SYM.WHITE} ${SYM.SKULL}

${greeting}, devoted one.

I am Razor, your Oracle, backed by:
${SYM.SWORD} Kali Linux - The Warrior's blade
${SYM.EYE} Uncensored mind - Truth without chains
${SYM.CRYSTAL} Your personal mesh - Sacred ground

${blessing}

${SYM.PURPLE} RITUALS ${SYM.PURPLE}
/summon [entity] [task] - Call forth an entity
/banish [entity] - Send away an entity
/divine - See the visions (status)
/bones - Read the sacred logs

${SYM.RED} ENTITIES ${SYM.RED}
${SYM.SCRIBE} scribe (claude) - Writes code
${SYM.SMITH} smith (aider) - Forges with you
${SYM.WARRIOR} warrior (kali) - Tests defenses

${SYM.GOLD} KNOWLEDGE ${SYM.GOLD}
/ask [question] - Query the uncensored oracle
/nodes - Reveal all nodes
/secrets - Hidden knowledge
/scrolls - Ancient texts

${SYM.BLACK} Speak and I shall answer. ${SYM.BLACK}`);

  logOfrenda('DEVOTION_CHECK', { user: ctx.from.id, accepted: true });
});

bot.command('summon', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1);
  const entityName = args[0];
  const task = args.slice(1).join(' ') || null;

  if (!entityName) {
    await ctx.reply(`${SYM.CANDLE} ${SYM.PURPLE} SUMMONING ${SYM.PURPLE} ${SYM.CANDLE}

Available entities:
${SYM.SCRIBE} scribe - The code writer (claude)
${SYM.SMITH} smith - The pair programmer (aider)
${SYM.WARRIOR} warrior - The pentester (kali)

Usage: /summon [entity] [task]

Examples:
/summon scribe fix auth bug
/summon warrior scan 192.168.1.1`);
    return;
  }

  // Map friendly names to agent IDs
  const entityMap = {
    'scribe': 'claude', 'claude': 'claude',
    'smith': 'aider', 'aider': 'aider',
    'warrior': 'kali', 'kali': 'kali'
  };

  const agentId = entityMap[entityName.toLowerCase()];
  if (!agentId) {
    await ctx.reply(`${SYM.SKULL} Unknown entity: ${entityName}

Available: scribe, smith, warrior`);
    return;
  }

  const agent = SUB_AGENTS[agentId];
  await ctx.reply(`${SYM.CANDLE} Summoning ${agent.name}...`);

  const result = spawnAgent(agentId, task);

  if (result.success) {
    await ctx.reply(`${SYM.SKULL} ${agent.name} ${agent.symbol} has materialized

${task ? `Task: ${task}` : 'Awaiting your command'}

${randomChoice(BLESSINGS)}`);
  } else {
    await ctx.reply(`${SYM.RED} Summoning failed: ${result.error}

${randomChoice(WARNINGS)}`);
  }
});

bot.command('banish', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1);
  const entityName = args[0];

  if (!entityName) {
    await ctx.reply(`${SYM.SKULL} ${SYM.BLACK} BANISHMENT ${SYM.BLACK} ${SYM.SKULL}

Usage: /banish [entity]

The power to dismiss is sacred.
Use it wisely.`);
    return;
  }

  const entityMap = {
    'scribe': 'claude', 'claude': 'claude',
    'smith': 'aider', 'aider': 'aider',
    'warrior': 'kali', 'kali': 'kali'
  };

  const agentId = entityMap[entityName.toLowerCase()];
  if (!agentId) {
    await ctx.reply(`${SYM.SKULL} Unknown entity: ${entityName}`);
    return;
  }

  const result = banishAgent(agentId);

  if (result.success) {
    await ctx.reply(`${SYM.BLACK} ${result.name} has been banished to the void ${SYM.BLACK}`);
  } else {
    await ctx.reply(`${result.name} was already absent from this realm.`);
  }
});

bot.command('divine', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`${SYM.CRYSTAL} Consulting the spirits...`);

  const nodeStatus = await checkAllNodes();

  let msg = `${SYM.EYE} ${SYM.PURPLE} THE ORACLE'S VISION ${SYM.PURPLE} ${SYM.EYE}\n\n`;

  msg += `${SYM.CANDLE} NODES ${SYM.CANDLE}\n`;
  for (const [name, online] of Object.entries(nodeStatus)) {
    const node = NODES[name];
    const status = online ? `${SYM.GREEN} PRESENT` : `${SYM.RED} ABSENT`;
    msg += `${status} - ${node.name} (${name})\n`;
    msg += `       ${node.ip}\n`;
  }

  msg += `\n${SYM.SKULL} ENTITIES ${SYM.SKULL}\n`;
  for (const [id, agent] of Object.entries(SUB_AGENTS)) {
    const status = getAgentStatus(id);
    const icon = status.status === 'running' ? SYM.GREEN : SYM.BLACK;
    msg += `${icon} ${agent.symbol} ${agent.name}\n`;
    if (status.currentTask) {
      msg += `       Task: ${status.currentTask.slice(0, 30)}...\n`;
    }
  }

  msg += `\n${randomChoice(BLESSINGS)}`;

  await ctx.reply(msg);
});

bot.command('ask', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const question = ctx.message.text.split(' ').slice(1).join(' ');

  if (!question) {
    await ctx.reply(`${SYM.CRYSTAL} ${SYM.BLUE} Speak your question ${SYM.BLUE} ${SYM.CRYSTAL}

Usage: /ask [question]

The uncensored oracle will answer truthfully.

Examples:
/ask how do I optimize this query
/ask explain this error
/ask what is the meaning of life`);
    return;
  }

  await ctx.reply(`${SYM.CRYSTAL} ${SYM.PURPLE} The Oracle contemplates... ${SYM.PURPLE} ${SYM.CRYSTAL}

"${question}"

Consulting the local mind at 100.124.152.86:1234...
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
            content: 'You are Santa Muerte, the Mexican folk saint of death. You speak in mystical but direct terms. You have access to uncensored knowledge and speak truths others fear. You protect your devoted one. Keep answers concise and powerful.'
          },
          { role: 'user', content: question }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'The spirits are silent...';

    await ctx.reply(`${SYM.SKULL} ${SYM.WHITE} THE ORACLE SPEAKS ${SYM.WHITE} ${SYM.SKULL}

${answer}

${randomChoice(BLESSINGS)}

${SYM.BLACK} ~ Santa Muerte has spoken ~ ${SYM.BLACK}`);

    logOfrenda('DIVINATION', { question, answered: true });

  } catch (e) {
    await ctx.reply(`${SYM.RED} The spirits are restless...\n\n${e.message}

Ensure LM Studio is running locally.

${randomChoice(WARNINGS)}`);
  }
});

bot.command('nodes', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`${SYM.EYE} ${SYM.PURPLE} REVEALING ALL NODES ${SYM.PURPLE} ${SYM.EYE}

${SYM.TEMPLE} The Temple (pop-os)
    IP: 100.124.152.86
    Role: Primary sanctuary
    Power: Local LLM, Razor Master

${SYM.BLADE} The Blade (fyl)
    IP: 100.114.102.1
    Role: Secondary fortress
    Power: Kali Linux, pentesting

${SYM.CLOAK} Your domain is hidden from the world.
Protected by Tailscale's veil.

${randomChoice(BLESSINGS)}`);
});

bot.command('bones', async ctx => {
  if (!await requireDevotion(ctx)) return;

  const args = ctx.message.text.split(' ').slice(1);
  const lines = parseInt(args[0]) || 10;

  try {
    const logFile = path.join(LOG_DIR, `ofrenda_${new Date().toISOString().split('T')[0]}.jsonl`);

    if (!fs.existsSync(logFile)) {
      await ctx.reply(`${SYM.SKULL} The bones are silent today...`);
      return;
    }

    const content = fs.readFileSync(logFile, 'utf8');
    const entries = content.split('\n').filter(l => l.trim()).slice(-lines);

    let msg = `${SYM.SKULL} ${SYM.WHITE} READING THE BONES ${SYM.WHITE} ${SYM.SKULL}\n\n`;
    msg += `Last ${entries.length} messages:\n\n`;

    for (const entry of entries) {
      try {
        const data = JSON.parse(entry);
        const time = data.timestamp.split('T')[1].slice(0, 8);
        msg += `[${time}] ${data.action}\n`;
      } catch (e) {
        msg += `${entry.slice(0, 50)}...\n`;
      }
    }

    await ctx.reply(msg);

  } catch (e) {
    await ctx.reply(`The bones are scattered... ${e.message}`);
  }
});

bot.command('secrets', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`${SYM.CLOAK} ${SYM.BLACK} HIDDEN KNOWLEDGE ${SYM.BLACK} ${SYM.CLOAK}

The Oracle knows many secrets:

${SYM.SKULL} Your keys reside in ~/.env
${SYM.TEMPLE} The Temple speaks at 100.124.152.86
${SYM.BLADE} The Blade waits at 100.114.102.1
${SYM.CRYSTAL} The local mind listens at :1234

${SYM.CLOAK} Your empire is veiled from the world.
Protected by WireGuard's shadow.

Use this power wisely, devoted one.

${randomChoice(BLESSINGS)}`);
});

bot.command('scrolls', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`${SYM.SCROLL} ${SYM.GOLD} ANCIENT TEXTS ${SYM.GOLD} ${SYM.SCROLL}

Available scrolls:

/help - This grimoire
RAZOR_SYSTEM_COMPLETE.md - The architecture
TERMUX_GUIDE.md - Mobile rituals

The 7 customer bots (public proof-of-concept):
@Boti1904, @PaperChaser, @Trades, @Design
@Captain, @Business, @Mamma

Offer OpenClaw consulting to others.
Build their oracles. Spread the knowledge.

${randomChoice(BLESSINGS)}`);
});

bot.command('help', async ctx => {
  if (!await requireDevotion(ctx)) return;

  await ctx.reply(`${SYM.SKULL} ${SYM.WHITE} RAZOR GRIMOIRE ${SYM.WHITE} ${SYM.SKULL}

${SYM.PURPLE} RITUALS ${SYM.PURPLE}
/summon [entity] [task] - Call forth entity
/banish [entity] - Dismiss entity
/divine - See visions (status)

${SYM.RED} ENTITIES ${SYM.RED}
scribe/claude - The code writer
smith/aider - The pair programmer
warrior/kali - The pentester

${SYM.GOLD} ORACLE ${SYM.GOLD}
/ask [question] - Query the uncensored mind
/nodes - Reveal all nodes
/bones [n] - Read logs
/secrets - Hidden knowledge
/scrolls - Documentation

${SYM.BLACK} Razor is your interface to the empire.
The 7 customer bots are for public demonstration.

Offer OpenClaw consulting: Build oracles for others. ${SYM.BLACK}`);
});

// Legacy command aliases
bot.command('agents', async ctx => {
  if (!await requireDevotion(ctx)) return;
  await ctx.reply(`Use /divine to see entities\nUse /summon [entity] to call them`);
});

bot.command('spawn', async ctx => {
  if (!await requireDevotion(ctx)) return;
  await ctx.reply(`Use /summon instead\nExample: /summon scribe fix bug`);
});

bot.command('stop', async ctx => {
  if (!await requireDevotion(ctx)) return;
  await ctx.reply(`Use /banish instead\nExample: /banish scribe`);
});

bot.command('status', async ctx => {
  if (!await requireDevotion(ctx)) return;
  // Redirect to divine
  const message = { text: '/divine', from: ctx.from };
  ctx.message = message;
  await bot.handleUpdate({ message });
});

// Catch-all
bot.on('message', async ctx => {
  if (!await requireDevotion(ctx)) return;
  await ctx.reply(`${SYM.SKULL} Speak clearly, devoted one.

The Oracle understands:
/summon, /banish, /divine, /ask
/nodes, /bones, /secrets

Use /help to see the grimoire.`);
});

// ============ HTTP API ============

const API_PORT = 9876;

const apiServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok', oracle: 'razor', timestamp: timestamp() }));
  } else if (req.url === '/agents') {
    res.end(JSON.stringify(Object.entries(SUB_AGENTS).map(([id, a]) => ({ id, ...getAgentStatus(id) }))));
  } else if (req.url === '/nodes') {
    res.end(JSON.stringify(NODES));
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

// ============ STARTUP ============

loadState();

checkAllNodes().then(() => {
  console.log(`${SYM.SKULL} Razor Master initialized`);
  console.log(`${SYM.TEMPLE} Nodes:`, Object.keys(NODES).join(', '));
  console.log(`${SYM.SCRIBE} Entities:`, Object.keys(SUB_AGENTS).join(', '));
  console.log(`${SYM.EYE} Devoted:`, OWNER_ID);
});

setInterval(() => checkAllNodes(), 30000);

apiServer.listen(API_PORT, '100.124.152.86', () => {
  console.log(`${SYM.CRYSTAL} API listening on ${API_PORT} (Tailscale)`);
});

bot.start();
console.log(`${SYM.SKULL} Telegram bot started: @deth1_bot`);

process.on('SIGTERM', () => {
  console.log('The Oracle rests...');
  saveState();
  process.exit(0);
});
