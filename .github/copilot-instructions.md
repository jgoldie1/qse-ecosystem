# Copilot Instructions for QSE Ecosystem

## Project Overview

QSE Ecosystem is a unified Node.js/Express platform hosting two sub-applications:

- **Sculptify** – A beauty, wellness, and training platform
- **March & Lewis** – A career staffing and workforce platform

The backend exposes a shared REST API, and each sub-app has both a React app (`apps/<name>-app/`) and a served static web frontend (`apps/<name>-web/public/`). The ecosystem also includes Solidity smart contracts for its token economy.

## Repository Structure

```
server.js                  # Express entry point, mounts all routes
routes/                    # Express route handlers (one file per feature)
core/                      # Business logic engines (wallet, rewards, AI, etc.)
apps/
  sculptify-app/App.js     # React app for Sculptify
  sculptify-web/public/    # Static files served at /sculptify
  march-lewis-app/App.js   # React app for March & Lewis
  march-lewis-web/public/  # Static files served at /march-lewis
blockchain/                # Solidity smart contracts (.sol)
data/                      # JSON data files (tasks, rewards, memberships, analytics)
package.json
```

## Tech Stack

- **Runtime:** Node.js with Express (CommonJS modules)
- **Frontend apps:** React (ES modules / JSX, in `apps/`)
- **Smart contracts:** Solidity ^0.8.20
- **Token currency:** ASH (AshCoin) — in-app token used for rewards, training, marketplace, governance
- **Data storage:** JSON flat files in `data/` (no database)

## Running the Server

```bash
npm install
npm start        # starts server on port 5000 (default)
npm run dev      # same as start
```

Server runs at `http://localhost:5000`. The `PORT` environment variable overrides the default.

## API Routes

All API routes are prefixed with `/api/`:

| Mount path             | File                      | Description                     |
|------------------------|---------------------------|---------------------------------|
| `/api/health`          | `routes/health.js`        | Health check                    |
| `/api/ai`              | `routes/ai.js`            | AI coach endpoints               |
| `/api/tasks`           | `routes/tasks.js`         | Task management                  |
| `/api/training`        | `routes/training.js`      | Training courses                 |
| `/api/wallets`         | `routes/wallets.js`       | ASH wallet balances & transfers  |
| `/api/streaming`       | `routes/streaming.js`     | Streaming content                |
| `/api/rewards`         | `routes/rewards.js`       | Reward issuance & lookup         |
| `/api/memberships`     | `routes/memberships.js`   | Membership management            |

Each route file exports an Express `Router`. Business logic lives in `core/`, not in route handlers.

## Coding Conventions

- **CommonJS** (`require`/`module.exports`) for all backend files (`server.js`, `routes/`, `core/`).
- **ES module syntax** (`import`/`export default`) for React app files in `apps/`.
- Route files are thin: they delegate to engine modules in `core/`.
- Engine modules in `core/` manage in-memory state or read/write JSON files in `data/`.
- App context values are `'sculptify'` or `'marchLewis'` — use these consistently when filtering or tagging data.
- Dark theme UI: background `#0a0a0a`, cards `#1a1a1a`, borders `#333`. Sculptify accent is `#a855f7` (purple); March & Lewis accent is `#3b82f6` (blue).

## Smart Contracts

Located in `blockchain/`. All contracts use Solidity ^0.8.20 and the MIT license.

- **AshCoin (ASH)** – Primary utility token; max supply 1 billion. Extends `ParentCurrency`.
- **ParentCurrency** – Base ERC-20-like contract.
- **LegacyCryptocurrency / LegacyKid** – Legacy token contracts.
- **EcosystemTreasury** – Manages ecosystem funds.
- **OmniExchange** – Token exchange logic.
- **AllAmericanMarketplaceWallet** – Marketplace wallet.
- **ReentrancyGuard** – Security utility for contracts.

When modifying contracts, preserve the `onlyOwner` guard on minting functions and ensure supply caps are respected.

## Data Files

JSON files in `data/` serve as the lightweight data store:

- `analytics.json` – Per-app event counters (`sculptify`, `marchLewis` keys)
- `tasks.json` – Task records
- `rewards.json` – Issued rewards
- `memberships.json` – Membership records

Always use the helpers in `core/qse-core.js` (`loadAnalytics`, `saveAnalytics`) when reading or writing `analytics.json`.

## Key Patterns

- **Wallet operations** go through `core/wallet-engine.js` (`getWallet`, `earn`, `transfer`).
- **Reward logic** goes through `core/rewards-engine.js`.
- **AI coach** responses are handled by `core/ai-coach.js`.
- New features should follow the existing route + engine pattern: add a route file in `routes/`, add an engine in `core/`, and mount the route in `server.js`.
