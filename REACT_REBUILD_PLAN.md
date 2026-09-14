# Shohoj Platform Upgrade: React + Vite + Tailwind CSS Blueprint

## 1. Project Overview & Decisions
- **Goal**: Rebuild the Shohoj frontend from vanilla HTML/JS into a modern **React 18 + Vite + Tailwind CSS** Single Page Application (SPA).
- **Backend**: Existing Express backend deployed on Render (`https://shohoj-api.onrender.com`) with MongoDB, Brevo mailer, Cloudinary, and JWT auth remains 100% active and connected.
- **Hero Section**: The 3D rotating book has been **completely removed**. It is replaced by a clean, modern **Live Marketplace Preview Widget** with sample verified student cards.
- **Branded Email Template**: Dark-mode HTML template with Shohoj logo, "STUDENT MARKETPLACE" subtitle, "Identity Verification Required" header, and dashed 6-digit code box (already configured in `backend/utils/mailer.js`).

---

## 2. Multi-University Verification Badges
Automatically detect university from email domain and award distinct badges:
- **RUET**: `RUET Verified` (Purple `#8B5CF6`) — `@student.ruet.ac.bd`, `@ruet.ac.bd`
- **Varendra University**: `Varendra Uni Verified` (Teal `#0D9488`) — `@vu.edu.bd`, `@student.vu.edu.bd`
- **BUET**: `BUET Verified` (Navy `#2563EB`) — `@buet.ac.bd`, `@student.buet.ac.bd`
- **University of Dhaka (DU)**: `DU Verified` (Crimson `#E11D48`) — `@du.ac.bd`
- **KUET, CUET, SUST, IUT, RU, BRACU, NSU, AIUB, AUST**: Dedicated university badges.
- **General Accounts**: `Verified Student` upon email verification.

---

## 3. Design System & Theme
- **Dark Theme (Default)**: Deep obsidian & slate surfaces (`#090D16`, `#0F172A`, `#1E293B`) with vibrant Electric Indigo (`#6366F1`), Emerald Green (`#10B981`), and Cyan Glow (`#06B6D4`).
- **Light Theme**: Crisp white cards (`#FFFFFF`) on `#F8FAFC` slate background with subtle borders (`#E2E8F0`).
- **Icons**: Lucide React icons.
- **Typography**: Inter / Space Grotesk / JetBrains Mono.

---

## 4. Standard Business Copywriting
- **Hero Title**: *"The Verified Student Marketplace for Campus Gigs & Items"*
- **Subtitle**: *"Buy & sell textbooks, find tuition gigs, get tech devices repaired, and trade campus services with verified peers from RUET, Varendra, BUET, DU, and top universities across Bangladesh."*
- **5 Core Segments**:
  1. 📚 Tuition Offers (HSC, University courses, Math, Physics, Code)
  2. 🛠️ Tech & Repair (Laptop, mobile, bike, electronics, OS installs)
  3. 🎨 Creative & Design (Graphic design, photography, video editing)
  4. 📦 Campus Errands (Printing, delivery, ride-sharing, urgent micro-jobs)
  5. 🛍️ Buy, Sell & Exchange (Calculators, lab kits, books, cycles, electronics)

---

## 5. React Frontend Architecture
```
shohoj/
└── frontend/
    ├── src/
    │   ├── api/client.js          # Fetch/Axios client pointing to backend
    │   ├── context/               # AuthContext, ThemeContext, NotificationContext
    │   ├── components/
    │   │   ├── layout/            # Navbar, MobileDrawer, Footer
    │   │   ├── common/            # UniversityBadge, Button, Input, Modal, Toast
    │   │   ├── home/              # HeroSection, LivePreviewWidget, SegmentCards, HowItWorks
    │   │   ├── feed/              # PostCard, SegmentPills, SearchFilters
    │   │   └── chat/              # InboxList, MessageThread, ChatBubble
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── FeedPage.jsx
    │   │   ├── PostDetailPage.jsx
    │   │   ├── CreatePostPage.jsx
    │   │   ├── InboxPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   └── VerifyEmailPage.jsx
    │   ├── App.jsx                # React Router v6 Routes
    │   └── main.jsx
    ├── tailwind.config.js
    ├── package.json
    └── vite.config.js
```

---

## 6. Execution Instructions for New Agent
When starting with a new chat/account, read this file and run the following execution sequence:
1. Initialize Vite + React in `shohoj/frontend`.
2. Install dependencies (`react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`, Tailwind tools).
3. Setup `tailwind.config.js` and global styles.
4. Implement `api/client.js` and `AuthContext` (managing tokens, user, and university badge).
5. Build shared components (`<Navbar />`, `<MobileDrawer />`, `<Footer />`, `<UniversityBadge />`, `<PostCard />`).
6. Build all pages (`HomePage`, `FeedPage`, `PostDetailPage`, `CreatePostPage`, `InboxPage`, `ProfilePage`, `LoginPage`, `SignupPage`, `VerifyEmailPage`).
7. Test responsiveness (Mobile `<768px`, Tablet `768-1024px`, Desktop `>1024px`).
8. Commit and push to `origin main`.
