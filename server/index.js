require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Session yapılandırması
app.use(session({
  secret: process.env.SESSION_SECRET || 'evval-otel-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 saat
  }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// EJS view engine
app.set('view engine', 'ejs');
app.set('views', [
  path.join(__dirname, '..', 'views'),
  path.join(__dirname, '..', 'admin')
]);

// Veri dosyası okuma yardımcısı
function readData(filename) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeData(filename, data) {
  const filePath = path.join(__dirname, 'data', `${filename}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Veriyi tüm route'lara ekle
app.use((req, res, next) => {
  res.locals.readData = readData;
  res.locals.lang = req.query.lang || 'tr';
  next();
});

// ========== HOTEL SITE ROUTES ==========

// Ana Sayfa
app.get('/', (req, res) => {
  const lang = req.query.lang || 'tr';
  const content = readData('content');
  const rooms = readData('rooms');
  const reviews = readData('reviews');
  const settings = readData('settings');
  const gallery = readData('gallery');
  
  res.render('pages/index', {
    lang,
    content: content.home || {},
    rooms,
    reviews: reviews.filter(r => r.approved && r.featured),
    settings,
    gallery: gallery.slice(0, 5),
    page: 'home'
  });
});

// Hakkımızda
app.get('/hakkimizda', (req, res) => {
  const lang = req.query.lang || 'tr';
  const content = readData('content');
  res.render('pages/hakkimizda', {
    lang,
    content: content.about || {},
    page: 'about'
  });
});

// Odalar
app.get('/odalar', (req, res) => {
  const lang = req.query.lang || 'tr';
  const rooms = readData('rooms');
  res.render('pages/odalar', { lang, rooms, page: 'rooms' });
});

// Restoran
app.get('/restoran', (req, res) => {
  const lang = req.query.lang || 'tr';
  const menu = readData('menu');
  res.render('pages/restoran', { lang, menu, page: 'restaurant' });
});

// Spa
app.get('/spa', (req, res) => {
  const lang = req.query.lang || 'tr';
  res.render('pages/spa', { lang, page: 'spa' });
});

// Havuz
app.get('/havuz', (req, res) => {
  const lang = req.query.lang || 'tr';
  res.render('pages/havuz', { lang, page: 'pool' });
});

// Galeri
app.get('/galeri', (req, res) => {
  const lang = req.query.lang || 'tr';
  const gallery = readData('gallery');
  res.render('pages/galeri', { lang, gallery, page: 'gallery' });
});

// Hizmetler
app.get('/hizmetler', (req, res) => {
  const lang = req.query.lang || 'tr';
  res.render('pages/hizmetler', { lang, page: 'services' });
});

// Yorumlar
app.get('/yorumlar', (req, res) => {
  const lang = req.query.lang || 'tr';
  const reviews = readData('reviews');
  res.render('pages/yorumlar', { lang, reviews, page: 'reviews' });
});

// SSS
app.get('/sss', (req, res) => {
  const lang = req.query.lang || 'tr';
  res.render('pages/sss', { lang, page: 'faq' });
});

// İletişim
app.get('/iletisim', (req, res) => {
  const lang = req.query.lang || 'tr';
  const settings = readData('settings');
  res.render('pages/iletisim', { lang, settings, page: 'contact' });
});

// Online Rezervasyon
app.get('/rezervasyon', (req, res) => {
  const lang = req.query.lang || 'tr';
  const rooms = readData('rooms');
  res.render('pages/rezervasyon', { lang, rooms, page: 'booking' });
});

// ========== API ROUTES ==========

// Auth API
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const { login } = require('./auth');
  const success = await login(username, password);
  if (success) {
    req.session.authenticated = true;
    req.session.username = username;
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, error: 'Geçersiz kullanıcı adı veya şifre' });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// Content API
app.get('/api/content/:page', (req, res) => {
  const { checkAuth } = require('./auth');
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const content = readData('content');
  res.json(content[req.params.page] || {});
});

app.put('/api/content/:page', (req, res) => {
  const { checkAuth } = require('./auth');
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const content = readData('content');
  content[req.params.page] = req.body;
  writeData('content', content);
  res.json({ success: true });
});

// Settings API
app.get('/api/settings', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('settings'));
});

app.put('/api/settings', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  writeData('settings', req.body);
  res.json({ success: true });
});

// Rooms API
app.get('/api/rooms', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('rooms'));
});

app.post('/api/rooms', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const rooms = readData('rooms');
  const { v4: uuidv4 } = require('uuid');
  const newRoom = { id: Date.now(), ...req.body };
  rooms.push(newRoom);
  writeData('rooms', rooms);
  res.json({ success: true, room: newRoom });
});

app.put('/api/rooms/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const rooms = readData('rooms');
  const idx = rooms.findIndex(r => r.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  rooms[idx] = { ...rooms[idx], ...req.body };
  writeData('rooms', rooms);
  res.json({ success: true });
});

app.delete('/api/rooms/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  let rooms = readData('rooms');
  rooms = rooms.filter(r => r.id != req.params.id);
  writeData('rooms', rooms);
  res.json({ success: true });
});

// Menu API
app.get('/api/menu', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('menu'));
});

app.post('/api/menu', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const menu = readData('menu');
  const item = { id: Date.now(), ...req.body };
  menu.push(item);
  writeData('menu', menu);
  res.json({ success: true, item });
});

app.put('/api/menu/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const menu = readData('menu');
  const idx = menu.findIndex(m => m.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  menu[idx] = { ...menu[idx], ...req.body };
  writeData('menu', menu);
  res.json({ success: true });
});

app.delete('/api/menu/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  let menu = readData('menu');
  menu = menu.filter(m => m.id != req.params.id);
  writeData('menu', menu);
  res.json({ success: true });
});

// Reviews API
app.get('/api/reviews', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('reviews'));
});

app.post('/api/reviews', (req, res) => {
  const reviews = readData('reviews');
  const review = { id: Date.now(), ...req.body, approved: false, featured: false };
  reviews.push(review);
  writeData('reviews', reviews);
  res.json({ success: true });
});

app.put('/api/reviews/:id/approve', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const reviews = readData('reviews');
  const idx = reviews.findIndex(r => r.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  reviews[idx].approved = !reviews[idx].approved;
  writeData('reviews', reviews);
  res.json({ success: true });
});

app.delete('/api/reviews/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  let reviews = readData('reviews');
  reviews = reviews.filter(r => r.id != req.params.id);
  writeData('reviews', reviews);
  res.json({ success: true });
});

// Gallery API
app.get('/api/gallery', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('gallery'));
});

app.post('/api/gallery', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const gallery = readData('gallery');
  const item = { id: Date.now(), ...req.body };
  gallery.push(item);
  writeData('gallery', gallery);
  res.json({ success: true });
});

app.delete('/api/gallery/:id', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  let gallery = readData('gallery');
  gallery = gallery.filter(g => g.id != req.params.id);
  writeData('gallery', gallery);
  res.json({ success: true });
});

// Upload API
const multer = require('multer');
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'public', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.warn('Uploads dizini oluşturulamadı (Vercel read-only):', e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları (JPEG, PNG, WebP, GIF) yüklenebilir.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

app.post('/api/upload', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'Dosya seçilmedi' });
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${req.file.filename}`
    });
  });
});

app.delete('/api/upload/:filename', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const filePath = path.join(uploadDir, req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Dosya bulunamadı' });
  }
});

// Uploaded files list
app.get('/api/uploads', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  const files = fs.readdirSync(uploadDir).map(f => ({
    filename: f,
    url: `/uploads/${f}`,
    size: fs.statSync(path.join(uploadDir, f)).size
  }));
  res.json(files);
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  // In production: send email
  res.json({ success: true, message: 'Mesajınız alınmıştır. En kısa sürede size dönüş yapacağız.' });
});

// Reservation
app.post('/api/reservation', (req, res) => {
  const reservations = readData('reservations');
  const reservation = { id: Date.now(), ...req.body, createdAt: new Date().toISOString() };
  reservations.push(reservation);
  writeData('reservations', reservations);
  res.json({ success: true, message: 'Rezervasyon talebiniz alınmıştır. En kısa sürede teyit edeceğiz.' });
});

app.get('/api/reservations', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Unauthorized' });
  res.json(readData('reservations'));
});

// ========== ADMIN ROUTES ==========
const { checkAuth } = require('./auth');

app.get('/admin/login', (req, res) => {
  if (req.session.authenticated) return res.redirect('/admin/dashboard');
  res.render('login', { error: null });
});

app.get('/admin/dashboard', checkAuth, (req, res) => {
  const rooms = readData('rooms');
  const reviews = readData('reviews');
  const reservations = readData('reservations');
  res.render('dashboard', { 
    page: 'dashboard',
    roomsCount: rooms.length,
    reviewsCount: reviews.length,
    pendingReviews: reviews.filter(r => !r.approved).length,
    reservationsCount: reservations.length,
    recentReservations: reservations.slice(-5).reverse()
  });
});

app.get('/admin/pages', checkAuth, (req, res) => {
  const content = readData('content');
  res.render('pages-admin', { page: 'pages', content });
});

app.get('/admin/rooms', checkAuth, (req, res) => {
  const rooms = readData('rooms');
  res.render('rooms-admin', { page: 'rooms', rooms });
});

app.get('/admin/menu', checkAuth, (req, res) => {
  const menu = readData('menu');
  res.render('menu-admin', { page: 'menu', menu });
});

app.get('/admin/gallery', checkAuth, (req, res) => {
  const gallery = readData('gallery');
  const uploads = fs.readdirSync(uploadDir).map(f => ({
    filename: f,
    url: `/uploads/${f}`
  }));
  res.render('gallery-admin', { page: 'gallery', gallery, uploads });
});

app.get('/admin/reviews', checkAuth, (req, res) => {
  const reviews = readData('reviews');
  res.render('reviews-admin', { page: 'reviews', reviews });
});

app.get('/admin/reservations', checkAuth, (req, res) => {
  const reservations = readData('reservations');
  res.render('reservations-admin', { page: 'reservations', reservations });
});

app.get('/admin/settings', checkAuth, (req, res) => {
  const settings = readData('settings');
  res.render('settings-admin', { page: 'settings', settings });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Bir hata oluştu');
});

// ========== START SERVER ==========
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`\n  ✦ Evval Otel Sunucusu Başlatıldı ✦`);
    console.log(`  ─────────────────────────────`);
    console.log(`  Site:   http://localhost:${PORT}`);
    console.log(`  Admin:  http://localhost:${PORT}/admin/login`);
    console.log(`  Şifre:  ${process.env.ADMIN_PASSWORD || 'EvvalAdmin2026'}`);
    console.log(`  ─────────────────────────────\n`);
  });
}

// Vercel serverless export
module.exports = app;
