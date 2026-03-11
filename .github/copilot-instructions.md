# QSE Ecosystem — Copilot Instructions

## About this repository
This is the QSE Ecosystem monorepo. It contains:
- `server/index.js` — Express server entry point, runs on port **5000**
- `server/routes/` — API route handlers (auth, sculptify, march-lewis)
- `server/services/` — Business logic (authService, sculptifyService, marchLewisService)
- `server/middleware/` — Auth (JWT) and validation middleware
- `apps/sculptify-web/` — Sculptify Ltd static web app
- `apps/march-lewis-web/` — March & Lewis static web app
- `core/` — Shared engines (marketplace, wallet, streaming, rewards, etc.)
- `routes/` — Legacy top-level route stubs
- `scripts/` — Utility scripts for Codespaces and dev workflow

## Key URLs (when running)
- `http://localhost:5000` — landing/home
- `http://localhost:5000/api/health` — health check (returns `{"ok":true}`)
- `http://localhost:5000/sculptify` — Sculptify web app
- `http://localhost:5000/march-lewis` — March & Lewis web app
- `http://localhost:5000/api/auth/register` — user registration
- `http://localhost:5000/api/auth/login` — user login

## How to run
```bash
npm install
npm run dev
```

## Technology stack
- **Runtime**: Node.js 22 (LTS)
- **Framework**: Express 4
- **Database**: SQLite3 via `sqlite3` package
- **Auth**: JWT via `jsonwebtoken`, passwords hashed with `bcryptjs`
- **File uploads**: `multer`
- **Dev server**: `nodemon`

## Coding conventions
- Use `require`/`module.exports` (CommonJS)
- Keep route handlers thin; business logic belongs in `server/services/`
- Always return `{ ok: true, ... }` on success and `{ ok: false, message: '...' }` on errors
- Do not remove or rename existing routes; only extend them
- Use `process.env.PORT || 5000` for the server port
- Database path: `server/data/qse.db`
