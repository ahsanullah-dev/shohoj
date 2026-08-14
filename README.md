# Shohoj — Student services marketplace

A full-stack marketplace for tuition, tech repair, creative gigs, campus errands,
and buy/sell — with a **RUET-verified** trust tag for RUET students, real image
uploads, and manual **bKash / Nagad Send-Money** payment verification.

Built with a **professional split**: separate frontend, backend, and database.
This is how real teams structure it and it makes hosting flexible — you can
redeploy the frontend without touching the backend.

```
shohoj/
├── backend/       Node.js + Express API (deploys to Render / Railway / Fly)
├── frontend/      Plain HTML / CSS / JS static site (deploys to Netlify / Vercel)
└── (database)     MongoDB Atlas — separate managed service
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
- A **MongoDB Atlas** free cluster (or a local MongoDB) — see Step 1 in Deployment
- A **Cloudinary** free account for image uploads — see Step 2 in Deployment

### 1. Backend

```bash
cd backend
cp .env.example .env
# open .env in your editor and fill in MONGODB_URI, JWT_SECRET,
# CLOUDINARY_*, PAYMENT_BKASH_NUMBER, PAYMENT_NAGAD_NUMBER
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

Open <http://localhost:3000> in your browser, sign up (use an `@ruet.ac.bd`
email to see the RUET tag), then start posting.

## Deployment (going live)

Recommended free-tier stack: **MongoDB Atlas + Cloudinary + Render + Netlify**.

### Step 1 — MongoDB Atlas (database)

1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a free **M0** cluster (any region near Bangladesh — Mumbai or Singapore).
3. Under **Database Access** → *Add New Database User*: set a username + password (keep the password letters/numbers only to avoid URL-encoding headaches). Grant *Read and write to any database*.
4. Under **Network Access** → *Add IP Address* → *Allow Access From Anywhere* (`0.0.0.0/0`). Fine for a course project — Render's servers need to reach it.
5. **Database → Connect → Drivers → Node.js**: copy the connection string. Replace `<username>` and `<password>` with your real values, and add `/shohoj` before the `?`:
   ```
   mongodb+srv://alice:pass123@cluster0.xxxxx.mongodb.net/shohoj?retryWrites=true&w=majority
   ```

### Step 2 — Cloudinary (image storage)

1. Sign up at <https://cloudinary.com>. Free tier is generous (25 GB storage, 25 GB bandwidth/month).
2. Copy **Cloud name**, **API Key**, **API Secret** from the dashboard.

### Step 3 — Push to GitHub

```bash
cd shohoj
git init
git add .
git commit -m "Initial commit — Shohoj"
git branch -M main
# create an empty repo on github.com first, then:
git remote add origin https://github.com/YOUR_USER/shohoj.git
git push -u origin main
```

`.env` is gitignored — your secrets never leave your laptop.

### Step 4 — Deploy the backend to Render

1. Sign up at <https://render.com> with GitHub.
2. **New +** → **Web Service** → pick your `shohoj` repo.
3. Fill in:
   - **Name**: `shohoj-api`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Under **Environment** add these variables (paste in values from Steps 1 & 2):
   ```
   MONGODB_URI         (from Atlas)
   JWT_SECRET          (any long random string)
   CLOUDINARY_CLOUD_NAME
   CLOUDINARY_API_KEY
   CLOUDINARY_API_SECRET
   PAYMENT_BKASH_NUMBER
   PAYMENT_NAGAD_NUMBER
   CORS_ORIGIN         (leave empty for now — fill in Step 6)
   ```
5. Click **Create Web Service**. Render will build and give you a URL like `https://shohoj-api.onrender.com`. Verify it works: open `https://shohoj-api.onrender.com/api/health`.

### Step 5 — Deploy the frontend to Netlify

1. Sign up at <https://netlify.com>.
2. **Add new site** → **Import from Git** → pick your `shohoj` repo.
3. Fill in:
   - **Base directory**: `frontend`
   - **Build command**: *(leave blank)*
   - **Publish directory**: `frontend`
4. Deploy. You'll get a URL like `https://shohoj-abcdef.netlify.app`.
5. **Before it works**, edit `frontend/js/env.js` locally so it points at your Render backend, then commit + push:
   ```js
   window.SHOHOJ_API_URL = 'https://shohoj-api.onrender.com';
   ```
   Netlify auto-redeploys on push.

### Step 6 — Wire CORS

Back in Render → your backend → **Environment**, set:

```
CORS_ORIGIN = https://shohoj-abcdef.netlify.app
```

(Comma-separate multiple origins if you have staging URLs.) Save; Render restarts automatically.

Open your Netlify URL — you now have a live, running Shohoj.

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

- **Backend**: Node.js, Express, Mongoose (MongoDB), JWT auth, bcrypt, Multer (uploads), Cloudinary SDK.
- **Frontend**: HTML5, CSS3, vanilla ES6 JS. Zero build step.
- **Database**: MongoDB Atlas (free M0).
- **Storage**: Cloudinary (free tier).
- **Deployment**: Render (backend) + Netlify (frontend).
