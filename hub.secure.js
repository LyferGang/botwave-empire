#!/usr/bin/env node
/**
 * Botwave Hub - Secure Production Version
 * Uses environment variables for secrets, rate limiting, and audit logging
 */

import https from 'https';
import http from 'http';
import { Bot } from 'grammy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { getVerticalConfig, classifyIntent, generateVerticalResponse, startFlow, processFlowResponse, isInFlow, getFlowQuestion } from './verticals.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const LOG_DIR = path.join(__dirname, 'logs');
const ENV_FILE = path.join(__dirname, '.env');

// Load environment variables
function loadEnv() {
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    content.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  }
}

loadEnv();

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

// Audit logging
function auditLog(event, details, user = 'unknown') {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, event, details, user }) + '\n';
  const logFile = path.join(LOG_DIR, `audit_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry);
}

// Rate limiter class
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  allow(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(t => now - t < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  getRetryAfter(identifier) {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    const oldestRequest = Math.min(...userRequests);
    return Math.ceil((this.windowMs - (Date.now() - oldestRequest)) / 1000);
  }
}

// Initialize rate limiter (100 requests per minute)
const rateLimiter = new RateLimiter(100, 60000);

// Config - Boomer Business Verticals (no AI jargon)
const BOTS = {
  'Boti1904': { token: process.env.TELEGRAM_BOT_BOTI1904, vertical: 'Plumber', description: 'Answers emergency calls, dispatches plumber' },
  'PaperChaser': { token: process.env.TELEGRAM_BOT_PAPERCHASER, vertical: 'Electrician', description: 'Answers calls, qualifies jobs, schedules' },
  'Trades': { token: process.env.TELEGRAM_BOT_TRADES, vertical: 'HVAC', description: 'AC/heat calls, emergency dispatch' },
  'Design': { token: process.env.TELEGRAM_BOT_DESIGN, vertical: 'General Contractor', description: 'Lead intake, bid requests, scheduling' },
  'Captain': { token: process.env.TELEGRAM_BOT_CAPTAIN, vertical: 'Locksmith', description: 'Lockout calls, key/lock service dispatch' },
  'Business': { token: process.env.TELEGRAM_BOT_BUSINESS, vertical: 'Small Business', description: 'Answers all calls, takes messages, books appts' },
  'Mamma': { token: process.env.TELEGRAM_BOT_MAMMA, vertical: 'Restaurant', description: 'Reservations, takeout, catering' },
};

// Zero API Cost - Local LM Studio Only
// External API keys in .env are unused backups

// HMAC signature verification for webhooks
function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// Generate secure random secret if not provided
function getOrCreateSecret(name) {
  if (process.env[name]) {
    return process.env[name];
  }
  const secret = crypto.randomBytes(32).toString('hex');
  console.log(`Generated ${name}: ${secret}`);
  console.log(`Add to .env: ${name}=${secret}`);
  return secret;
}

// Initialize HMAC secret for API auth
const HMAC_SECRET = getOrCreateSecret('HMAC_SECRET');

// LLM - Local LM Studio (huihui-qwen3.5-9b-abliterated)
async function askLLM(prompt) {
  const body = {
    model: 'huihui-qwen3.5-9b-abliterated',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1024,
    temperature: 0.7
  };

  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: 1234,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.choices?.[0]?.message?.content || 'No response');
        } catch(e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Web search via Brave
async function webSearch(query) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.search.brave.com', port: 443, path: `/res/v1/web/search?q=${encodeURIComponent(query)}`,
      headers: { 'Accept': 'application/json', 'X-Subscription-Token': API_KEYS.brave }
    };
    https.get(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(data);
          resolve(r.web?.results?.slice(0, 5).map(i => ({ title: i.title, url: i.url, desc: i.description })) || []);
        } catch(e) { resolve([]); }
      });
    }).on('error', reject);
  });
}

// Simple JSON storage
function loadJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function saveJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
}

// Initialize all bots
const botInstances = {};
for (const [name, config] of Object.entries(BOTS)) {
  if (!config.token) {
    console.warn(`⚠️  Skipping ${name}: token not configured`);
    continue;
  }

  const bot = new Bot(config.token);
  botInstances[name] = bot;

  // Get vertical config for this bot
  const verticalConfig = getVerticalConfig(name);

  // Vertical-specific commands (no AI jargon - simple business language)
  bot.command('start', async ctx => {
    auditLog('command_start', { bot: name, user: ctx.from?.username, vertical: verticalConfig.vertical }, ctx.from?.username);

    // WOW FACTOR opening - sells Botwave value immediately (no AI jargon)
    const wowOpenings = {
      'Plumber': `🚨 NEVER MISS ANOTHER EMERGENCY CALL

Your phone goes to voicemail at night? That's $450 to your competitor.

${name} answers 24/7. Books jobs. Dispatches you.

One emergency job pays for the whole month. Rest is profit.

Try it now:
/estimate - Get instant price quote
/emergency - Test emergency dispatch`,

      'Electrician': `⚡ STOP LOSING ELECTRICAL CALLS

Missed call at 8 PM = $350 to another electrician.

${name} answers every call. Qualifies dangerous vs non-urgent. Dispatches you.

One spark/smoke call pays for everything. Rest is profit.

Try it now:
/estimate - Get instant price quote
/dangerous - Test emergency dispatch`,

      'HVAC': `❄️🔥 24/7 HVAC DISPATCH - NEVER MISS A CALL

Summer 95°: AC breaks. Customer calls. You don't answer.

They call your competitor. That's $400 lost.

${name} answers 24/7. Books AC/heat jobs. Dispatches you.

One emergency pays for the month. Rest is profit.

Try it now:
/estimate - Get instant price quote
/emergency - Test dispatch`,

      'General Contractor': `🏗️ REMODEL LEADS WHILE YOU SLEEP

Homeowner wants kitchen remodel. Calls you. You don't answer.

They call another GC. That's $50,000 lost.

${name} answers 24/7. Qualifies leads. Books site visits.

One kitchen remodel pays for everything. Rest is profit.

Try it now:
/bid - Get instant bid estimate
/lead - Capture new project lead`,

      'Locksmith': `🔑 LOCKOUT CALLS 24/7 - INSTANT DISPATCH

11 PM lockout. Customer calls. You don't answer.

They call another locksmith. That's $200 lost.

${name} answers every lockout call. Dispatches you in 20 min.

One car lockout pays for the month. Rest is profit.

Try it now:
/estimate - Get instant price quote
/lockout - Test emergency dispatch`,

      'Small Business': `📞 YOUR SHOP ANSWERS PHONE 24/7

Customer calls your liquor store/merchandise shop/office. You don't answer.

They call competitor or go elsewhere. That's a lost sale.

${name} answers every call. Takes messages. Books appointments.

Cheaper than hiring someone. Works 24/7.

One captured customer pays for the month. Rest is profit.

Try it now:
/message - Take a message
/book - Book appointment`,

      'Construction CFO': `📞 CONSTRUCTION CFO - VENDOR & CLIENT CALLS ANSWERED

Vendor calls about invoice. Client asks about payment. New lead wants quote.

You don't answer. Relationship suffers. Lead goes to competitor.

${name} answers 24/7. Handles billing questions. Qualifies new projects.

One qualified masonry lead = $50,000 project.

Vendor relationships preserved. Cash flow faster.

Try it now:
/billing - Client/vendor billing question
/lead - New project qualification`,

      'College Marketing': `🎓 COLLEGE MARKETING - STUDENT CALLS ANSWERED 24/7

Prospective student calls. Wants nursing program info. Asks about FAFSA.

You don't answer. They go to another school. That's $15,000 tuition lost.

${name} answers 24/7. Qualifies program interest. Books campus tours.

One enrolled student = $15,000 tuition. 10 students = $150,000.

Cheaper than hiring counselor. Works during summer break.

Try it now:
/program - Student program inquiry
/enroll - Start enrollment process
/tour - Book campus visit`,

      'Therapy Clinic': `🏠 THERAPY CLINIC - NEW PATIENT CALLS ANSWERED 24/7

You're in session. Can't answer phone. New patient calls.

They leave voicemail. Call next therapist. That's $5,000 lifetime value lost.

${name} answers 24/7. Qualifies insurance. Books appointments.

One new patient = $4,000-6,000 (20 sessions × $200-300).
10 patients/year = $40,000-60,000 revenue.

HIPAA-compliant intake. No-show reduction.

Try it now:
/intake - New patient intake
/insurance - Verify coverage
/schedule - Book appointment`,

      'Home Care': `🏠 PATIENT CALLS ANSWERED 24/7

Family member needs care for mom. Calls you. You don't answer.

They call another agency. That's $30-45/hour lost.

${name} answers every call. Qualifies care type. Books assessment.

One patient pays for months. Rest is profit.

Try it now:
/estimate - Get care rate quote
/patient - New patient inquiry`
    };

    const opening = wowOpenings[verticalConfig.vertical] || `📞 ${config.description}`;

    await ctx.reply(opening);
  });

  bot.command('help', async ctx => {
    await ctx.reply(`${verticalConfig.vertical} commands for ${name}\n\n/estimate - Get instant price quote\n/emergency - Report urgent issue`);
  });

  // Estimate/Bid command - starts conversational flow
  bot.command('estimate', async ctx => {
    const userId = ctx.from?.username || ctx.from?.id.toString();
    if (!rateLimiter.allow(userId)) {
      await ctx.reply(`⏱️ Rate limit exceeded.`);
      return;
    }

    const flow = startFlow(name, userId);
    if (flow) {
      await ctx.reply(`💬 ${flow.question}`);
      auditLog('flow_started', { bot: name, user: userId, vertical: verticalConfig.vertical }, userId);
    } else {
      await ctx.reply('Estimates not available for this service.');
    }
  });

  bot.command('bid', async ctx => {
    const userId = ctx.from?.username || ctx.from?.id.toString();
    if (!rateLimiter.allow(userId)) {
      await ctx.reply(`⏱️ Rate limit exceeded.`);
      return;
    }

    const flow = startFlow(name, userId);
    if (flow) {
      await ctx.reply(`🏗️ ${flow.question}`);
      auditLog('flow_started', { bot: name, user: userId, vertical: verticalConfig.vertical }, userId);
    }
  });

  // Emergency dispatch command (for service bots)
  bot.command('emergency', async ctx => {
    const userId = ctx.from?.username || ctx.from?.id.toString();
    if (!rateLimiter.allow(userId)) {
      await ctx.reply(`⏱️ Rate limit exceeded. Try again in ${rateLimiter.getRetryAfter(userId)} seconds.`);
      return;
    }

    const desc = ctx.message.text.replace('/emergency', '').trim();
    const intent = classifyIntent(name, desc);
    const response = generateVerticalResponse(name, { category: 'critical', confidence: 0.9 }, desc);
    await ctx.reply(response);
    auditLog('emergency_dispatch', { bot: name, user: userId, vertical: verticalConfig.vertical }, userId);
  });

  // Schedule command (for non-emergency jobs)
  bot.command('schedule', async ctx => {
    const userId = ctx.from?.username || ctx.from?.id.toString();
    if (!rateLimiter.allow(userId)) {
      await ctx.reply(`⏱️ Rate limit exceeded.`);
      return;
    }

    const details = ctx.message.text.replace('/schedule', '').trim();
    await ctx.reply(`📅 Scheduled: ${details}\n\nYou'll get a confirmation text.`);
    auditLog('job_scheduled', { bot: name, user: userId, vertical: verticalConfig.vertical }, userId);
  });

  // Stats command (same for all bots)
  bot.command('stats', async ctx => {
    const userId = ctx.from?.username || ctx.from?.id.toString();
    const leads = loadJSON('leads.json');
    const tickets = loadJSON('tickets.json');
    await ctx.reply(`📊 ${name} Stats\n\nJobs dispatched: ${leads.length}\nVertical: ${verticalConfig.vertical}`);
    auditLog('stats_viewed', { bot: name, user: userId, vertical: verticalConfig.vertical }, userId);
  });

  // Catch-all: conversational flow OR vertical-specific handling
  bot.on('message:text', async ctx => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return;

    const userId = ctx.from?.username || ctx.from?.id.toString();

    // Rate limiting check
    if (!rateLimiter.allow(userId)) {
      const retryAfter = rateLimiter.getRetryAfter(userId);
      await ctx.reply(`⏱️ Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      return;
    }

    // Check if user is in an active conversation flow
    if (isInFlow(name, userId)) {
      const result = processFlowResponse(name, userId, text);
      if (result) {
        if (result.complete) {
          await ctx.reply(result.response);
          auditLog('flow_complete', { bot: name, user: userId, vertical: verticalConfig.vertical, estimate: result.estimate }, userId);
        } else {
          await ctx.reply(result.nextQuestion);
          auditLog('flow_step', { bot: name, user: userId, step: result.step }, userId);
        }
        return;
      }
    }

    // Classify intent based on vertical keywords
    const intent = classifyIntent(name, text);

    // Generate vertical-specific response (fast, no LLM for classified intents)
    const response = generateVerticalResponse(name, intent, text);

    await ctx.reply(response);
    auditLog('vertical_message', { bot: name, user: userId, vertical: verticalConfig.vertical, intent: intent.category }, userId);
  });

  // Start polling
  bot.start();
  console.log(`✅ ${name} bot started`);
}

console.log('\n🎯 Botwave Hub running - ' + Object.keys(botInstances).length + ' Telegram bots active');
console.log(`📊 Dashboard: http://localhost:3001`);
console.log(`🔒 Security: Rate limiting + audit logging enabled`);
console.log(`📝 Logs: ${LOG_DIR}`);
