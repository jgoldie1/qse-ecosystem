# Copilot Instructions for QSE Ecosystem

## Project Overview

QSE Ecosystem is a Node.js/Express monolithic server that powers multiple sub-products:
- **Sculptify Ltd** – fitness/training app
- **March and Lewis** – separate business tenant
- **AI Coach** – coaching module
- **Wallet/Payments**, **Training**, **Streaming**, **Rewards**, **Memberships**, **Marketplace connectors**

The server entry point is `server/index.js` and it runs on **port 5000** by default.

## Repository Structure

```
server/
  index.js          – Express app entry point; mounts all routes
  middleware/       – Shared middleware (auth.js uses JWT)
  routes/           – Route handlers grouped by feature/tenant
  services/         – Business logic and DB access (SQLite via sqlite3)
  data/             – SQLite database files (gitignored)
apps/               – Front-end micro-apps (static HTML/JS)
scripts/            – Utility shell scripts for dev/ops tasks
.devcontainer/      – GitHub Codespaces configuration
blockchain/         – Blockchain-related modules
core/               – Shared core utilities
```

## Coding Conventions

- **Runtime**: Node.js 20, CommonJS (`require`/`module.exports`), no TypeScript.
- **Framework**: Express 4. Mount new routes in `server/index.js` under `/api/<feature>`.
- **Database**: SQLite via `sqlite3`. Use promise wrappers (`run`, `get`, `all`) as seen in `server/services/`.
- **Auth**: JWT-based. Use `server/middleware/auth.js` (`requireAuth`) to protect endpoints.
- **Environment**: Variables loaded from `.env` (see `.env.example`). Never hard-code secrets.
- **Error handling**: Route handlers use `try/catch` and forward errors to `next(err)`.
- **Style**: 2-space indentation, single quotes, semicolons.

## Key Files

| File | Purpose |
|------|---------|
| `server/index.js` | App bootstrap; route mounting |
| `server/middleware/auth.js` | JWT auth helpers |
| `server/services/authService.js` | User registration/login (SQLite) |
| `server/routes/auth.js` | `/api/auth` endpoints |
| `.devcontainer/devcontainer.json` | Codespace container config |
| `package.json` | Dependencies and npm scripts |
| `.env.example` | Required environment variables |

## Common Tasks

- **Add a new route**: create `server/routes/<name>.js`, then mount it in `server/index.js`.
- **Add a new service**: create `server/services/<name>Service.js` following existing service patterns.
- **Run locally**: `npm install && npm run dev` — server starts on `http://localhost:5000`.
- **Health check**: `GET /api/health` returns `{ ok: true }`.

## Do Not

- Do not commit `.env` files or SQLite `.db` files.
- Do not switch to ESM (`import/export`) without updating all files.
- Do not introduce new frameworks or ORMs without discussing in an issue first.
