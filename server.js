// server.js - Zero-dependency local development server
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Load API route handlers
const routes = {
  '/api/health': require('./api/health'),
  '/api/services': require('./api/services'),
  '/api/appointments': require('./api/appointments'),
  '/api/estimate-cost': require('./api/estimate-cost'),
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Add Vercel Serverless Function helper methods to res
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.end(JSON.stringify(data));
    return this;
  };

  // Match API routes
  if (routes[pathname]) {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (body) {
        try {
          req.body = JSON.parse(body);
        } catch {
          req.body = body;
        }
      } else {
        req.body = {};
      }
      try {
        routes[pathname](req, res);
      } catch (err) {
        console.error(`Error in ${pathname}:`, err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    });
    return;
  }

  // Serve static files or fallback to index.html
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Internal Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n?? Apex Auto Care full-stack app running at: http://localhost:${PORT}`);
  console.log(`   - Frontend:  http://localhost:${PORT}/`);
  console.log(`   - Health:    http://localhost:${PORT}/api/health`);
  console.log(`   - Services:  http://localhost:${PORT}/api/services`);
  console.log(`\nReady for Vercel deployment!\n`);
});
