function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((f) => {
      const val = req.body[f];
      return val === undefined || val === null || String(val).trim() === '';
    });
    if (missing.length > 0) {
      return res.status(400).json({ ok: false, error: `Missing required fields: ${missing.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireFields };
