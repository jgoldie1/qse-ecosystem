function requireFields(fields = []) {
  return function(req, res, next) {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length) {
      return res.status(400).json({
        ok: false,
        message: 'Missing required fields',
        missing
      });
    }

    next();
  };
}

module.exports = {
  requireFields
};
