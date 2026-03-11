# Copilot Instructions for QSE Ecosystem

## Project Overview
QSE Ecosystem is a Node.js/Express monorepo that powers two client-facing web apps — **Sculptify** (health & fitness booking) and **March Lewis** — along with shared authentication, a SQLite database, and a file-upload service.

## Repository Structure
```
server/           # Express server entry point and backend logic
  index.js        # App setup, static serving, route mounting
  routes/         # Express routers (sculptify.js, marchLewis.js, auth.js)
  services/       # Business logic & SQLite helpers (sculptifyService.js, marchLewisService.js, authService.js)
  data/           # SQLite database file (qse.db, git-ignored)
  middleware/     # Shared Express middleware
apps/
  sculptify-web/public/   # Sculptify static frontend (vanilla JS SPA)
  march-lewis-web/public/ # March Lewis static frontend (vanilla JS SPA)
.github/
  workflows/node-ci.yml   # CI: install deps + syntax check
.env.example              # Required env vars (PORT, SESSION_SECRET)
```

## Tech Stack
- **Runtime**: Node.js 20
- **Server**: Express 4
- **Database**: SQLite via `sqlite3` package — a single shared file at `server/data/qse.db`
- **Auth**: `bcryptjs` for password hashing; sessions managed server-side
- **File uploads**: `multer`
- **Frontend**: Vanilla JavaScript SPAs (no build step); files served statically from `apps/*/public/`

## Development
```bash
npm install      # install all dependencies
npm run dev      # start dev server with nodemon on http://localhost:5000
npm start        # start production server
```
Accessible routes:
- `http://localhost:5000/sculptify`  → Sculptify web app
- `http://localhost:5000/march-lewis` → March Lewis web app
- `http://localhost:5000/api/sculptify/*` → Sculptify API
- `http://localhost:5000/api/march-lewis/*` → March Lewis API
- `http://localhost:5000/api/auth/*` → Auth API

## Coding Conventions

### Backend
- Use `require`/CommonJS modules throughout (no ESM).
- Each service file exposes an `init()` function that creates SQLite tables if they don't exist; call it from `server/index.js` on startup.
- Database helpers (`run`, `get`, `all`) wrap the `sqlite3` callback API in Promises — reuse this pattern in new services.
- Routes are thin: validate input, call the relevant service, return JSON.
- All API responses use `{ ok: true, ... }` on success and `{ ok: false, message: '...' }` on error.

### Frontend
- Vanilla JS, no framework or bundler.
- CSS form element styling (input, select, textarea) is **scoped under the `.form` class** — elements outside `.form` will appear unstyled.
- Keep app-specific styles in the co-located `styles.css` for each app.

### Environment Variables
- Copy `.env.example` to `.env` and set values before running locally.
- Never commit `.env`; it is listed in `.gitignore`.
- Required variables: `PORT`, `SESSION_SECRET`.

## Testing
There is no automated test framework configured. The CI workflow runs `npm install` and a basic Node.js syntax check. When adding tests, use a framework consistent with the existing Node.js stack (e.g., Jest or Mocha).

## Security Notes
- Passwords are hashed with `bcryptjs` (salt rounds: 10) before storage — never store plain-text passwords.
- Use parameterised queries (the `?` placeholder pattern in `sqlite3`) for all database operations to prevent SQL injection.
- `SESSION_SECRET` must be a strong random value in production; the default `change-me-in-production` is not safe.
