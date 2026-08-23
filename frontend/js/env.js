// Edit this to point at your deployed backend, e.g. https://shohoj-api.onrender.com
// For local dev with backend on :5000, leave as-is.
//
// Base44 dev preview: the frontend is served by an nginx reverse proxy on port
// 3000 that forwards /api and /uploads to the backend, so use the current
// page origin (same-origin) — no hardcoded host needed.
window.SHOHOJ_API_URL = window.location.origin;
