const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ ok: false, message: 'Missing token' });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, message: 'Invalid token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ ok: false, message: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
