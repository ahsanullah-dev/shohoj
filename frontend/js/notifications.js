// Notification panel logic for Shohoj
// Depends on: api.js (window.API), ui.js (window.esc, window.timeAgo)
(function () {
  let _open = false;
  let _notifications = [];
  let _pollTimer = null;

  // ── helpers ────────────────────────────────────────────────────────────────
  function icon(type) {
    return type === 'new_message' ? '💬' : '🔔';
  }

  // ── render the dropdown list ───────────────────────────────────────────────
  function renderList() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;

    if (!window.API.token()) {
      panel.innerHTML = '<p class="notif-empty">Log in to see notifications.</p>';
      return;
    }

    if (!_notifications.length) {
      panel.innerHTML = '<p class="notif-empty">You\'re all caught up ✓</p>';
      return;
    }

    const items = _notifications
      .map(
        (n) => `
      <a class="notif-item${n.read ? '' : ' unread'}" href="${esc(n.link)}" data-id="${esc(n._id)}" id="notif-item-${esc(n._id)}">
        <span class="notif-icon">${icon(n.type)}</span>
        <div class="notif-body">
          <div class="notif-title">${esc(n.title)}</div>
          ${n.body ? `<div class="notif-sub">${esc(n.body)}</div>` : ''}
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
        ${n.read ? '' : '<span class="notif-dot"></span>'}
      </a>`
      )
      .join('');

    const unread = _notifications.filter((n) => !n.read).length;
    panel.innerHTML = `
      <div class="notif-header">
        <span>Notifications</span>
        ${unread ? `<button class="notif-mark-btn" id="markAllReadBtn">Mark all read</button>` : ''}
      </div>
      <div class="notif-list">${items}</div>`;

    // mark-all handler
    const markBtn = document.getElementById('markAllReadBtn');
    if (markBtn) {
      markBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await window.API.patch('/api/notifications/read-all', {});
          _notifications.forEach((n) => (n.read = true));
          renderList();
          updateBadge(0);
        } catch (_) {}
      });
    }

    // per-item click — mark read then navigate
    panel.querySelectorAll('.notif-item[data-id]').forEach((el) => {
      el.addEventListener('click', async (e) => {
        const id = el.dataset.id;
        const notif = _notifications.find((n) => n._id === id);
        if (notif && !notif.read) {
          try {
            await window.API.patch(`/api/notifications/${id}/read`, {});
            notif.read = true;
            const badge = document.getElementById('notif-badge');
            if (badge) {
              const cur = parseInt(badge.textContent, 10) || 0;
              updateBadge(Math.max(0, cur - 1));
            }
          } catch (_) {}
        }
      });
    });
  }

  // ── badge number ───────────────────────────────────────────────────────────
  function updateBadge(count) {
    const badge = document.getElementById('notif-badge');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // ── fetch from API ─────────────────────────────────────────────────────────
  async function fetchNotifications() {
    if (!window.API.token()) return;
    try {
      const { notifications, unreadCount } = await window.API.get('/api/notifications');
      _notifications = notifications || [];
      updateBadge(unreadCount || 0);
      if (_open) renderList();
    } catch (_) {}
  }

  // ── toggle open/close ──────────────────────────────────────────────────────
  function togglePanel() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    _open = !_open;
    panel.classList.toggle('show', _open);
    if (_open) {
      fetchNotifications().then(renderList);
    }
  }

  // ── close on outside click ─────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!_open) return;
    const wrap = document.getElementById('notif-wrap');
    if (wrap && !wrap.contains(e.target)) {
      _open = false;
      const panel = document.getElementById('notif-panel');
      if (panel) panel.classList.remove('show');
    }
  });

  // ── public init — called from renderNavbar ─────────────────────────────────
  window.initNotifications = function () {
    const btn = document.getElementById('notifBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePanel();
      });
    }
    // Initial fetch
    fetchNotifications();
    // Poll every 60 s
    clearInterval(_pollTimer);
    _pollTimer = setInterval(fetchNotifications, 60_000);
    // Also refresh when tab regains focus
    window.addEventListener('focus', fetchNotifications);
  };
})();
