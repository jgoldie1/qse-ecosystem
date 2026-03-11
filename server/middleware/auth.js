function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.status(401).json({ ok: false, message: 'Authentication required' });
}

function requireRole(roles = []) {
  return function (req, res, next) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ ok: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ ok: false, message: 'Insufficient permissions' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
