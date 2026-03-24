import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'brand', 'public');

// Ensure data directory
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
['leads.json', 'tickets.json', 'messages.json', 'revenue.json'].forEach(f => {
  const p = path.join(DATA_DIR, f);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '[]');
});

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Health check endpoint
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // API routes
  if (pathname === '/api/stats') {
    try {
      const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
      const tickets = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tickets.json'), 'utf8'));
      const messages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'messages.json'), 'utf8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ leads: leads.length, tickets: tickets.length, messages: messages.length, revenue: 0 }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  if (pathname === '/api/leads' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const lead = JSON.parse(body);
      lead.id = Date.now();
      lead.created = new Date().toISOString();
      const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
      leads.push(lead);
      fs.writeFileSync(path.join(DATA_DIR, 'leads.json'), JSON.stringify(leads, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: lead.id }));
    });
    return;
  }

  if (pathname === '/api/leads') {
    const leads = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'leads.json'), 'utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(leads));
    return;
  }

  if (pathname === '/api/tickets' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const ticket = JSON.parse(body);
      ticket.id = Date.now();
      ticket.status = 'open';
      ticket.created = new Date().toISOString();
      const tickets = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tickets.json'), 'utf8'));
      tickets.push(ticket);
      fs.writeFileSync(path.join(DATA_DIR, 'tickets.json'), JSON.stringify(tickets, null, 2));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id: ticket.id }));
    });
    return;
  }

  if (pathname === '/api/tickets') {
    const tickets = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'tickets.json'), 'utf8'));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tickets));
    return;
  }

  // Serve static files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => console.log(`Botwave Dashboard: http://localhost:${PORT}`));
