const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'qse-dev-secret-change-in-production';
const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

const ADMIN_SALT = 'qse-admin-salt-v1';

// Seeded admin user (in production this would come from a database with per-user salts)
const ADMIN_USER = {
  id: 'admin-001',
  email: 'admin@qse.local',
  // scrypt hash of "Admin123!" with ADMIN_SALT
  passwordHash: '15f0089d3bfbbcc57890e1940915d5b3caec92cb38e63ba0d86063dbc013199a',
  role: 'admin'
};

function sign(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!payload || payload.exp < Date.now()) return null;
  return payload;
}

function issueToken(user) {
  return sign({ sub: user.id, role: user.role, exp: Date.now() + TOKEN_TTL_MS });
}

function validateCredentials(email, password) {
  if (email !== ADMIN_USER.email) return null;
  const hash = crypto.scryptSync(password, ADMIN_SALT, 32).toString('hex');
  const hashBuf = Buffer.from(hash, 'hex');
  const storedBuf = Buffer.from(ADMIN_USER.passwordHash, 'hex');
  if (hashBuf.length !== storedBuf.length) return null;
  if (!crypto.timingSafeEqual(hashBuf, storedBuf)) return null;
  return { id: ADMIN_USER.id, email: ADMIN_USER.email, role: ADMIN_USER.role };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  const payload = verify(token);
  if (!payload) {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token' });
  }
  req.user = payload;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin, issueToken, validateCredentials };
