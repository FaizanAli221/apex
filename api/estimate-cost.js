// api/estimate-cost.js
// POST /api/estimate-cost
// Accepts { vehicleType, serviceIds[] } and returns an itemized cost
// breakdown: parts, labor (hours * shop rate * vehicle multiplier), and tax.

const { applyCors } = require("../lib/cors");
const { SERVICES, HOURLY_LABOR_RATE, TAX_RATE, VEHICLE_MULTIPLIERS } = require("../lib/data");
const { validateEstimateRequest } = require("../lib/validators");

module.exports = (req, res) => {
  if (applyCors(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed. Use POST.`,
    });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ success: false, errors: ["Invalid JSON payload."] });
    }
  }
  const validServiceIds = SERVICES.map((s) => s.id);
  const validVehicleTypes = Object.keys(VEHICLE_MULTIPLIERS);

  const { valid, errors } = validateEstimateRequest(body, validServiceIds, validVehicleTypes);
  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }

  const vehicleType = body.vehicleType.toLowerCase();
  const multiplier = VEHICLE_MULTIPLIERS[vehicleType];

  const lineItems = body.serviceIds.map((id) => {
    const service = SERVICES.find((s) => s.id === id);
    const partsCost = Math.round(service.partsCost * multiplier * 100) / 100;
    const laborCost =
      Math.round(service.laborHours * HOURLY_LABOR_RATE * multiplier * 100) / 100;
    const lineTotal = Math.round((partsCost + laborCost) * 100) / 100;

    return {
      serviceId: service.id,
      name: service.name,
      category: service.category,
      laborHours: service.laborHours,
      partsCost,
      laborCost,
      lineTotal,
    };
  });

  const subtotal = Math.round(lineItems.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return res.status(200).json({
    success: true,
    vehicleType,
    vehicleMultiplier: multiplier,
    laborRatePerHour: HOURLY_LABOR_RATE,
    taxRate: TAX_RATE,
    lineItems,
    subtotal,
    tax,
    total,
  });
};
