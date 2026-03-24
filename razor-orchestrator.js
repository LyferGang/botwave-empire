#!/usr/bin/env node
/**
 * Razor Orchestrator - Personal Telegram Bot
 * Only YOU can control it (by Telegram user ID)
 * Spawn Razor agent, check status, view logs from your phone
 */

import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs');
const LOCAL_FORGE_DIR = path.join(__dirname, 'local-forge');

// YOUR Telegram user ID - only this user can control the bot
// Find your ID: message @userinfobot on Telegram
const OWNER_ID = 874740718; // Replace with your actual Telegram user ID

// Bot token - create new bot via @BotFather for orchestrator
const ORCHESTRATOR_TOKEN = process.env.TELEGRAM_ORCHESTRATOR_TOKEN;

if (!ORCHESTRATOR_TOKEN) {
  console.error('Missing TELEGRAM_ORCHESTRATOR_TOKEN in .env');
  console.error('Create bot via @BotFather, get token, add to .env');
  process.exit(1);
}

const bot = new Bot(ORCHESTRATOR_TOKEN);

// Only allow owner to use this bot
function isOwner(userId) {
  return parseInt(userId) === OWNER_ID;
}

// Start command
bot.command('start', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied. This bot is for owner only.');
    return;
  }

  await ctx.reply(`🪙 RAZOR ORCHESTRATOR

Control Razor agent from your phone.

Commands:
/spawn - Spawn Razor agent
/status - Check Razor status
/logs - View latest logs
/stop - Stop Razor agent
/help - Show this message

Only you can control this bot.`);
});

// Spawn Razor agent
bot.command('spawn', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  await ctx.reply('🪙 Spawning Razor agent...');

  try {
    const result = execSync(`cd ${LOCAL_FORGE_DIR} && npm run spawn -- razor 2>&1`, { encoding: 'utf8' });
    await ctx.reply(`✅ Razor spawned\n\n${result.slice(0, 3500)}`);
  } catch (e) {
    await ctx.reply(`❌ Spawn failed\n\n${e.message.slice(0, 3500)}`);
  }
});

// Check status
bot.command('status', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  try {
    const ps = execSync('ps aux | grep -E "razor|claude" | grep -v grep', { encoding: 'utf8' });
    const docker = execSync('docker ps --filter "name=razor" --format "{{.Names}}\t{{.Status}}"', { encoding: 'utf8' });

    await ctx.reply(`🪙 RAZOR STATUS\n\nDocker:\n${docker || 'No Razor containers'}\n\nProcesses:\n${ps || 'None'}`);
  } catch (e) {
    await ctx.reply(`Status check: ${e.message}`);
  }
});

// View logs
bot.command('logs', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  try {
    const logFile = path.join(LOG_DIR, 'audit_' + new Date().toISOString().split('T')[0] + '.log');
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8').slice(-3500);
      await ctx.reply(`📝 TODAY'S LOGS\n\n${content}`);
    } else {
      await ctx.reply('No logs today.');
    }
  } catch (e) {
    await ctx.reply(`Log error: ${e.message}`);
  }
});

// Stop Razor
bot.command('stop', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  try {
    execSync('docker ps --filter "name=razor" -q | xargs docker stop 2>/dev/null || true', { encoding: 'utf8' });
    await ctx.reply('🛑 Razor stopped');
  } catch (e) {
    await ctx.reply(`Stop error: ${e.message}`);
  }
});

// Help
bot.command('help', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ Access denied.');
    return;
  }

  await ctx.reply(`🪙 RAZOR ORCHESTRATOR HELP

From your phone, control Razor agent:

/spawn - Start Razor (Docker container)
/status - Show running containers/processes
/logs - View today's audit logs
/stop - Stop all Razor containers
/help - Show this help

Only YOUR Telegram ID can use these commands.
Everyone else gets "Access denied".`);
});

// Catch-all: reject non-owner messages
bot.on('message', async ctx => {
  const userId = ctx.from?.id;

  if (!isOwner(userId)) {
    await ctx.reply('⛔ This bot is for owner only. Use /start to check access.');
    return;
  }

  await ctx.reply('Unknown command. Use /help for commands.');
});

// Start polling
bot.start();
console.log(`✅ Razor Orchestrator bot started`);
console.log(`🔒 Owner-only access (Telegram ID: ${OWNER_ID})`);
console.log(`📱 Control Razor from your phone`);
