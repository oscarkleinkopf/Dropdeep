# DropDeep

**DropDeep** is a dropshipping and marketing intelligence hub. Search products to generate deep research reports (demographics, copy angles, UGC scripts, ad copy, and more), manage a saved portfolio, generate zero-token prompt sequences for external chatbots, and run competitive intelligence tools — all from a single PWA.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Vite will start the dev server and open the app in your browser.

### Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

The site deploys automatically from the `master` branch via GitHub Actions to:

**https://oscarkleinkopf.github.io/Dropdeep/**

To enable deployment, set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** in the repository on GitHub.

## Gemini API key (Deep Research)

Features that call Google Gemini (live deep research, competitor scans with AI) need an API key:

1. Get a key from [Google AI Studio](https://aistudio.google.com/apikey).
2. In the app, click the **Settings** (gear) icon in the header.
3. Paste your **Gemini API Key**, choose model/language, and save.

Your key is stored **only in your browser** (`localStorage`). Requests go directly from your device to Google's API.

> **Prompt Hub** and some spy/meta tools work without an API key — they generate copy-paste prompts or use local/static data.

## Project structure

| Path | Purpose |
|------|---------|
| `index.html` | App shell and views |
| `src/main.js` | Entry point |
| `src/events.js` | UI event wiring |
| `src/research/` | Gemini integration, caching, research flow |
| `src/ui/` | Views: feed, report, portfolio, prompt hub, spy |
| `public/` | PWA manifest, service worker, icons |

## PWA icons

Icons are generated from an inline SVG (brand shield + DropDeep wordmark):

```bash
npm run icons
```

Outputs optimized `public/icon-192.png` and `public/icon-512.png`.

## Tech stack

- [Vite](https://vitejs.dev/) — dev server and build
- [@google/generative-ai](https://www.npmjs.com/package/@google/generative-ai) — Gemini client
- [Chart.js](https://www.chartjs.org/) & [Lucide](https://lucide.dev/) — charts and icons (CDN)
