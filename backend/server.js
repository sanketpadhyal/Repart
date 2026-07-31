require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./auth/auth');
const analyzeRoutes = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 8080;

const defaultOrigins = [ ""
]; // Your Frontend Origin Here (e.g., 'https://yourfrontend.com')

const envOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.netlify.app') ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('localhost')
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

const defaultLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many scan requests, slow down.' }
});

const accCompareRoutes = require('./comparison/acc-compare');

app.use('/auth', defaultLimiter, authRoutes);
app.use('/api/analyze', analyzeLimiter, analyzeRoutes);
app.use('/api/github', defaultLimiter, require('./routes/github'));
app.use('/api/compare', defaultLimiter, accCompareRoutes);
app.use('/api/extensions', defaultLimiter, require('./routes/extensions'));

app.get('/', (_req, res) => res.status(200).json({ name: 'Repart Backend API', status: 'active', health: '/health' }));
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
  console.error("Global express error:", err);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
