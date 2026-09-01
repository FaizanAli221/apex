// lib/cors.js
// Applies CORS headers to every API response and short-circuits preflight
// OPTIONS requests. vercel.json also sets these headers at the routing layer,
// but setting them here too means the API behaves correctly even if it's
// ever run outside Vercel (e.g. `vercel dev`, or a plain Node server).

function applyCors(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return true; // signal: caller should stop processing
  }
  return false;
}

module.exports = { applyCors };
