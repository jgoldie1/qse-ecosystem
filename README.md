# QSE Ecosystem
March and lewis and scupitfy ltd

QSE Core powers:
- Sculptify Ltd
- March and Lewis
- AI coach
- wallet/payments
- training
- streaming
- rewards
- memberships
- marketplace connectors

## Run
```bash
npm install
npm run dev
```

## Open
- http://localhost:5000
- http://localhost:5000/api/health
- http://localhost:5000/sculptify
- http://localhost:5000/march-lewis

## GitHub Codespaces Setup

The repo is configured to open cleanly in GitHub Codespaces on port **5000**.

### First-time setup
1. Open the repo in a Codespace — the `postCreateCommand` will run `scripts/post-create.sh` automatically (runs `npm install`).
2. Start the server:
   ```bash
   npm run dev
   ```
3. Open the forwarded port in your browser:
   - App: `http://localhost:5000`
   - Health: `http://localhost:5000/api/health`

### Re-running the prepare script
If you need to re-create the Codespaces/Copilot configuration files, run:
```bash
bash prepare_codespaces_copilot_ready.sh
```
This script is **idempotent** — it will not overwrite existing files unless you pass `--force`:
```bash
bash prepare_codespaces_copilot_ready.sh --force
```

### Dev reset
To kill a stale server process and restart:
```bash
bash scripts/dev-reset.sh
```
# qse-ecosystem
March and lewis and scupitfy ltd
