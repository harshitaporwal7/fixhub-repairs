const path = require('path');
const dotenvResult = require('dotenv').config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/fixhub_repairs';
const DEFAULT_JWT_SECRET = 'dev-only-insecure-secret-change-me-before-deploying';

if (dotenvResult.error) {
  console.warn('----------------------------------------------------------------');
  console.warn('No .env file was found — dotenv could not load one.');
  console.warn(`Looked in: ${path.resolve(process.cwd(), '.env')}`);
  console.warn('Falling back to built-in development defaults where possible.');
  console.warn('Copy backend/.env.example to backend/.env to customize these,');
  console.warn('or to configure a remote MongoDB Atlas connection string.');
  console.warn('----------------------------------------------------------------');
}

function requireInProd(name, value) {
  if (!value && isProd) {
    console.error(`Missing required environment variable: ${name}`);
    console.error(`Set it in backend/.env (see backend/.env.example) before running in production.`);
    process.exit(1);
  }
}

let MONGODB_URI = process.env.MONGODB_URI;
requireInProd('MONGODB_URI', MONGODB_URI);
if (!MONGODB_URI) {
  MONGODB_URI = DEFAULT_MONGODB_URI;
  console.warn(`MONGODB_URI not set — defaulting to ${DEFAULT_MONGODB_URI} (development only, requires MongoDB running locally).`);
}

let JWT_SECRET = process.env.JWT_SECRET;
requireInProd('JWT_SECRET', JWT_SECRET);
if (!JWT_SECRET) {
  JWT_SECRET = DEFAULT_JWT_SECRET;
  console.warn('JWT_SECRET not set — using an insecure built-in development secret.');
  console.warn('Set a real JWT_SECRET in backend/.env before deploying anywhere real users can reach.');
}

module.exports = {
  NODE_ENV,
  isProd,
  MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  PORT: process.env.PORT || 5000,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@fixhubrepairs.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@12345',
  ADMIN_NAME: process.env.ADMIN_NAME || 'FixHub Admin',
};
