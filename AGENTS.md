# AGENTS.md

## Cursor Cloud specific instructions

### Where the code lives (important)
- The full **DropDeep** application lives on the **`master`** branch. The default `main` branch contains only a stub `README.md`. If you check out `main` you will see no app code, no `package.json`, and `npm install` will do nothing. Base feature work on `master` (or a branch cut from it). CI (`.github/workflows/deploy-pages.yml`) deploys GitHub Pages from `master`.

### Stack & tooling
- Vanilla-JS SPA (ES modules, no framework) built and served with **Vite 5**. Package manager is **npm** (`package-lock.json`); use **Node 22** to match CI.
- There is **no lint and no test** setup — `package.json` only defines `dev`, `build`, `preview`, and `icons`. Don't invent a test/lint command; "verification" means building and running the app.

### Running the app (dev)
- `npm run dev` starts Vite on port 3000. The site is served under the base path `/Dropdeep/`, so open **http://localhost:3000/Dropdeep/** — hitting `http://localhost:3000/` (no `/Dropdeep/`) will not load the app.
- The app runs fully in **demo mode with no backend**. Supabase and Gemini are optional:
  - Supabase auth/cloud-sync only activate when `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are set (see `.env.example`); otherwise the app shows a "demo mode" banner and works local-only (portfolio persists in `localStorage`).
  - Gemini "Deep Research" needs either a user-pasted BYOK key (entered in the in-app Settings gear, stored in `localStorage`) or the optional Supabase `gemini-proxy` edge function. Core features (Prompt Hub, manual evaluation, local portfolio, exports) need neither.
- Good no-backend smoke test: Inicio → "Evaluar producto" → fill the manual-evaluation sliders → "Guardar en portafolio" → open the "Portafolio" tab and confirm the product card is saved.

### Build
- `npm run build` outputs to `dist/`; `npm run preview` serves the built output. `npm run icons` regenerates PWA icons via `sharp`.
