// Shared feature helpers: ratings/stars, status badges, view counts,
// save (bookmark), share, and the global report modal.
// Loaded after api.js + ui.js on every page that uses these features.
(function () {
  'use strict';

  // ── Stars ────────────────────────────────────────────────────────────────
  window.starHtml = function (avg, size) {
    size = size || 14;
    const filled = Math.round(avg || 0);
    let s = '';
    for (let i = 1; i <= 5; i++) {
      s += '<span style="color:' + (i <= filled ? '#f59e0b' : 'var(--border2)') + ';font-size:' + size + 'px">★</span>';
    }
    return s;
  };

  window.ratingLine = function (avg, count, size) {
    if (!count) return '<span class="muted" style="font-size:12px">No reviews yet</span>';
    return '<span class="rating-line">' + window.starHtml(avg, size) +
      ' <b style="font-size:13px">' + (avg || 0).toFixed(1) + '</b>' +
      ' <span class="muted" style="font-size:12px">(' + count + ')</span></span>';
  };

  // ── Status badge ─────────────────────────────────────────────────────────
  window.statusBadge = function (status) {
    if (!status || status === 'available') return '';
    if (status === 'reserved') return '<span class="badge badge-wanted">Reserved</span>';
    if (status === 'sold') return '<span class="badge status-sold">Sold</span>';
    return '';
  };

  window.fmtViews = function (n) {
    if (!n) return '0';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(n);
  };

  // ── Saved posts state ────────────────────────────────────────────────────
  let savedSet = new Set();
  window.refreshSavedSet = async function () {
    if (!window.API || !window.API.token()) { savedSet = new Set(); return savedSet; }
    try {
      const { posts } = await window.API.get('/api/posts/saved');
      savedSet = new Set(posts.map((p) => String(p._id)));
    } catch (_) { savedSet = new Set(); }
    return savedSet;
  };
  window.isSaved = function (id) { return savedSet.has(String(id)); };

  window.saveBtnHtml = function (postId) {
    const saved = window.isSaved(postId);
    return '<button class="btn btn-sm card-action" data-save="' + postId + '" title="' + (saved ? 'Saved' : 'Save') + '">' + (saved ? '🔖' : '🤍') + '</button>';
  };
  window.shareBtnHtml = function (postId) {
    return '<button class="btn btn-sm card-action" data-share="' + postId + '" title="Share">🔗</button>';
  };

  // ── Wire card action buttons inside a container ─────────────────────────
  window.wireCardActions = function (container) {
    if (!container) return;
    container.querySelectorAll('[data-save]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault(); e.stopPropagation();
        const id = btn.dataset.save;
        if (!window.API.token()) {
          location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
          return;
        }
        try {
          if (window.isSaved(id)) {
            await window.API.del('/api/posts/' + id + '/save');
            savedSet.delete(id); btn.textContent = '🤍'; btn.title = 'Save';
          } else {
            await window.API.post('/api/posts/' + id + '/save');
            savedSet.add(id); btn.textContent = '🔖'; btn.title = 'Saved';
            window.toast('Saved', 'success');
          }
        } catch (err) { window.toast(err.message, 'error'); }
      });
    });
    container.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const id = btn.dataset.share;
        const url = location.origin + '/post.html?id=' + id;
        if (navigator.share) { navigator.share({ url }).catch(() => {}); return; }
        navigator.clipboard.writeText(url)
          .then(() => window.toast('Link copied', 'success'))
          .catch(() => window.prompt('Copy this link:', url));
      });
    });
  };

  // ── Global report modal ─────────────────────────────────────────────────
  let reportTarget = {};
  window.ensureReportModal = function () {
    if (document.getElementById('reportModal')) return;
    const div = document.createElement('div');
    div.className = 'modal-backdrop';
    div.id = 'reportModal';
    div.innerHTML = `<div class="modal">
      <h2>Report</h2>
      <p class="muted" id="reportHelp"></p>
      <form id="reportForm">
        <div class="form-row"><label>Reason</label>
          <select name="reason">
            <option>Scam or fraud</option>
            <option>Spam or duplicate</option>
            <option>Inappropriate content</option>
            <option>Misleading information</option>
            <option>Other</option>
          </select>
        </div>
        <div class="form-row"><label>Details (optional)</label>
          <textarea name="detail" placeholder="Add any details…"></textarea>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn" id="reportCancel">Cancel</button>
          <button type="submit" class="btn btn-danger">Submit report</button>
        </div>
      </form>
    </div>`;
    document.body.appendChild(div);
    document.getElementById('reportCancel').addEventListener('click', () => div.classList.remove('show'));
    document.getElementById('reportForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const reason = fd.get('reason') + (fd.get('detail') ? ' — ' + fd.get('detail') : '');
      const submitBtn = e.target.querySelector('button[type=submit]');
      submitBtn.disabled = true;
      try {
        await window.API.post('/api/reports', { targetType: reportTarget.type, targetId: reportTarget.id, reason });
        window.toast('Report submitted. Thanks!', 'success');
        div.classList.remove('show');
      } catch (err) {
        window.toast(err.message, 'error');
      } finally { submitBtn.disabled = false; }
    });
  };
  window.openReportModal = function (targetType, targetId, name) {
    if (!window.API.token()) {
      location.href = 'login.html?next=' + encodeURIComponent(location.pathname + location.search);
      return;
    }
    window.ensureReportModal();
    reportTarget = { type: targetType, id: targetId };
    document.getElementById('reportHelp').textContent = 'Reporting ' + (name || targetType) + '. Our admins will review it.';
    document.getElementById('reportModal').classList.add('show');
  };

  // ── Block / unblock a user ───────────────────────────────────────────────
  window.toggleBlock = async function (userId, btn) {
    if (!window.API.token()) return;
    try {
      const { blocked } = await window.API.post('/api/users/me/block/' + userId);
      if (btn) { btn.textContent = blocked ? 'Unblock user' : 'Block user'; }
      window.toast(blocked ? 'User blocked' : 'User unblocked', 'success');
    } catch (err) { window.toast(err.message, 'error'); }
  };
})();
