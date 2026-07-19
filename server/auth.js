const bcrypt = require('bcryptjs');

// Admin giriş kontrolü
function checkAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  if (req.xhr || req.path.startsWith('/api/')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return res.redirect('/admin/login');
}

// Admin login handler
async function login(username, password) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'EvvalAdmin2026';

  if (username !== adminUser) return false;

  // For simplicity with env var, use direct comparison
  // In production, use bcrypt.compare with a hashed password
  return password === adminPass;
}

module.exports = { checkAuth, login };
