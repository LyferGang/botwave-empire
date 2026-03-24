#!/usr/bin/env node
/**
 * Botwave Vertical-Specific Bot Handlers
 * Each bot is configured for a specific industry vertical
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

// Vertical configurations - Boomer Business Owners (no AI jargon)
const VERTICALS = {
  // Boti1904 → Plumber
  'Boti1904': {
    vertical: 'Plumber',
    description: 'Answers emergency calls, dispatches plumber',
    pricing: { critical: 450, high: 350, medium: 200, low: 150 },
    sla: { critical: 15, high: 30, medium: 240, low: 1440 },
    keywords: {
      critical: ['burst', 'flooding', 'gas leak', 'sewage', 'emergency', 'water heater'],
      high: ['overflow', 'no water', 'broken pipe', 'leaking'],
      medium: ['leak', 'dripping', 'running', 'clog', 'toilet'],
      low: ['install', 'repair', 'maintenance', 'inspection', 'faucet']
    },
    flow: {
      steps: ['issue', 'location', 'timing'],
      questions: {
        issue: 'What\'s the plumbing issue? (burst pipe, leak, clog, water heater, other)',
        location: 'Where is it? (kitchen, bathroom, basement, outside, other)',
        timing: 'How urgent? (now/emergency, today, this week, whenever)'
      },
      estimate: (answers) => {
        if (answers.timing === 'now' || answers.timing === 'emergency') return 450;
        if (answers.issue.includes('burst') || answers.issue.includes('flood')) return 350;
        if (answers.issue.includes('leak') || answers.issue.includes('clog')) return 200;
        return 150;
      }
    }
  },

  // PaperChaser → Electrician
  'PaperChaser': {
    vertical: 'Electrician',
    description: 'Answers calls, qualifies jobs, schedules',
    pricing: { critical: 350, high: 250, medium: 150, low: 125 },
    keywords: {
      critical: ['sparks', 'smoke', 'burning', 'shock', 'panel', 'dangerous'],
      high: ['no power', 'outage', 'breaker', 'trip'],
      medium: ['flickering', 'buzzing', 'warm', 'disconnected'],
      low: ['install', 'ceiling fan', 'outlet', 'switch', 'upgrade']
    },
    flow: {
      steps: ['issue', 'danger', 'timing'],
      questions: {
        issue: 'What\'s the electrical issue? (sparks, no power, flickering, install, other)',
        danger: 'Any danger signs? (smoke, burning smell, shock - YES/NO)',
        timing: 'When do you need it fixed? (now, today, this week, later)'
      },
      estimate: (answers) => {
        if (answers.danger === 'yes' || answers.issue.includes('spark') || answers.issue.includes('smoke')) return 350;
        if (answers.issue.includes('no power') || answers.issue.includes('breaker')) return 250;
        if (answers.issue.includes('flicker') || answers.issue.includes('buzz')) return 150;
        return 125;
      }
    }
  },

  // Trades → HVAC
  'Trades': {
    vertical: 'HVAC',
    description: 'AC/heat calls, emergency dispatch',
    pricing: { critical: 400, high: 300, medium: 200, low: 150 },
    sla: { critical: 30, high: 60, medium: 240, low: 1440 },
    keywords: {
      critical: ['ac dead', 'heat dead', 'no cooling', 'no heat', 'freon', 'compressor'],
      high: ['weak', 'not cold', 'not hot', 'blowing', 'thermostat'],
      medium: ['making noise', 'cycling', 'dirty', 'filter'],
      low: ['maintenance', 'inspection', 'duct', 'vent']
    },
    flow: {
      steps: ['system', 'issue', 'timing'],
      questions: {
        system: 'AC or heat?',
        issue: 'What\'s wrong? (dead, weak, noisy, not working, other)',
        timing: 'How urgent? (now/emergency, today, this week, maintenance)'
      },
      estimate: (answers) => {
        if (answers.timing === 'now' || answers.timing === 'emergency') return 400;
        if (answers.issue.includes('dead') || answers.issue.includes('not')) return 300;
        if (answers.issue.includes('noisy') || answers.issue.includes('weak')) return 200;
        return 150;
      }
    }
  },

  // Design → General Contractor
  'Design': {
    vertical: 'General Contractor',
    description: 'Lead intake, bid requests, scheduling',
    pricing: { kitchen: 50000, bath: 35000, addition: 75000, deck: 15000, patio: 10000, flooring: 8000, roof: 20000, window: 12000, other: 5000 },
    keywords: {
      kitchen: ['kitchen', 'remodel', 'cabinets', 'countertop'],
      bath: ['bathroom', 'bath', 'shower', 'tub', 'vanity'],
      addition: ['addition', 'add', 'expand', 'room'],
      deck: ['deck', 'porch', 'railing'],
      patio: ['patio', 'concrete', 'paver'],
      flooring: ['floor', 'hardwood', 'tile', 'laminate'],
      roof: ['roof', 'shingle', 'leak'],
      window: ['window', 'glass', 'pane']
    },
    flow: {
      steps: ['project', 'size', 'timeline'],
      questions: {
        project: 'What type of project? (kitchen, bathroom, addition, deck, patio, flooring, roof, window, other)',
        size: 'Approximate size or scope? (small/medium/large or sq ft)',
        timeline: 'When do you want to start? (asap, 1 month, 3 months, just quoting)'
      },
      estimate: (answers) => {
        const type = Object.keys(answers.project).find(k => answers.project.includes(k)) || 'other';
        return VERTICALS['Design'].pricing[type] || 5000;
      }
    }
  },

  // Captain → Locksmith
  'Captain': {
    vertical: 'Locksmith',
    description: 'Lockout calls, key/lock service dispatch',
    pricing: { critical: 200, high: 150, medium: 120, low: 80 },
    keywords: {
      critical: ['locked out', 'car locked', 'keys inside', 'house locked'],
      high: ['broken key', 'lock broken', 'cant unlock', 'jammed'],
      medium: ['rekey', 'change lock', 'new lock', 'install'],
      low: ['copy key', 'duplicate', 'master key', 'safe']
    },
    flow: {
      steps: ['lockout_type', 'location', 'timing'],
      questions: {
        lockout_type: 'What type of lockout? (car, house, business, other)',
        location: 'Where are you? (address or area)',
        timing: 'Are you stuck now? (yes/no)'
      },
      estimate: (answers) => {
        if (answers.lockout_type.includes('car')) return 200;
        if (answers.lockout_type.includes('house')) return 150;
        if (answers.lockout_type.includes('business')) return 200;
        return 80;
      }
    }
  },

  // Business → General Small Business (ANY shop/office/retail)
  'Business': {
    vertical: 'Small Business',
    description: 'Answers all calls - retail, liquor store, merchandise, office, shop',
    pricing: { standard: 299 },
    keywords: {
      message: ['tell', 'call back', 'reach', 'contact', 'message'],
      appointment: ['meeting', 'appointment', 'schedule', 'book', 'calendar'],
      hours: ['hours', 'open', 'close', 'when', 'time'],
      general: ['question', 'info', 'help', 'speak']
    },
    flow: {
      steps: ['business_type', 'need', 'contact'],
      questions: {
        business_type: 'What type of business? (retail, liquor store, merchandise, office, shop, other)',
        need: 'What do you need? (answer calls, take messages, book appointments)',
        contact: 'Your name and callback number?'
      },
      estimate: () => 299 // Flat monthly rate
    }
  },

  // Mamma → Restaurants + Food Service
  'Mamma': {
    vertical: 'Restaurant',
    description: 'Reservations, takeout orders, waitlist',
    pricing: { reservation: 0, waitlist: 0, takeout: 20, catering: 500 },
    keywords: {
      reservation: ['reservation', 'table', 'book', 'party', 'date'],
      waitlist: ['waitlist', 'wait', 'line', 'available'],
      takeout: ['takeout', 'order', 'pickup', 'delivery'],
      catering: ['catering', 'event', 'party', 'group']
    },
    flow: {
      steps: ['service_type', 'details', 'contact'],
      questions: {
        service_type: 'What do you need? (reservation, takeout, catering, waitlist)',
        details: 'Party size or order details?',
        contact: 'Your name and phone number?'
      },
      estimate: (answers) => {
        if (answers.service_type.includes('catering')) return 500;
        if (answers.service_type.includes('takeout')) return 20;
        return 0; // Free for reservations/waitlist
      }
    }
  },

  // Extra: Construction CFO (for mom)
  'ConstructionCFO': {
    vertical: 'Construction CFO',
    description: 'Vendor billing, client invoices, lead qualification',
    pricing: { vendor: 0, billing: 0, lead: 50000 },
    keywords: {
      vendor: ['vendor', 'supplier', 'invoice', 'materials', 'billing'],
      billing: ['payment', 'invoice', 'balance', 'due', 'accounting'],
      lead: ['quote', 'estimate', 'project', 'bid', 'brick', 'masonry']
    },
    flow: {
      steps: ['call_type', 'details', 'contact'],
      questions: {
        call_type: 'What\'s this about? (vendor billing, client question, new project)',
        details: 'Project type or billing issue?',
        contact: 'Your name, company, and callback number?'
      },
      estimate: (answers) => {
        if (answers.call_type.includes('project') || answers.call_type.includes('quote')) return 50000;
        return 0; // Vendor/billing = relationship value
      }
    }
  },

  // Extra: College Marketing (for brother)
  'CollegeMarketing': {
    vertical: 'College Marketing',
    description: 'Student inquiries, enrollment leads, event registration',
    pricing: { inquiry: 0, tour: 0, enrollment: 15000 },
    keywords: {
      program: ['program', 'degree', 'certificate', 'major', 'nursing', 'engineering'],
      enrollment: ['enroll', 'apply', 'admission', 'register', 'start'],
      financial: ['financial aid', 'fafsa', 'scholarship', 'grant', 'tuition'],
      event: ['open house', 'tour', 'info session', 'event']
    },
    flow: {
      steps: ['interest', 'timeline', 'contact'],
      questions: {
        interest: 'What program are you interested in? (nursing, business, STEM, other)',
        timeline: 'When do you want to start? (next semester, soon, just looking)',
        contact: 'Your name, email, and phone number?'
      },
      estimate: (answers) => {
        if (answers.timeline.includes('next') || answers.timeline.includes('soon')) return 15000; // Enrollment value
        return 0; // Inquiry = nurture
      }
    }
  },

  // Extra: Therapy/Healthcare Clinic (for friend's wife)
  'TherapyClinic': {
    vertical: 'Therapy Clinic',
    description: 'New patient intake, insurance verification, appointment booking',
    pricing: { intake: 250, session: 150, lifetime: 5000 },
    keywords: {
      intake: ['new patient', 'first session', 'intake', 'assessment'],
      insurance: ['insurance', 'blue cross', 'coverage', 'in-network', 'billing'],
      scheduling: ['appointment', 'schedule', 'available', 'tuesday', 'thursday'],
      telehealth: ['zoom', 'telehealth', 'remote', 'video', 'phone']
    },
    flow: {
      steps: ['insurance', 'issue', 'availability'],
      questions: {
        insurance: 'What insurance do you have? (Blue Cross, Anthem, self-pay, other)',
        issue: 'What brings you in? (anxiety, depression, trauma, couples, other)',
        availability: 'When are you available? (weekdays, evenings, weekends)'
      },
      estimate: (answers) => {
        if (answers.insurance.includes('self') || answers.insurance.includes('pay')) return 5000; // Lifetime self-pay value
        return 250; // Intake session
      }
    }
  }
};

// Export vertical config
export function getVerticalConfig(botName) {
  return VERTICALS[botName] || VERTICALS['Boti1904'];
}

// Classify message intent based on vertical keywords
export function classifyIntent(botName, message) {
  const config = getVerticalConfig(botName);
  const lowerMessage = message.toLowerCase();

  for (const [category, keywords] of Object.entries(config.keywords || config.practice_areas || config.services)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return { category, confidence: 0.8 };
      }
    }
  }

  return { category: 'general', confidence: 0.5 };
}

// Generate vertical-specific response (boomer-friendly, no AI jargon)
export function generateVerticalResponse(botName, intent, userMessage) {
  const config = getVerticalConfig(botName);

  switch (config.vertical) {
    case 'Plumber':
      if (intent.category === 'critical') {
        return `🚨 EMERGENCY PLUMBING\n\nDispatching plumber within ${config.sla.critical} minutes.\n\nEstimated job: $${config.pricing.critical}`;
      }
      return `✅ Plumber scheduled. ETA: ${config.sla[intent.category] || 240} minutes.`;

    case 'Electrician':
      if (intent.category === 'critical') {
        return `⚡ DANGEROUS ELECTRICAL ISSUE\n\nElectrician coming within 30 minutes.\n\nEstimated: $${config.pricing.critical}`;
      }
      if (intent.category === 'high') {
        return `🔌 Power issue detected\n\nElectrician coming today.\n\nEstimated: $${config.pricing.high}`;
      }
      return `⚡ Electrical job scheduled.\n\nEstimated: $${config.pricing[intent.category] || 125}`;

    case 'HVAC':
      if (intent.category === 'critical') {
        return `❄️🔥 HVAC EMERGENCY\n\nTechnician within ${config.sla.critical} minutes.\n\nEstimated: $${config.pricing.critical}`;
      }
      return `🌡️ HVAC scheduled. ETA: ${config.sla[intent.category] || 240} minutes.`;

    case 'General Contractor':
      if (intent.category === 'hot') {
        return `🏗️ REMODEL LEAD\n\nBudget: $${config.pricing.hot}\n\nSite visit scheduled. Contractor will call within 1 hour.`;
      }
      return `📋 GC lead captured. Will contact you within 24 hours.`;

    case 'Locksmith':
      if (intent.category === 'critical') {
        return `🔑 LOCKOUT EMERGENCY\n\nLocksmith dispatched. ETA: 20-30 minutes.\n\nEstimated: $${config.pricing.critical}`;
      }
      return `🔒 Locksmith scheduled. Estimated: $${config.pricing[intent.category] || 80}`;

    case 'Small Business':
      if (intent.category === 'message') {
        return `📞 MESSAGE TAKEN\n\nI'll have them call you back ASAP.`;
      }
      if (intent.category === 'appointment') {
        return `📅 APPOINTMENT BOOKED\n\nCalendar invite sent.`;
      }
      return `📋 Message received. We'll respond during business hours.`;

    case 'Home Care':
      const careType = intent.category === 'daily' ? 'daily care' : intent.category === 'medical' ? 'medical care' : 'companionship';
      return `🏠 Home care inquiry\n\nType: ${careType}\n\nAssessment scheduled within 48 hours.`;

    default:
      return `📞 Message received. We'll respond shortly.`;
  }
}

// Log vertical metrics
export function logVerticalMetric(botName, event, data) {
  const logFile = path.join(DATA_DIR, `vertical_${botName.toLowerCase()}.json`);
  let metrics = [];

  if (fs.existsSync(logFile)) {
    metrics = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  }

  metrics.push({
    timestamp: new Date().toISOString(),
    bot: botName,
    vertical: getVerticalConfig(botName).vertical,
    event,
    data
  });

  fs.writeFileSync(logFile, JSON.stringify(metrics, null, 2));
}

// Print vertical summary
export function printVerticalSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('  BOTWAVE VERTICAL SUMMARY');
  console.log('='.repeat(60) + '\n');

  for (const [bot, config] of Object.entries(VERTICALS)) {
    console.log(`${bot} → ${config.vertical}`);
    console.log(`  Purpose: ${config.description}`);
    if (config.flow) {
      console.log(`  Flow Steps: ${config.flow.steps.length}`);
    }
    console.log('');
  }
}

// Session store for conversation flows (in-memory, per user+bot)
const sessions = new Map();

// Get or create session for user
function getSession(botName, userId) {
  const key = `${botName}:${userId}`;
  if (!sessions.has(key)) {
    sessions.set(key, { bot: botName, user: userId, step: 0, answers: {}, active: false });
  }
  return sessions.get(key);
}

// Start a flow conversation
export function startFlow(botName, userId) {
  const config = getVerticalConfig(botName);
  if (!config.flow) return null;

  const session = getSession(botName, userId);
  session.active = true;
  session.step = 0;
  session.answers = {};

  const firstStep = config.flow.steps[0];
  return {
    question: config.flow.questions[firstStep],
    step: firstStep,
    total: config.flow.steps.length
  };
}

// Process user response in flow
export function processFlowResponse(botName, userId, userMessage) {
  const config = getVerticalConfig(botName);
  if (!config.flow) return null;

  const session = getSession(botName, userId);
  if (!session.active) return null;

  const currentStep = config.flow.steps[session.step];
  session.answers[currentStep] = userMessage.toLowerCase();

  session.step++;

  if (session.step >= config.flow.steps.length) {
    // Flow complete - generate estimate
    session.active = false;
    const estimate = config.flow.estimate(session.answers);
    return {
      complete: true,
      answers: session.answers,
      estimate: estimate,
      response: generateFlowResponse(config, session.answers, estimate)
    };
  }

  // Next question
  const nextStep = config.flow.steps[session.step];
  return {
    complete: false,
    nextQuestion: config.flow.questions[nextStep],
    step: nextStep
  };
}

// Generate flow response with estimate
function generateFlowResponse(config, answers, estimate) {
  const timing = answers.timing;
  const danger = answers.danger;
  const urgent = answers.timing;

  switch (config.vertical) {
    case 'Plumber': {
      const dispatch = (timing === 'now' || timing === 'emergency') ? 'Dispatching plumber now.' : 'We will call to schedule.';
      return `🔧 PLUMBING ESTIMATE\n\nIssue: ${answers.issue}\nLocation: ${answers.location}\nTiming: ${answers.timing}\n\nEstimated: $${estimate}\n\n${dispatch}`;
    }

    case 'Electrician': {
      const dispatch = (danger === 'yes') ? 'Electrician coming within 30 min.' : 'We will schedule a visit.';
      return `⚡ ELECTRICAL ESTIMATE\n\nIssue: ${answers.issue}\nDanger: ${answers.danger}\nTiming: ${answers.timing}\n\nEstimated: $${estimate}\n\n${dispatch}`;
    }

    case 'HVAC': {
      const dispatch = (timing === 'now' || timing === 'emergency') ? 'Technician dispatched.' : 'We will call to schedule.';
      return `🌡️ HVAC ESTIMATE\n\nSystem: ${answers.system}\nIssue: ${answers.issue}\nTiming: ${answers.timing}\n\nEstimated: $${estimate}\n\n${dispatch}`;
    }

    case 'General Contractor':
      return `🏗️ GC BID ESTIMATE\n\nProject: ${answers.project}\nSize: ${answers.size}\nTimeline: ${answers.timeline}\n\nEstimated Range: $${estimate}\n\nContractor will call within 24 hours for site visit.`;

    case 'Locksmith': {
      const dispatch = (urgent === 'yes') ? 'Locksmith dispatched now.' : 'We will call to schedule.';
      return `🔑 LOCKSMITH ESTIMATE\n\nType: ${answers.lockout_type}\nLocation: ${answers.location}\nUrgent: ${answers.timing}\n\nEstimated: $${estimate}\n\n${dispatch}`;
    }

    case 'Small Business':
      return `📞 SMALL BUSINESS SOLUTION\n\nType: ${answers.business_type}\nNeed: ${answers.need}\nContact: ${answers.contact}\n\nBotwave answers your phone 24/7: $${estimate}/month\n\nCheaper than hiring. Never misses a customer.`;

    case 'Restaurant':
      return `🍽️ RESTAURANT SERVICE\n\nType: ${answers.service_type}\nDetails: ${answers.details}\nContact: ${answers.contact}\n\nEstimated: $${estimate}\n\n${answers.service_type.includes('catering') ? 'Catering coordinator will call.' : answers.service_type.includes('reservation') ? 'Table reserved.' : 'We will respond.'}`;

    default:
      return `Estimate: $${estimate}`;
  }
}

// Check if user is in an active flow
export function isInFlow(botName, userId) {
  const session = getSession(botName, userId);
  return session.active;
}

// Get flow question for current step
export function getFlowQuestion(botName, userId) {
  const config = getVerticalConfig(botName);
  const session = getSession(botName, userId);
  if (!config.flow || !session.active) return null;

  const currentStep = config.flow.steps[session.step];
  return config.flow.questions[currentStep];
}
