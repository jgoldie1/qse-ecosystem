function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.body[f]);
    if (missing.length) {
      return res.status(400).json({ ok: false, message: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireFields };
