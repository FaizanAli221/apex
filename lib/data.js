// lib/data.js
// Single source of truth for service catalog, pricing, and vehicle multipliers.
// In a production system this would live in a database (Postgres/Mongo);
// kept as an in-memory mock here so the API runs with zero external deps.

const HOURLY_LABOR_RATE = 95; // USD per hour, shop rate
const TAX_RATE = 0.08; // 8% flat sales tax for the mock estimate

const VEHICLE_MULTIPLIERS = {
  sedan: 1,
  suv: 1.25,
  truck: 1.4,
};

const SERVICES = [
  {
    id: "oil",
    name: "Oil & Filter Change",
    category: "Maintenance",
    description: "Full synthetic oil, new filter, and a 21-point inspection.",
    estimatedTime: "45 min",
    laborHours: 0.5,
    partsCost: 25,
  },
  {
    id: "brakes",
    name: "Brake Service",
    category: "Maintenance",
    description: "Pad replacement, rotor inspection, and fluid check.",
    estimatedTime: "2 hrs",
    laborHours: 1.5,
    partsCost: 70,
  },
  {
    id: "diagnostics",
    name: "Engine Diagnostics",
    category: "Diagnostics",
    description: "Computer scan and physical inspection to isolate the issue.",
    estimatedTime: "1 hr",
    laborHours: 1,
    partsCost: 0,
  },
  {
    id: "ceramic",
    name: "Ceramic Coating / Paint Protection",
    category: "Detailing",
    description: "Multi-layer ceramic coating for lasting shine and protection.",
    estimatedTime: "1 day",
    laborHours: 4,
    partsCost: 120,
  },
  {
    id: "ac",
    name: "AC Repair",
    category: "Diagnostics",
    description: "Refrigerant recharge, leak check, and compressor diagnostics.",
    estimatedTime: "1.5 hrs",
    laborHours: 1.5,
    partsCost: 35,
  },
  {
    id: "alignment",
    name: "Tire Alignment",
    category: "Maintenance",
    description: "Four-wheel alignment to correct pulling and uneven wear.",
    estimatedTime: "1 hr",
    laborHours: 1,
    partsCost: 0,
  },
];

// Derived "starting price" shown on the services list — parts + labor at the
// sedan (baseline) multiplier, so the frontend can show a single number.
function withBasePrice(service) {
  const laborCost = service.laborHours * HOURLY_LABOR_RATE;
  const basePrice = Math.round(service.partsCost + laborCost);
  return { ...service, basePrice };
}

const SERVICES_WITH_PRICING = SERVICES.map(withBasePrice);

module.exports = {
  HOURLY_LABOR_RATE,
  TAX_RATE,
  VEHICLE_MULTIPLIERS,
  SERVICES: SERVICES_WITH_PRICING,
};
