# Shohoj — Student services marketplace

# Shohoj — Student services marketplace

A full-stack marketplace for tuition, tech repair, creative gigs, campus errands,
and buy/sell — with a **RUET-verified** trust tag for RUET students, real image
uploads, and manual **bKash / Nagad Send-Money** payment verification.

**Live now**, running on a split stack:

| Layer      | Service                                  |
|------------|-------------------------------------------|
| Frontend   | [Netlify](https://netlify.com) — static `frontend/` folder, no build step |
| Backend    | [Render](https://render.com) — Node.js/Express API |
| Database   | [MongoDB Atlas](https://mongodb.com/atlas) |
| Image storage | [Cloudinary](https://cloudinary.com) |

```
shohoj/
├── backend/       Node.js + Express API — deployed on Render
├── frontend/      Plain HTML / CSS / JS static site — deployed on Netlify
└── (database)     MongoDB Atlas (separate managed service, not in this repo)
```

## Features

- **Open signup** with automatic `RUET` badge for `@student.ruet.ac.bd` / `@ruet.ac.bd` emails.
- **5 segments**, each with its own feed, categories, and post form:
  1. 📚 Tuition Offers
  2. 🛠️ Tech & Repair
  3. 🎨 Creative & Design
  4. 📦 Campus Errands & Micro-jobs
  5. 🛍️ Buy, Sell & Exchange
- **Real image uploads** — multiple photos per post, stored on Cloudinary.
- **Profile-to-profile direct messaging** (polling-based, 3-second refresh).
- **Manual bKash / Nagad payment flow** inside the chat:
  1. Seller requests BDT `X` via bKash or Nagad
  2. Buyer opens their bKash/Nagad app, sends the money to the seller's number
  3. Buyer submits the Transaction ID inside Shohoj
  4. Seller verifies in their app and marks it Paid

  > Why manual? Real bKash / Nagad **merchant APIs require business registration**
  > and are not available to individual developers or student projects. This manual
  > flow works with a personal number today; see *Upgrading payments* at the bottom.

## Local development

### Prerequisites

- Node.js 18+ (LTS) — check with `node -v`
- Access to the project's MongoDB Atlas cluster (or your own free cluster/local MongoDB)
- Access to the project's Cloudinary account (or your own free account)

### 1. Backend

```bash
cd backend
cp .env.example .env
# fill in MONGODB_URI, JWT_SECRET, CLOUDINARY_*,
# PAYMENT_BKASH_NUMBER, PAYMENT_NAGAD_NUMBER
npm install
npm start
# → [shohoj] backend listening on http://localhost:5000
```

Health check: open <http://localhost:5000/api/health>.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm start
# → serving on http://localhost:3000
```

(You can use any static server — `python3 -m http.server 3000`, VS Code Live
Server, etc. Just make sure the origin is included in the backend's `CORS_ORIGIN`.)

To point your local frontend at the **live** Render backend instead of running
your own backend locally, edit `frontend/js/env.js`:

```js
window.SHOHOJ_API_URL = 'https://<your-render-service>.onrender.com';
```

Open <http://localhost:3000> in your browser, sign up (use an `@ruet.ac.bd`
email to see the RUET tag), then start posting.

## Shipping a change to production

There's no manual deploy step for either side — both are wired to auto-deploy
from this repo:

- **Frontend (Netlify)** — redeploys automatically on every push to `main`
  that touches `frontend/`. No build command; it just publishes the folder as-is.
- **Backend (Render)** — redeploys automatically on every push to `main`
  that touches `backend/`.

So shipping a change is just:

```bash
git add -A
git commit -m "your change"
git push
```

Then check the Netlify / Render dashboards for the new deploy. If you only
changed frontend files, hard-refresh (Ctrl+Shift+R) after it finishes —
browsers can cache the old `style.css` / `js/*.js` for a bit.

### Environment variables (already configured on Render)

```
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
PAYMENT_BKASH_NUMBER
PAYMENT_NAGAD_NUMBER
CORS_ORIGIN          (your Netlify site URL)
```

If you rotate a secret or add a new Netlify preview URL, update these in the
Render dashboard under your service → **Environment** — no code change needed.

## Upgrading payments (Phase 2 — after business registration)

Once you register Shohoj as a business, you can swap the manual flow for real
gateway integration without touching the frontend:

- **bKash Merchant / PGW API** — <https://developer.bka.sh/>
- **Nagad Merchant API** — <https://developer.nagad.com.bd/>
- **SSLCommerz aggregator** (covers bKash + Nagad + cards + banking in one integration) — <https://www.sslcommerz.com/>

Add a new route (e.g. `POST /api/payments/gateway/init`) that calls the merchant
API, redirect the buyer to the checkout, then handle the callback and mark the
same `Payment` doc as `paid`. The chat UI already renders whatever status the
backend sets.

## Splitting the work (3-person team)

- **Backend + DB** (1 person): `backend/models/*`, `backend/routes/*`, `.env`, MongoDB Atlas, Cloudinary, Render deploy.
- **Frontend — Feed & Posts** (1 person): `index.html`, `dashboard.html`, `feed.html`, `post.html`, and the shared `js/config.js` per-segment fields.
- **Frontend — Auth, Profile, Chat & Payments** (1 person): `signup.html`, `login.html`, `profile.html`, `inbox.html` (chat + payment cards), Netlify deploy.

The shared `js/api.js` + `js/ui.js` + `css/style.css` are touched by everyone —
agree upfront that changes there need a quick heads-up in your group chat.

## Tech stack

- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT auth, bcrypt, Multer (uploads), Cloudinary SDK. Hosted on **Render**.
- **Frontend**: HTML5, CSS3, vanilla ES6 JS. Zero build step. Hosted on **Netlify**.
- **Database**: MongoDB Atlas.
- **Storage**: Cloudinary.


Once you register Shohoj as a business, you can swap the manual flow for real
gateway integration without touching the frontend:

- **bKash Merchant / PGW API** — <https://developer.bka.sh/>
- **Nagad Merchant API** — <https://developer.nagad.com.bd/>
- **SSLCommerz aggregator** (covers bKash + Nagad + cards + banking in one integration) — <https://www.sslcommerz.com/>

Add a new route (e.g. `POST /api/payments/gateway/init`) that calls the merchant
API, redirect the buyer to the checkout, then handle the callback and mark the
same `Payment` doc as `paid`. The chat UI already renders whatever status the
backend sets.

## Splitting the work (3-person team)

- **Backend + DB** (1 person): `backend/models/*`, `backend/routes/*`, `.env`, MongoDB Atlas, Cloudinary, Render deploy.
- **Frontend — Feed & Posts** (1 person): `index.html`, `dashboard.html`, `feed.html`, `post.html`, and the shared `js/config.js` per-segment fields.
- **Frontend — Auth, Profile, Chat & Payments** (1 person): `signup.html`, `login.html`, `profile.html`, `inbox.html` (chat + payment cards), Netlify deploy.

The shared `js/api.js` + `js/ui.js` + `css/style.css` are touched by everyone —
agree upfront that changes there need a quick heads-up in your group chat.

## Tech stack

- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT auth, bcrypt, Multer (uploads), Cloudinary SDK.
- **Frontend**: HTML5, CSS3, vanilla ES6 JS. Zero build step.
- **Database**: MongoDB Atlas (free M0).
- **Storage**: Cloudinary (free tier).
- **Deployment**: Render (backend) + Netlify (frontend).
