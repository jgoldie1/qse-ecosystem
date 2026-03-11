const multer = require('multer');
const path = require('path');
const fs = require('fs');

const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(targetFolder) {
  ensureDir(targetFolder);

  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, targetFolder),
    filename: (_req, file, cb) => {
      const stamp = Date.now();
      const ext = path.extname(file.originalname).replace(/[^a-zA-Z0-9]/g, '');
      const base = path.basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 64);
      cb(null, `${stamp}_${base}${ext ? '.' + ext : ''}`);
    }
  });
}

function makeUploader(targetFolder) {
  return multer({
    storage: makeStorage(targetFolder),
    limits: { fileSize: MAX_UPLOAD_SIZE_BYTES }
  });
}

module.exports = { makeUploader };
