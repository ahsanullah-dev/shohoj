// Small UI helpers: navbar, toasts, formatters, dark/bright theme toggle, custom logo & icons.
(function () {
  'use strict';

  // ── SVG Icon Helper ────────────────────────────────────────────────────────
  const ICONS = {
    logo: `
      <svg class="shohoj-logo-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:28px;height:28px;vertical-align:middle;display:inline-block;">
        <defs>
          <linearGradient id="shLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" />
            <stop offset="60%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#3b82f6" />
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="9" fill="url(#shLogoGrad)" />
        <path d="M24 12C23 10 20.5 8.5 17.5 8.5C13.5 8.5 10.5 11.5 10.5 15C10.5 18.5 13.5 20 17 21C20.5 22 23.5 23.5 23.5 26.5C23.5 30 20.5 31.5 17 31.5C13 31.5 10.5 29.5 9.5 27" 
              stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="26" cy="9.5" r="2.2" fill="#facc15" />
      </svg>
    `,
    compass: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    chat: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    user: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    login: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>`,
    userPlus: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`,
    logout: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    sun: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
  };

  window.getIcon = function (name) {
    return ICONS[name] || '';
  };

  // ── Image URL Resolver ─────────────────────────────────────────────────────
  window.resolveImgUrl = function (url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    const base = (window.API && window.API.BASE) || 'http://localhost:5000';
    return base.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
  };

  // ── Darkmode / Brightmode Switch Engine ─────────────────────────────────────
  function initTheme() {
    const saved = localStorage.getItem('shohoj_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }
  initTheme();

  window.toggleTheme = function () {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('shohoj_theme', next);
    const switchBtn = document.getElementById('themeSwitchBtn');
    if (switchBtn) {
      switchBtn.classList.toggle('is-dark', next === 'dark');
      switchBtn.setAttribute('aria-checked', next === 'dark' ? 'true' : 'false');
      switchBtn.setAttribute('title', next === 'dark' ? 'Switch to Bright mode' : 'Switch to Dark mode');
    }
  };

  // ── Escape ─────────────────────────────────────────────────────────────────
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
    return Math.floor(sec / 86400) + 'd ago';
  };

  // ── Toast ──────────────────────────────────────────────────────────────────
  window.toast = function (msg, kind = 'info') {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.className = 'toast toast-' + kind + ' show';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
  };

  // ── Navbar ─────────────────────────────────────────────────────────────────
  window.renderNavbar = function () {
    const user = window.API.currentUser();
    const nav  = document.getElementById('nav');
    if (!nav) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const isDark = currentTheme === 'dark';

    const themeSwitchHtml = `
      <button class="theme-toggle-switch ${isDark ? 'is-dark' : ''}" 
              id="themeSwitchBtn" 
              role="switch" 
              aria-checked="${isDark}" 
              title="${isDark ? 'Switch to Bright mode' : 'Switch to Dark mode'}">
        <span class="theme-switch-track">
          <span class="theme-switch-icon sun-icon">${ICONS.sun}</span>
          <span class="theme-switch-icon moon-icon">${ICONS.moon}</span>
          <span class="theme-switch-thumb"></span>
        </span>
      </button>
    `;

    nav.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <span class="brand-logo">${ICONS.logo}</span>
          <span class="brand-name">Shohoj</span>
        </a>
        <div class="nav-links">
          <a href="dashboard.html" class="nav-btn">${ICONS.compass}Segments</a>
          ${
            user
              ? `<a href="inbox.html" class="nav-btn">${ICONS.chat}Inbox</a>
                 ${user.role === 'admin' ? '<a href="admin.html" class="nav-btn">🛡️ Admin</a>' : ''}
                 <a href="profile.html?id=${user._id}" class="nav-btn user-nav-btn">${ICONS.user}${esc(user.name)}${
                   user.isRuetVerified ? ' <span class="ruet-tag">RUET</span>' : ''
                 }</a>
                 <div class="notif-wrap" id="notif-wrap">
                   <button class="notif-bell-btn" id="notifBtn" aria-label="Notifications" title="Notifications">
                     🔔
                     <span class="notif-badge hidden" id="notif-badge">0</span>
                   </button>
                   <div class="notif-panel" id="notif-panel">
                     <p class="notif-empty">Loading…</p>
                   </div>
                 </div>
                 <a href="#" id="logoutLink" class="nav-btn logout-nav-btn">${ICONS.logout}Logout</a>`
              : `<a href="login.html" class="nav-btn">${ICONS.login}Log in</a>
                 <a href="signup.html" class="btn btn-primary btn-sm">${ICONS.userPlus}Sign up</a>`
          }
          ${themeSwitchHtml}
        </div>
      </div>
    `;

    // Logout
    const l = document.getElementById('logoutLink');
    if (l)
      l.addEventListener('click', (e) => {
        e.preventDefault();
        window.API.logout();
        location.href = 'index.html';
      });

    // Theme toggle
    const tb = document.getElementById('themeSwitchBtn');
    if (tb) tb.addEventListener('click', window.toggleTheme);

    // Boot notification panel if module is loaded
    if (typeof window.initNotifications === 'function') {
      window.initNotifications();
    }
  };

  // Redirect to login if not authed
  window.requireAuth = function () {
    if (!window.API.token()) {
      location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
      return false;
    }
    return true;
  };
})();

