// ═══════════════════════════════════════════════════════════════════════════
// Shohoj — UI Core Engine (Icons, Custom Logo, Theme Switcher, Navbar, Modals)
// ═══════════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── SVG Icon Library ───────────────────────────────────────────────────────
  const ICONS = {
    logo: `
      <svg class="shohoj-logo-svg" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="shGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="60%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
          <linearGradient id="shGradInner" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#e0f2fe" stop-opacity="1" />
          </linearGradient>
          <filter id="shGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#shGrad)" />
        <!-- Stylized 'S' Monogram -->
        <path d="M26 13.5C25 11.5 22.5 10 19.5 10C15.5 10 12.5 13 12.5 16.5C12.5 20.2 15.5 21.8 19 22.8C22.8 23.9 25.5 25.2 25.5 28.5C25.5 32.2 22.2 34 18.5 34C14.5 34 11.8 31.8 11 29.5" 
              stroke="url(#shGradInner)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="28" cy="11" r="2.5" fill="#facc15" filter="url(#shGlow)"/>
      </svg>
    `,
    compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    inbox: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    plusCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>`,
    bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    login: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`,
    userPlus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`,
    camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>`,
    image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`,
    upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  };

  window.getIcon = function (name, size = 18, extraClass = '') {
    const raw = ICONS[name] || '';
    if (!raw) return '';
    return `<span class="ui-icon ui-icon-${name} ${extraClass}" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;">${raw}</span>`;
  };

  window.getLogo = function (size = 36) {
    return `<div class="brand-logo-wrap" style="width:${size}px;height:${size}px;">${ICONS.logo}</div>`;
  };

  // ── Image URL Resolver (handles local static /uploads vs Cloudinary) ────────
  window.resolveImgUrl = function (url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const base = (window.API && window.API.BASE) || 'http://localhost:5000';
    return base.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
  };

  // ── Theme Switcher Engine ──────────────────────────────────────────────────
  function getPreferredTheme() {
    const saved = localStorage.getItem('shohoj_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  window.applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shohoj_theme', theme);
    updateThemeControls(theme);
  };

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    window.applyTheme(next);
  };

  function updateThemeControls(theme) {
    const isDark = theme === 'dark';
    const switchEls = document.querySelectorAll('.theme-toggle-switch');
    switchEls.forEach((sw) => {
      sw.classList.toggle('is-dark', isDark);
      sw.setAttribute('aria-checked', isDark ? 'true' : 'false');
      sw.setAttribute('title', isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode');
    });
  }

  // Initialize theme immediately
  const initialTheme = getPreferredTheme();
  document.documentElement.setAttribute('data-theme', initialTheme);

  // ── Escape String ──────────────────────────────────────────────────────────
  window.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  // ── Formatters ─────────────────────────────────────────────────────────────
  window.fmtBDT = function (n) {
    if (n == null || n === '') return '';
    return '৳ ' + Number(n).toLocaleString('en-IN');
  };

  window.timeAgo = function (dateStr) {
    if (!dateStr) return '';
    const then = new Date(dateStr).getTime();
    const sec = Math.floor((Date.now() - then) / 1000);
    if (sec < 60) return sec + 's ago';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd ago';
    return new Date(dateStr).toLocaleDateString();
  };

  // ── Toast Notification System ──────────────────────────────────────────────
  window.toast = function (msg, kind = 'info') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    const iconName = kind === 'success' ? 'check' : kind === 'error' ? 'x' : 'sparkles';
    el.innerHTML = `
      <div class="toast-inner toast-${kind}">
        <span class="toast-icon">${window.getIcon(iconName, 18)}</span>
        <span class="toast-text">${window.esc(msg)}</span>
      </div>
    `;
    el.className = 'toast show';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  };

  // ── Skeleton Loader Generator ──────────────────────────────────────────────
  window.getSkeletonCards = function (count = 6) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="post-card skeleton-card">
          <div class="thumb skeleton-shimmer"></div>
          <div class="body">
            <div class="skeleton-line skeleton-title skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-meta skeleton-shimmer"></div>
            <div class="skeleton-line skeleton-price skeleton-shimmer"></div>
          </div>
        </div>
      `;
    }
    return html;
  };

  // ── Navbar Component with Icons & Theme Switcher ───────────────────────────
  window.renderNavbar = function () {
    const user = window.API.currentUser();
    const nav = document.getElementById('nav');
    if (!nav) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';

    // Theme Switch Component HTML
    const themeSwitchHtml = `
      <button class="theme-toggle-switch ${isDark ? 'is-dark' : ''}" 
              id="themeSwitchBtn" 
              role="switch" 
              aria-checked="${isDark}" 
              title="${isDark ? 'Switch to Bright Mode' : 'Switch to Dark Mode'}">
        <span class="theme-switch-track">
          <span class="theme-switch-icon sun-icon">${window.getIcon('sun', 14)}</span>
          <span class="theme-switch-icon moon-icon">${window.getIcon('moon', 14)}</span>
          <span class="theme-switch-thumb"></span>
        </span>
      </button>
    `;

    nav.innerHTML = `
      <div class="nav-inner">
        <!-- Brand Logo -->
        <a href="index.html" class="brand" aria-label="Shohoj Home">
          ${window.getLogo(34)}
          <div class="brand-text">
            <span class="brand-name">Shohoj</span>
            <span class="brand-tag">CAMPUS</span>
          </div>
        </a>

        <!-- Main Navigation Links with Icons -->
        <div class="nav-links">
          <a href="dashboard.html" class="nav-btn" title="Explore Segments">
            ${window.getIcon('compass', 17)}
            <span>Segments</span>
          </a>

          ${
            user
              ? `
              <a href="inbox.html" class="nav-btn" title="Messages">
                ${window.getIcon('chat', 17)}
                <span>Inbox</span>
              </a>

              <a href="feed.html?new=1" class="btn btn-primary btn-sm nav-post-btn" id="navNewPostBtn">
                ${window.getIcon('plus', 16)}
                <span>Post Ad</span>
              </a>

              <div class="notif-wrap" id="notif-wrap">
                <button class="notif-bell-btn" id="notifBtn" aria-label="Notifications" title="Notifications">
                  ${window.getIcon('bell', 18)}
                  <span class="notif-badge hidden" id="notif-badge">0</span>
                </button>
                <div class="notif-panel" id="notif-panel">
                  <div class="notif-header">
                    <h4>Notifications</h4>
                    <span class="notif-mark-read" id="notifMarkAll">Mark read</span>
                  </div>
                  <div class="notif-list" id="notif-list">
                    <p class="notif-empty">Loading…</p>
                  </div>
                </div>
              </div>

              <!-- User Profile Chip -->
              <a href="profile.html?id=${user._id}" class="user-profile-chip" title="View Profile">
                <div class="avatar-sm" style="${user.avatarUrl ? `background-image:url('${window.esc(window.resolveImgUrl(user.avatarUrl))}')` : ''}">
                  ${user.avatarUrl ? '' : (user.name?.[0] || 'U').toUpperCase()}
                </div>
                <span class="user-chip-name">${window.esc(user.name?.split(' ')[0] || user.name)}</span>
                ${user.isRuetVerified ? '<span class="ruet-tag ruet-badge-sm">RUET</span>' : ''}
              </a>

              <!-- Logout Button -->
              <button class="nav-icon-btn nav-logout-btn" id="logoutBtn" title="Log out" aria-label="Log out">
                ${window.getIcon('logout', 18)}
              </button>
              `
              : `
              <a href="login.html" class="nav-btn" title="Log in">
                ${window.getIcon('login', 17)}
                <span>Log in</span>
              </a>
              <a href="signup.html" class="btn btn-primary btn-sm nav-signup-btn" title="Create free account">
                ${window.getIcon('userPlus', 16)}
                <span>Sign up</span>
              </a>
              `
          }

          <!-- Dark / Bright Mode Toggle Switch -->
          ${themeSwitchHtml}
        </div>
      </div>
    `;

    // Logout listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.API.logout();
        window.toast('Logged out successfully', 'info');
        setTimeout(() => { location.href = 'index.html'; }, 300);
      });
    }

    // Theme Switch listener
    const themeSwitchBtn = document.getElementById('themeSwitchBtn');
    if (themeSwitchBtn) {
      themeSwitchBtn.addEventListener('click', window.toggleTheme);
    }

    // Initialize notification polling if user is logged in
    if (user && typeof window.initNotifications === 'function') {
      window.initNotifications();
    }
  };

  // ── Auth Guard Helper ──────────────────────────────────────────────────────
  window.requireAuth = function () {
    if (!window.API.token()) {
      location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  };
})();

