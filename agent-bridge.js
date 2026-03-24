#!/usr/bin/env node
/**
 * AGENT BRIDGE - Remote Agent Controller
 * ======================================
 * This runs on each node (pop-os, fyl) and allows Razor Master to
 * spawn and control agents remotely via SSH.
 *
 * Usage: node agent-bridge.js [agent-type] [task]
 * Example: node agent-bridge.js claude "fix login bug"
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs', 'agents');

if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

const AGENT_TYPE = process.argv[2];
const TASK = process.argv.slice(3).join(' ') || null;

// Agent configurations per node type
const AGENT_CONFIGS = {
  // Development agents (run on pop-os)
  'claude': {
    name: 'Claude Code Agent',
    setup: () => {
      // Check if claude is installed
      try {
        const { execSync } = require('child_process');
        execSync('which claude', { stdio: 'ignore' });
      } catch (e) {
        console.log('Claude Code not installed. Installing...');
        const { execSync } = require('child_process');
        execSync('npm install -g @anthropic-ai/claude-code', { stdio: 'inherit' });
      }
    },
    command: 'claude',
    args: TASK ? ['--dangerously-skip-permissions', TASK] : [],
    cwd: '/home/gringo/Projects',
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      CLAUDE_EXIT_ON_IDLE: '300' // Exit after 5 min idle
    }
  },

  'aider': {
    name: 'Aider Agent',
    setup: () => {
      try {
        const { execSync } = require('child_process');
        execSync('which aider', { stdio: 'ignore' });
      } catch (e) {
        console.log('Aider not installed. Installing...');
        const { execSync } = require('child_process');
        execSync('pip install aider-chat', { stdio: 'inherit' });
      }
    },
    command: 'aider',
    args: [
      '--model', 'claude-3-5-sonnet-20241022',
      '--edit-format', 'diff',
      '--no-auto-commits',
      '--no-suggest-shell-commands',
      TASK || ''
    ].filter(Boolean),
    cwd: '/home/gringo/Projects',
    env: {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    }
  },

  // Security agents (run on fyl - Kali Linux)
  'kali': {
    name: 'Kali Pentesting Agent',
    setup: () => {
      // Kali-specific setup
      const { execSync } = require('child_process');
      try {
        execSync('which tmux', { stdio: 'ignore' });
      } catch (e) {
        execSync('sudo apt-get update && sudo apt-get install -y tmux', { stdio: 'inherit' });
      }
    },
    command: 'tmux',
    args: ['new-session', '-d', '-s', 'kali-agent', '-n', 'main'],
    postSpawn: () => {
      // Send task to tmux session if provided
      if (TASK) {
        const { execSync } = require('child_process');
        execSync(`tmux send-keys -t kali-agent "${TASK}" C-m`, { stdio: 'ignore' });
      }
    },
    cwd: '/home/lyfer1904',
    env: {}
  },

  'nmap': {
    name: 'Nmap Scanner',
    setup: () => {},
    command: 'nmap',
    args: TASK ? ['-sV', '-sC', TASK] : ['--help'],
    cwd: '/home/lyfer1904',
    env: {}
  },

  'metasploit': {
    name: 'Metasploit Console',
    setup: () => {},
    command: 'msfconsole',
    args: TASK ? ['-q', '-x', TASK] : ['-q'],
    cwd: '/home/lyfer1904',
    env: {}
  }
};

function log(msg) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [${AGENT_TYPE}] ${msg}`;
  console.log(entry);
  fs.appendFileSync(path.join(LOG_DIR, `${AGENT_TYPE}.log`), entry + '\n');
}

function spawnAgent() {
  const config = AGENT_CONFIGS[AGENT_TYPE];
  if (!config) {
    console.error(`Unknown agent type: ${AGENT_TYPE}`);
    console.error('Available: claude, aider, kali, nmap, metasploit');
    process.exit(1);
  }

  log(`Starting ${config.name}...`);
  log(`Task: ${TASK || 'None'}`);

  // Run setup
  try {
    config.setup();
  } catch (e) {
    log(`Setup error: ${e.message}`);
  }

  // Spawn the agent
  const proc = spawn(config.command, config.args, {
    cwd: config.cwd,
    env: { ...process.env, ...config.env },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true
  });

  log(`Spawned PID: ${proc.pid}`);

  // Write PID file for management
  const pidFile = path.join(LOG_DIR, `${AGENT_TYPE}.pid`);
  fs.writeFileSync(pidFile, proc.pid.toString());

  // Handle output
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => log(`[OUT] ${line.slice(0, 500)}`));
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(l => l.trim());
    lines.forEach(line => log(`[ERR] ${line.slice(0, 500)}`));
  });

  proc.on('close', (code) => {
    log(`Exited with code ${code}`);
    try { fs.unlinkSync(pidFile); } catch (e) {}
  });

  // Run post-spawn actions
  if (config.postSpawn) {
    setTimeout(config.postSpawn, 1000);
  }

  // Keep process alive
  proc.unref();

  // Report back to Razor Master via HTTP if configured
  const MASTER_API = process.env.RAZOR_MASTER_API;
  if (MASTER_API) {
    const http = require('http');
    const data = JSON.stringify({
      agent: AGENT_TYPE,
      pid: proc.pid,
      task: TASK,
      status: 'running',
      timestamp: new Date().toISOString()
    });

    const req = http.request(`${MASTER_API}/agent-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    }, (res) => {});

    req.on('error', () => {}); // Silent fail
    req.write(data);
    req.end();
  }

  log('Agent spawned successfully');
}

// Main
if (!AGENT_TYPE) {
  console.log('Agent Bridge - Remote Agent Spawner');
  console.log('');
  console.log('Usage: node agent-bridge.js [agent-type] [task]');
  console.log('');
  console.log('Agents:');
  Object.entries(AGENT_CONFIGS).forEach(([id, config]) => {
    console.log(`  ${id.padEnd(12)} - ${config.name}`);
  });
  process.exit(0);
}

spawnAgent();
