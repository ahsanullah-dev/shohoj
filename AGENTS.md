# Shohoj — Base44 dev environment

## Stack
- **Backend**: Node.js + Express API in `backend/` (entry `server.js`, port 5000).
- **Frontend**: plain static HTML/CSS/JS in `frontend/` (no build step).
- **Database**: MongoDB (runs as a local compose service; no Atlas needed here).

## How it runs here (single-origin)
`docker-compose.base44.yml` wires three services:
- `mongo` — local MongoDB 7 with generated credentials.
- `backend` — `node:22` runtime, bind-mounts `backend/`, installs deps into a named
  volume, runs `nodemon --legacy-watch server.js` for hot reload.
- `web` — `nginx:alpine` on host port **3000**, serves `frontend/` as static files
  and reverse-proxies `/api/` and `/uploads/` to the backend.

The frontend talks to the backend **same-origin** via the nginx proxy:
`frontend/js/env.js` sets `window.SHOHOJ_API_URL = window.location.origin`, so all
`/api/*` and `/uploads/*` requests go to port 3000 and are forwarded internally.
This avoids depending on the changing preview hostname for API routing.

`CORS_ORIGIN` is still set to the public preview origin (`https://3000-${BASE44_PUBLIC_HOST_SUFFIX}`)
because the browser sends an `Origin` header on same-origin POSTs and the backend's
CORS middleware rejects unknown origins with a 500.

## Credentials / secrets
- **None required to boot.** MongoDB URI and JWT_SECRET are generated locally in compose.
- **Cloudinary is optional**: `backend/routes/uploads.js` falls back to local file
  storage (served at `/uploads/`) when `CLOUDINARY_*` env vars are absent. Add them
  via the Base44 secrets dashboard only if you want Cloudinary-hosted images.
- `PAYMENT_BKASH_NUMBER` / `PAYMENT_NAGAD_NUMBER` are display-only placeholders.

## Verify it works
```bash
docker compose -f docker-compose.base44.yml up -d
# frontend
curl -sf -H "Host: x.example" http://localhost:3000/ | head -1
# api health (proxied)
curl -sf http://localhost:3000/api/health
# register (use @ruet.ac.bd email to get the RUET-verified badge)
curl -s -H "Content-Type: application/json" \
  -H "Origin: https://3000-${BASE44_PUBLIC_HOST_SUFFIX}" \
  -X POST http://localhost:3000/api/auth/register \
  -d '{"name":"Test","email":"a@ruet.ac.bd","password":"password123"}'
```

## Notes / quirks
- Frontend has no build step — edits to `frontend/` appear immediately (nginx serves
  the bind-mounted files); a hard refresh in the preview may be needed.
- Backend edits hot-reload via nodemon. If a change isn't picked up, restart the
  `backend` service.
- The repo's own README assumes MongoDB Atlas + Cloudinary + separate static
  hosting; the Base44 compose replaces all of that with local services + nginx.
