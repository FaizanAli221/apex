// api/services.js
// GET /api/services
// Returns the full service catalog with category, estimated turnaround,
// and starting price.

const { applyCors } = require("../lib/cors");
const { SERVICES } = require("../lib/data");

module.exports = (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use GET.`,
    });
  }

  const categories = [...new Set(SERVICES.map((s) => s.category))];

  return res.status(200).json({
    success: true,
    count: SERVICES.length,
    categories,
    data: SERVICES.map(({ laborHours, partsCost, ...publicFields }) => publicFields),
  });
};
