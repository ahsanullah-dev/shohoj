# Shohoj (সহজ) — University Campus Marketplace & Student Peer Gig Network

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47a248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/API-Render-46e3b7?logo=render&logoColor=black)](https://render.com/)

---

## 📌 What is Shohoj?

**Shohoj (সহজ)** is an all-in-one, trusted university marketplace and peer-to-peer gig platform designed specifically for university students across Bangladesh. 

On university campuses, thousands of students provide valuable services — private tutoring, laptop repair, graphics design, club photography, campus delivery, and second-hand trading of engineering equipment, books, and calculators. Previously, students had to rely on disorganized Facebook groups, unsearchable group chats, and unverified contacts.

**Shohoj bridges this gap** by providing an authenticated, secure, and modern campus economy where students can:
- Offer and discover student gigs and services.
- Buy, sell, and exchange campus essentials with peers.
- Rely on verified university badges to prevent scams.
- Discover listings geographically pinned to campus landmarks on an interactive map.
- Coordinate securely via built-in direct messaging and track manual bKash/Nagad transactions.

---

## 🏗️ How the Platform is Built

Shohoj is architected as a modern, decoupled web application combining a blazing-fast Single Page Application (SPA) frontend with a resilient REST API backend and managed cloud infrastructure.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                       │
│      React 18 + Vite + Tailwind CSS + Leaflet Maps      │
│               Hosted on Vercel (Edge CDN)               │
└────────────────────────────┬────────────────────────────┘
                             │  HTTPS / REST API + JWT
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    EXPRESS BACKEND                      │
│            Node.js API Hosted on Render                 │
└───────┬────────────────────┬────────────────────┬───────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   MONGODB    │     │  CLOUDINARY  │     │ BREVO/SENDGRID│
│    ATLAS     │     │ Image Storage│     │ Transactional│
│  (Database)  │     │   & CDN      │     │  HTTPS Email │
└──────────────┘     └──────────────┘     └──────────────┘
```

### 1. Technology Breakdown

* **Frontend:**
  - **React 18 & Vite:** Lightning-fast compile times, client-side routing with `react-router-dom`, and reactive state management.
  - **Tailwind CSS:** Custom design system with light and sleek dark mode support, HSL tailored color palettes, and glassmorphism.
  - **Lucide Icons:** Unified modern iconography throughout navigation, actions, and badges.
  - **Leaflet & React-Leaflet:** Interactive campus maps powered by OpenStreetMap tiles (zero proprietary API keys required).

* **Backend:**
  - **Node.js & Express.js:** Modular MVC API structure with robust error handling, rate limiting, and CORS configuration.
  - **Mongoose ORM:** Schema definitions with compound indexes, text search indexes, and atomic `$inc` counters.
  - **JWT & Bcrypt:** Secure password hashing and stateless token-based authorization.

* **Database & Media:**
  - **MongoDB Atlas:** Managed cloud document database holding collections for Users, Posts, Conversations, Messages, Comments, Likes, Favorites, and Reports.
  - **Cloudinary:** Scalable cloud image hosting with automatic compression, secure upload signatures, and format optimization.

* **Deployment Infrastructure:**
  - **Frontend on Vercel:** Continuous deployment directly from GitHub, instant global CDN invalidation, and custom client-side rewrite rules (`vercel.json`).
  - **Backend on Render:** Containerized Web Service running continuously with automated git webhook redeployments.

---

## 🔗 How Everything Works Together

### 1. Frontend & Backend Communication
- The React frontend communicates with the Express backend strictly over **HTTPS** using a centralized API client (`src/api/client.js`).
- **Authentication Handshake:** Upon registration or login, the backend issues a signed **JSON Web Token (JWT)**. The frontend stores this token in browser local storage and attaches it as a `Bearer <token>` in the HTTP `Authorization` header on all protected requests.
- **CORS Management:** Render's backend enforces CORS origin filters, explicitly permitting requests from the Vercel production domain and local development ports.

### 2. How Email Verification Works (Bypassing Cloud SMTP Blocks)
- When a user signs up, the backend generates an ephemeral, cryptographically secure 6-digit one-time confirmation code valid for 10 minutes.
- **The Challenge:** Free cloud hosting platforms (like Render) block outbound SMTP ports (25, 465, 587) platform-wide to prevent spam abuse, causing standard nodemailer SMTP connections to time out.
- **The Solution:** Shohoj routes verification emails via the **Brevo (formerly Sendinblue) HTTPS API** (and SendGrid fallback). Requests are sent over standard HTTPS port `443` — which is never blocked by cloud firewalls.
- **Delivery Experience:** The user receives a branded, high-contrast HTML verification email with their code and instructions to check their Spam/Promotions tab if necessary.

### 3. How "Continue with Google" Works
- Students can register or log in instantly using Google Identity Services (OAuth 2.0).
- When a student signs in with Google, Google creates a cryptographically signed identity token.
- The backend verifies the token using official Google OAuth client libraries, extracting the verified email, name, and profile avatar.
- If the student signs in with a recognized institutional email (such as `@student.ruet.ac.bd`), the backend **automatically verifies their university badge on the spot**, skipping manual email confirmation.

### 4. How Framing & Card Alignment Works
- **Fixed-Ratio Visual Framing:** On marketplaces, user-uploaded pictures come in varying aspect ratios, which typically breaks layout grids. Shohoj enforces a uniform card frame with a fixed-height banner (`h-44`) on every post card.
- **Smart Segment Fallback Graphics:** If a student publishes an offer without uploading a picture, the system automatically renders an attractive, segment-specific gradient cover with branded iconography:
  - 📚 **Tuition:** Purple/Indigo gradient with Book icon and watermark.
  - 🛠️ **Tech Repair:** Teal/Emerald gradient with Wrench icon and watermark.
  - 🎨 **Creative Design:** Rose/Pink gradient with Palette icon and watermark.
  - 📦 **Campus Errands:** Amber/Orange gradient with Package icon and watermark.
  - 🛍️ **Buy & Sell:** Blue/Cyan gradient with Shopping Bag icon and watermark.
- **Glassmorphic Navigation & Themes:** The framing features a sticky glassmorphic navigation bar with real-time unread message counts, a seamless Dark/Light mode toggle, and a responsive mobile drawer.

---

## 🌟 Key Features

### 🛍️ 1. Five Distinct Marketplace Segments
- **Tuition Offers:** Subject matching, course codes (e.g. *MATH 1101*, *PHY 1201*), batch level, and online/in-person mode.
- **Tech & Gadget Repair:** Laptop SSD/RAM upgrades, thermal paste application, OS installation, and smartphone diagnostics.
- **Creative & Design:** Fest banners, club posters, presentation slides, photography, and video editing.
- **Campus Errands:** Document printing, hall-to-hall deliveries, grocery runs, and peer assistance.
- **Buy, Sell & Exchange:** Scientific calculators, lab aprons, drafting tools, engineering notes, bicycles, and hostel electronics.

### 🗺️ 2. Interactive Campus Discovery Map
- Discover student gigs visually around **10 top university campuses**: **RUET, Varendra University (VU), BUET, University of Dhaka (DU), KUET, CUET, SUST, IUT, University of Rajshahi (RU), and AUST**.
- Rendered with OpenStreetMap via Leaflet.
- Highlights notable campus landmarks (Central Library, Shahid Minar, Cafeterias, Halls, and Gates).
- Active student listings are pinned as interactive, color-coded markers with price badges and popups linking to listing details.

### 🛡️ 3. Trust & Inline University Badges
- Verified badges indicate authentic campus students.
- Displayed both as expanded shields on profile headers and as compact inline badges (e.g., `🟣 RUET`, `🟢 VU`, `🔵 BUET`) next to student names across feed cards, post detail pages, comments, and chat windows.
- Users can flag suspicious or fraudulent listings and profiles via a dedicated **Report Modal** with built-in hourly rate limiting.

### ❤️ 4. Engagement & Community Discussion
- **Likes with Counter:** One-click like button with optimistic UI updates.
- **Bookmark & Saved Listings:** Save listings to revisit later under the **Saved Listings** tab on your profile.
- **Listing Q&A Thread:** Ask questions directly on the post details page. Authors can answer questions, and comments can be moderated by their authors.

### 🔍 5. Multi-Filter Discovery Bar
- Combine search terms, university campus filter, marketplace segments, and budget range sliders (Min ৳ to Max ৳).
- Filter state synchronizes directly with URL query parameters for bookmarkable and shareable search results.

### 💬 6. Direct Messaging & Seen Receipts
- Connect one-on-one with peers to discuss details or arrange a meetup.
- **Live Typing Indicators:** Real-time animated bubble alerts when the other peer is typing.
- **Seen Status:** Read receipts display `✓✓ Seen` with timestamp once the recipient opens the conversation.

### 💳 7. Student Payment Coordination (bKash & Nagad)
- Direct peer-to-peer payment negotiation inside chat.
- Seller shares their personal bKash or Nagad number.
- Buyer enters their Transaction ID (TrxID) for confirmation, enabling reliable manual settlement without expensive merchant fees.

---

## 🚀 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- A free [Cloudinary](https://cloudinary.com) account

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Configure MONGODB_URI, JWT_SECRET, CLOUDINARY_*, and BREVO_API_KEY in .env
npm install
npm run dev
# Backend starts on http://localhost:5000 (or PORT specified in .env)
```

### 2. Frontend Setup
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

Vite proxies `/api` requests to `http://localhost:5000` automatically during local development.

---

## 📄 License
This project is open-source and built for student communities. Distributed under the MIT License.
