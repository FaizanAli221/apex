// api/health.js
// GET /api/health
// Basic health check for uptime monitors / smoke tests.

const { applyCors } = require("../lib/cors");

const API_VERSION = "1.1.0";

module.exports = (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use GET.`,
    });
  }

  return res.status(200).json({
    status: "operational",
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  });
};
