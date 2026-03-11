#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(pwd)"
FILE="$ROOT/server/index.js"

if [ ! -f "$FILE" ]; then
  echo "server/index.js not found; run from repository root"
  exit 1
fi

node - <<'NODE'
const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'server', 'index.js');
let src = fs.readFileSync(file, 'utf8');

const marker = '/* SPA fallbacks for public apps */';
if (src.includes(marker)) {
  console.log('SPA fallbacks already present');
  process.exit(0);
}

const fallback = `\n// ${marker}\napp.get('/sculptify/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'sculptify-web', 'public', 'index.html')));\napp.get('/march-lewis/*', (_req, res) => res.sendFile(path.join(__dirname, '..', 'apps', 'march-lewis-web', 'public', 'index.html')));\n`;

// Insert fallback after static mounts for sculptify/march-lewis if found, otherwise append before server.listen
const staticPattern = "app.use('/march-lewis', express.static";
if (src.includes(staticPattern)) {
  src = src.replace(staticPattern, staticPattern + "\n" + fallback);
} else {
  // try to insert before app.listen
  src = src.replace(/app.listen\([\s\S]*$/m, (m) => fallback + m);
}

fs.writeFileSync(file, src, 'utf8');
console.log('Applied SPA fallbacks to', file);
process.exit(0);
NODE

echo "Done. Restart your server (or run 'npm run dev') to pick up changes."
