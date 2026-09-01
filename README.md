# Apex Auto Care — Serverless Backend

Zero-config Node.js backend for the Apex Auto Care landing page, built as
individual Vercel Serverless Functions (no Express, no framework, no build
step). Deploys to Vercel in one command and serves the frontend
(`index.html`) and API from the same domain.

## File structure

```
apex-backend/
├── api/
│   ├── health.js          GET  /api/health
│   ├── services.js        GET  /api/services
│   ├── appointments.js    POST /api/appointments
│   └── estimate-cost.js   POST /api/estimate-cost
├── lib/
│   ├── data.js            mock service catalog, pricing, tax/labor constants
│   ├── validators.js      shared request validation
│   └── cors.js            shared CORS header helper
├── index.html              the landing page frontend (calls the API above)
├── vercel.json              CORS headers + routing config
├── package.json
└── README.md
```

## Deploy to Vercel

```bash
npm install -g vercel     # if you don't already have the CLI
cd apex-backend
vercel                    # deploy a preview
vercel --prod             # promote to production
```

No environment variables or database are required — the catalog and
pricing rules live in `lib/data.js`. Swap that module for real DB calls
when you're ready to persist bookings (a comment in `api/appointments.js`
marks exactly where to add the insert).

## API Reference

### `GET /api/health`
Returns API status for uptime checks.
```json
{ "status": "operational", "timestamp": "2026-09-01T12:00:00.000Z", "version": "1.0.0" }
```

### `GET /api/services`
Returns the full service catalog with category, turnaround time, and
starting price.
```json
{
  "success": true,
  "count": 6,
  "categories": ["Maintenance", "Diagnostics", "Detailing"],
  "data": [
    { "id": "oil", "name": "Oil & Filter Change", "category": "Maintenance",
      "description": "...", "estimatedTime": "45 min", "basePrice": 72 }
  ]
}
```

### `POST /api/appointments`
Validates and "books" an appointment (mock — no persistence).

Request body:
```json
{
  "fullName": "Jane Rivera",
  "email": "jane@email.com",
  "phone": "555-123-4567",
  "carMake": "Honda",
  "carModel": "Civic",
  "year": 2019,
  "serviceId": "brakes",
  "preferredDate": "2026-09-10",
  "notes": "Squeaking on the front left"
}
```

Success (201):
```json
{
  "success": true,
  "message": "Appointment APX-8492 confirmed. We'll call to finalize your slot.",
  "data": { "bookingId": "APX-8492", "status": "confirmed", "...": "..." }
}
```

Validation failure (400):
```json
{ "success": false, "errors": ["A valid email address is required."] }
```

### `POST /api/estimate-cost`
Returns an itemized quote: parts, labor (hours × shop rate × vehicle
multiplier), subtotal, tax, and total.

Request body:
```json
{ "vehicleType": "suv", "serviceIds": ["oil", "brakes"] }
```

Response (200):
```json
{
  "success": true,
  "vehicleType": "suv",
  "vehicleMultiplier": 1.25,
  "laborRatePerHour": 95,
  "taxRate": 0.08,
  "lineItems": [
    { "serviceId": "oil", "name": "Oil & Filter Change", "category": "Maintenance",
      "laborHours": 0.5, "partsCost": 31.25, "laborCost": 59.38, "lineTotal": 90.63 }
  ],
  "subtotal": 302.19,
  "tax": 24.18,
  "total": 326.37
}
```

## Frontend → API integration

These are the same calls wired into `index.html`.

**Cost estimator** (`POST /api/estimate-cost`), debounced on checkbox change:
```javascript
async function updateEstimate(vehicleType, serviceIds) {
  const res = await fetch('/api/estimate-cost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleType, serviceIds }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors.join(', '));
  return json.total; // render this in the UI
}
```

**Appointment form** (`POST /api/appointments`):
```javascript
async function submitBooking(formData) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData), // { fullName, email, phone, carMake, carModel, year, serviceId, preferredDate, notes }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors.join(', '));
  return json.data.bookingId; // e.g. "APX-8492"
}
```

**Services grid** (`GET /api/services`), loaded on page mount:
```javascript
async function loadServices() {
  const res = await fetch('/api/services');
  const { data } = await res.json();
  return data; // [{ id, name, category, description, estimatedTime, basePrice }]
}
```

## Local development

```bash
vercel dev
```
Runs the functions and static frontend locally at `http://localhost:3000`
with the same routing as production.

## Resume / portfolio bullet points

- Architected and shipped a zero-config serverless REST API (Node.js on
  Vercel Functions) for a full-stack auto-service booking platform,
  covering catalog retrieval, server-side validated appointment booking,
  and a real-time itemized cost estimator with tax/labor calculation.
- Designed a shared validation and CORS middleware layer across four
  API routes, reducing duplicate logic and enabling instant one-command
  deployment with the frontend and backend served from a single Vercel
  project.
