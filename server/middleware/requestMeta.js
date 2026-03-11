function requestMeta(req, _res, next) {
  req.requestMeta = {
    ip: req.ip,
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  };
  next();
}

module.exports = requestMeta;
