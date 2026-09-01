// lib/validators.js
// Small dependency-free validation helpers shared across API routes.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s()+\-.]{7,20}$/;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
  return isNonEmptyString(value) && EMAIL_REGEX.test(value.trim());
}

function isValidPhone(value) {
  return isNonEmptyString(value) && PHONE_REGEX.test(value.trim());
}

function isValidYear(value) {
  const year = Number(value);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1980 && year <= currentYear + 1;
}

function isValidFutureDate(value) {
  if (!isNonEmptyString(value)) return false;
  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const [y, m, d] = value.trim().split("-").map(Number);
    date = new Date(y, m - 1, d);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Validates an appointment payload against required fields.
 * Returns { valid: boolean, errors: string[] }
 */
function validateAppointment(body, validServiceIds) {
  const errors = [];

  if (!isNonEmptyString(body.fullName)) {
    errors.push("fullName is required.");
  }
  if (!isValidEmail(body.email)) {
    errors.push("A valid email address is required.");
  }
  if (!isValidPhone(body.phone)) {
    errors.push("A valid phone number is required.");
  }
  if (!isNonEmptyString(body.carMake)) {
    errors.push("carMake is required.");
  }
  if (!isNonEmptyString(body.carModel)) {
    errors.push("carModel is required.");
  }
  if (!isValidYear(body.year)) {
    errors.push("year must be a valid 4-digit vehicle year.");
  }
  if (!isNonEmptyString(body.serviceId) || !validServiceIds.includes(body.serviceId)) {
    errors.push(`serviceId must be one of: ${validServiceIds.join(", ")}.`);
  }
  if (!isValidFutureDate(body.preferredDate)) {
    errors.push("preferredDate must be a valid date (today or later).");
  }
  if (body.notes !== undefined && typeof body.notes !== "string") {
    errors.push("notes must be a string if provided.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an estimate-cost payload.
 */
function validateEstimateRequest(body, validServiceIds, validVehicleTypes) {
  const errors = [];

  const vehicleType =
    typeof body.vehicleType === "string" ? body.vehicleType.toLowerCase() : "";
  if (!validVehicleTypes.includes(vehicleType)) {
    errors.push(`vehicleType must be one of: ${validVehicleTypes.join(", ")}.`);
  }

  if (!Array.isArray(body.serviceIds) || body.serviceIds.length === 0) {
    errors.push("serviceIds must be a non-empty array.");
  } else {
    const invalidIds = body.serviceIds.filter((id) => !validServiceIds.includes(id));
    if (invalidIds.length > 0) {
      errors.push(`Unknown serviceIds: ${invalidIds.join(", ")}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidYear,
  isValidFutureDate,
  validateAppointment,
  validateEstimateRequest,
};
