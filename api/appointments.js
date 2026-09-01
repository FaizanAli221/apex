// api/appointments.js
// POST /api/appointments
// Accepts a booking payload, validates it, and returns a mock confirmation
// with a generated bookingId. No persistence layer — this is a portfolio
// mock, so nothing is written to a database. Swap in Postgres/Mongo/etc.
// at the point marked below to make it production-real.

const { applyCors } = require("../lib/cors");
const { SERVICES } = require("../lib/data");
const { validateAppointment } = require("../lib/validators");

function generateBookingId() {
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit
  return `APX-${random}`;
}

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
  const { valid, errors } = validateAppointment(body, validServiceIds);

  if (!valid) {
    return res.status(400).json({ success: false, errors });
  }

  const service = SERVICES.find((s) => s.id === body.serviceId);
  const bookingId = generateBookingId();

  // --- Persistence point ---
  // await db.collection("appointments").insertOne({ bookingId, ...payload });
  // Left as a mock so the project runs with zero external services.

  const confirmation = {
    bookingId,
    status: "confirmed",
    customer: {
      fullName: body.fullName.trim(),
      email: body.email.trim(),
      phone: body.phone.trim(),
    },
    vehicle: {
      make: body.carMake.trim(),
      model: body.carModel.trim(),
      year: Number(body.year),
    },
    service: {
      id: service.id,
      name: service.name,
      category: service.category,
      estimatedTime: service.estimatedTime,
    },
    preferredDate: body.preferredDate,
    notes: body.notes ? body.notes.trim() : null,
    createdAt: new Date().toISOString(),
  };

  return res.status(201).json({
    success: true,
    message: `Appointment ${bookingId} confirmed. We'll call to finalize your slot.`,
    data: confirmation,
  });
};
