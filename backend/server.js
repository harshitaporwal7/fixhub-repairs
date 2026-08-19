const env = require('./config/env');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const brandRoutes = require('./routes/brands');
const modelRoutes = require('./routes/models');
const repairRoutes = require('./routes/repairs');
const bookingRoutes = require('./routes/bookings');
const locationRoutes = require('./routes/locations');
const reviewRoutes = require('./routes/reviews');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');

const app = express();

const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan(env.isProd ? 'combined' : 'dev'));

// Rate-limit sensitive auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many messages sent. Please try again later.' },
});
app.use('/api/contact', contactLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FixHub Repairs API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`FixHub Repairs API listening on port ${env.PORT}`);
  });
});

module.exports = app;
