// Small UI helpers: navbar, toasts, formatters.
(function () {
  window.esc = function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  window.fmtBDT = function (n) {
    if (n == null || n === '') return '';
    return '৳ ' + Number(n).toLocaleString('en-IN');
  };

  window.timeAgo = function (dateStr) {
    const then = new Date(dateStr).getTime();
    const sec = Math.floor((Date.now() - then) / 1000);
    if (sec < 60) return sec + 's ago';
    if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
    return Math.floor(sec / 86400) + 'd ago';
  };

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

  window.renderNavbar = function () {
    const user = window.API.currentUser();
    const nav = document.getElementById('nav');
    if (!nav) return;
    nav.innerHTML = `
      <div class="nav-inner">
        <a href="index.html" class="brand">
          <span class="brand-dot">🟢</span> Shohoj
        </a>
        <div class="nav-links">
          <a href="dashboard.html">Segments</a>
          ${
            user
              ? `<a href="inbox.html">Inbox</a>
                 <a href="profile.html?id=${user._id}">${esc(user.name)}${
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
                 <a href="#" id="logoutLink">Logout</a>`
              : `<a href="login.html">Log in</a>
                 <a href="signup.html" class="btn btn-primary btn-sm">Sign up</a>`
          }
        </div>
      </div>
    `;
    const l = document.getElementById('logoutLink');
    if (l)
      l.addEventListener('click', (e) => {
        e.preventDefault();
        window.API.logout();
        location.href = 'index.html';
      });
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
