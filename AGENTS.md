# DropDeep — agent navigation

DropDeep is a dropshipping / marketing intelligence PWA (Vite): Copiloto, Descubrir, portafolio, Spy, Prompt Hub.

## Layout (workspace root)

- `src/` — app modules (UI, research, discovery, auth)
- `docs/` — MANUAL, ROADMAP, PLAN-MEJORAS
- `supabase/` — migrations + Edge Functions
- `tests/`, `e2e/` — Vitest + Playwright
- `scripts/`, `.github/workflows/` — ops / CI
- `index.html`, `package.json`, `vite.config.js`

## Safety

- Never open, print, commit, or transmit `client_secret_*.json` (or `*.pem` / real `.env` files).
- Exclusion: `.gitignore` + `.cursorignore` (`client_secret_*.json`, `*.pem`, `.env` / `.env.*` with `!.env.example`).
- If an OAuth client secret was ever shared, rotate/revoke it in Google Cloud Console (human approval required).

## Commands (from `package.json`)

- `npm test` — unit (Vitest)
- `npm run build` — production build
- `npm run test:e2e` — Playwright
- `npm run dev` — local Vite server

## Validation route

Prefer `npm test` (and `npm run build` when UI/build config changes) before considering a change done. Re-run `/better-harness` after meaningful delivery windows so session evidence can accumulate.

## Agent-asset notes (P4 — decisions)

- Project-scope Rules/Commands/Workflows: keep sparse; do not create assets only to fill inventory counts.
- Third-party plugins/hooks (`qoder-computer-use`, `security-scan`, memory titles): **defer** — confirm intent with owner before enable/disable; no auto-fix from inventory metadata alone.
