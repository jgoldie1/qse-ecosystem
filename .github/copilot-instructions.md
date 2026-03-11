# Copilot Instructions for QSE Ecosystem

## Project Overview

QSE Ecosystem is a Node.js/Express monorepo that powers two primary business apps — **Sculptify Ltd** (fitness/training) and **March and Lewis** (service marketplace) — along with a shared QSE Core layer providing AI coaching, wallet/payments, training, streaming, rewards, memberships, and marketplace connectors.

## Repository Structure

```
.devcontainer/       – GitHub Codespaces configuration
.github/             – Workflows and Copilot instructions
apps/
  sculptify-app/     – React Native mobile app for Sculptify
  sculptify-web/     – Static HTML/JS/CSS web app for Sculptify
  march-lewis-web/   – Static HTML/JS/CSS web app for March and Lewis
blockchain/          – Solidity smart contracts (AshCoin, OmniExchange, etc.)
core/                – Shared engine modules (rewards, wallet, training, AI, etc.)
data/                – JSON seed data and SQLite DB
docs/                – Architecture and roadmap docs
routes/              – Legacy top-level routes (prefer server/routes/)
scripts/             – Utility scripts
server/
  index.js           – Express app entry point (port 5000)
  middleware/        – auth.js (JWT), validate.js
  routes/            – auth.js, sculptify.js, marchLewis.js
  services/          – authService.js, sculptifyService.js, marchLewisService.js
  data/              – SQLite database file
```

## Tech Stack

- **Runtime**: Node.js 20, Express 4
- **Database**: SQLite via `sqlite3`
- **Auth**: JWT (`jsonwebtoken`) + bcrypt (`bcryptjs`)
- **File uploads**: `multer`
- **Dev server**: `nodemon`
- **Mobile**: React Native (Expo)
- **Smart contracts**: Solidity

## Coding Conventions

- Use CommonJS (`require`/`module.exports`) throughout — this is not an ES module project.
- Async service functions use `async/await` and return plain objects; route handlers pass errors to `next(err)`.
- All API routes live under `/api/<service>` (e.g. `/api/auth`, `/api/sculptify`, `/api/march-lewis`).
- Protected routes use the `requireAuth` middleware from `server/middleware/auth.js`.
- Database operations go in `server/services/` — never put raw SQL in route files.
- SQLite database is stored at `server/data/qse.db`.
- Environment variables are read from `.env` (see `.env.example`). Use `process.env.VAR || 'default'` for optional vars.
- Static web apps are served from `apps/<app-name>/public/` as plain HTML/CSS/JS — no bundler.

## Running the Project

```bash
npm install
npm run dev   # starts nodemon on port 5000
```

Endpoints:
- `http://localhost:5000/health` — health check
- `http://localhost:5000/sculptify` — Sculptify web app
- `http://localhost:5000/march-lewis` — March and Lewis web app
- `http://localhost:5000/api/auth` — auth endpoints (register, login, me)

## GitHub Codespaces

The `.devcontainer/devcontainer.json` configures a ready-to-code Codespace:
- Base image: `mcr.microsoft.com/devcontainers/javascript-node:0-20`
- Port 5000 forwarded automatically
- `npm install` runs on container creation

## Adding New Features

1. **New API route**: Create `server/routes/<name>.js`, a matching `server/services/<name>Service.js`, and mount it in `server/index.js` with `app.use('/api/<name>', require('./routes/<name>'))`.
2. **Protected endpoint**: Import `requireAuth` from `../middleware/auth` and add it as middleware.
3. **New DB table**: Add an `init()` function in the service file and call it in `server/index.js` at startup.
4. **New web page**: Add the HTML file under `apps/<app>/public/pages/` and link from `index.html`.

## Testing

Currently there is no automated test suite. When adding tests, use the `node:test` built-in module or Jest, and place test files alongside the module they test with a `.test.js` suffix.

## Security Notes

- Never commit real secrets. Use environment variables and `.env` (which is gitignored).
- `JWT_SECRET` must be set to a strong random value in production.
- All user passwords are hashed with bcrypt (cost factor 10).
