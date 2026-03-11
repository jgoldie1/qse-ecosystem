function requestMeta(req, _res, next) {
  req.requestMeta = {
    receivedAt: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('user-agent') || 'unknown'
  };
  next();
}

module.exports = requestMeta;
