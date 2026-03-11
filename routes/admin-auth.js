const authRouter = require('./auth');

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!authRouter.verifyToken(token)) {
    return res.status(401).json({ ok: false, message: 'Unauthorized' });
  }
  next();
}

module.exports = requireAdmin;
