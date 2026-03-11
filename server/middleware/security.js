const helmet = require('helmet');
const cors = require('cors');

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  }
});

const corsMiddleware = cors({
  origin: function (origin, callback) {
    // In production with an allow-list, require the origin to be explicitly listed.
    // Undefined origin (same-origin or non-browser requests) is only allowed in
    // development or when no allow-list has been configured.
    if (IS_PRODUCTION && ALLOWED_ORIGINS.length) {
      if (origin && ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    }
    // Development / no allow-list: permit everything (including same-origin).
    if (!ALLOWED_ORIGINS.length || !origin || ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
});

module.exports = { helmetMiddleware, corsMiddleware };
