// ============================================
// EVVAL OTEL — Admin Panel JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {

  // ===== 1. LOGIN FORM =====
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());
      const errorEl = document.getElementById('loginError');

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          window.location.href = '/admin/dashboard';
        } else {
          if (errorEl) {
            errorEl.textContent = 'Geçersiz kullanıcı adı veya şifre';
            errorEl.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorEl) {
          errorEl.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
          errorEl.style.display = 'block';
        }
      }
    });
  }

  // ===== 2. LOGOUT =====
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    });
  }

  // ===== 3. CONTENT EDITOR =====
  const contentForms = document.querySelectorAll('[data-content-form]');
  contentForms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const page = form.dataset.contentForm;
      const formData = new FormData(form);
      const data = {};
      formData.forEach((value, key) => {
        const keys = key.split('.');
        if (keys.length === 3) {
          if (!data[keys[0]]) data[keys[0]] = {};
          if (!data[keys[0]][keys[1]]) data[keys[0]][keys[1]] = {};
          data[keys[0]][keys[1]][keys[2]] = value;
        }
      });

      try {
        const res = await fetch(`/api/content/${page}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          showToast('İçerik başarıyla güncellendi', 'success');
        }
      } catch (err) {
        showToast('Güncelleme başarısız', 'error');
      }
    });
  });

  // ===== 4. SETTINGS FORM =====
  const settingsForm = document.getElementById('settingsForm');
  if (settingsForm) {
    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(settingsForm);
      const data = {};
      formData.forEach((value, key) => {
        const keys = key.split('.');
        if (keys.length === 2) {
          if (!data[keys[0]]) data[keys[0]] = {};
          data[keys[0]][keys[1]] = value;
        } else {
          data[key] = value;
        }
      });

      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
          showToast('Ayarlar güncellendi', 'success');
        }
      } catch (err) {
        showToast('Güncelleme başarısız', 'error');
      }
    });
  }

  // ===== 5. GALLERY UPLOAD =====
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const result = await res.json();
        if (result.success) {
          showToast('Görsel yüklendi', 'success');
          setTimeout(() => location.reload(), 1500);
        }
      } catch (err) {
        showToast('Yükleme başarısız', 'error');
      }
    });
  }

  // ===== 6. DELETE ITEMS =====
  document.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Silmek istediğinize emin misiniz?')) return;
      const { url, type } = btn.dataset;
      try {
        const res = await fetch(url, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          showToast(`${type} silindi`, 'success');
          btn.closest('tr')?.remove();
          btn.closest('.gallery-item')?.remove();
        }
      } catch (err) {
        showToast('Silme başarısız', 'error');
      }
    });
  });

  // ===== 7. APPROVE REVIEWS =====
  document.querySelectorAll('[data-approve]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const url = btn.dataset.approve;
      try {
        const res = await fetch(url, { method: 'PUT' });
        const result = await res.json();
        if (result.success) {
          showToast('Yorum durumu güncellendi', 'success');
          setTimeout(() => location.reload(), 1000);
        }
      } catch (err) {
        showToast('Güncelleme başarısız', 'error');
      }
    });
  });

  // ===== 8. TOAST NOTIFICATION =====
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'admin-toast';
    toast.style.cssText = `
      position: fixed; bottom: 30px; right: 30px;
      padding: 16px 28px;
      background: ${type === 'success' ? '#2C1810' : '#c0392b'};
      color: white;
      font-family: 'Inter', sans-serif;
      font-size: 0.8rem;
      border-radius: 2px;
      z-index: 9999;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.4s ease;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
});
