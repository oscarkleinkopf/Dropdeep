# Roadmap DropDeep (post-evaluación)

> Fuente: [EVALUACION-PROYECTO.md](EVALUACION-PROYECTO.md) (2026-08-06).  
> Convive con discovery [PLAN §10](PLAN-MEJORAS.md#10-descubrimiento-real-de-productos-t45t50) (T45–T50).  
> Leyenda: ✅ Hecho · 🟡 Parcial · ⬜ No iniciado · ⏸️ Bloqueado (dependencia externa).

---

## Norte del ciclo

1. **Validar** el producto con uso real (dogfooding).
2. **Desbloquear** discovery oficial cuando Portals/App Key estén listos (T45+).
3. **Endurecer** rendimiento, observabilidad y mantenibilidad sin romper la ruta gratis.

No hay fechas de calendario: el orden es de dependencia y riesgo.

---

## Vista rápida

```
Fase A (ahora)     dogfood T51✅ · code-split T52✅ · nota negocio T61 · deps T63✅ (bump mayor → T64)
Fase B (paralelo)  Portals → T45→T49 · enriquecer paste T53 · T50 UI
Fase C (datos)     feedback sync T54 · analítica T55 → decide T47
Fase D (calidad)   XSS/sanitize T65✅ · report extract T56 · events split T66 (diferido) · WebKit E2E T57 · RLS · CSP T59
Fase E (opcional)  país país T62 · monetización review T61 (solo doc)
```

---

## Fase A — Desbloqueo inmediato (sin App Key)

### T51 — Dogfooding founder (3–5 productos)

| | |
|--|--|
| **Estado** | ✅ |
| **Prioridad** | P0 |
| **Origen** | Evaluación §4.1 |
| **Log** | [DOGFOODING-T51.md](DOGFOODING-T51.md) |

**Objetivo:** Usar DropDeep de punta a punta (Descubrir paste → Copiloto Express → eval Winner → auditor Meta → VSL/feedback T35) y anotar fricciones reales.

**Cerrado 2026-08-06:** E2E `dogfood-t51.spec.js` (3 productos + feedback T35); limpia campos Descubrir + leyenda Audisio. Log founder §3 queda como práctica continua opcional.

---

### T52 — Code splitting de vistas

| | |
|--|--|
| **Estado** | ✅ |
| **Prioridad** | P0 |
| **Origen** | Evaluación §4.3 |

**Objetivo:** Bundle inicial JS &lt; ~300 KB (gzip objetivo &lt; ~100 KB para el entry) vía `import()` de portfolio, spy, prompt-hub, report chunks donde aún no estén.

**Hecho:** `import()` en `navigation` / `events` / `flow` / feed·portfolio·copilot; `sanitizeReport` fuera de `gemini.js`; `manualChunks` + `modulePreload` solo vendors del shell. Entry ~17 KB (gzip ~5 KB); Chart.js sigue lazy.

---

### T61 — Nota de modelo de negocio (solo docs)

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P3 |
| **Origen** | Evaluación §4.12 |

**Objetivo:** En PLAN §1 o §7, párrafo explícito: por qué Stripe está prohibido hoy, y qué señales (dogfood, costes proxy/AE) dispararían revisar tier / donaciones / BYOK-only.

**Criterio:** Texto mergeado; cero código de billing.

---

## Fase B — Discovery (paralelo a Portals)

Depende de [§10](PLAN-MEJORAS.md#10-descubrimiento-real-de-productos-t45t50). Estado actual:

| ID | Título | Estado |
|----|--------|--------|
| T45 | Edge `discover-proxy` + Affiliate API | ⏸️ espera App Key / Portals Approved |
| T46 | UI Descubrir + handoff | 🟡 MVP paste (#35) |
| T47 | Trends CL (SerpAPI) | ⬜ solo si hay presupuesto (ver T55) |
| T48 | Pre-filtro Audisio hot-list | 🟡 parcial en paste |
| T49 | Caché / cuota discovery | ⬜ tras T45 |
| T50 | Retirar discovery falso de UI | ⬜ (chips ya reducidos en #35) |

### T53 — Enriquecer Descubrir sin Affiliate

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P1 |
| **Origen** | Evaluación §4.4 |
| **Depende** | T46 🟡 |

**Objetivo:** Tras pegar URL, intentar rellenar costo/título/imagen vía Edge fetch limitado o Gemini grounding, con badge **No verificado** / **Inferido**. Si falla, el flujo manual actual permanece.

**Criterio:** Al menos un campo auto-rellenado en happy path; nunca se presenta como dato Affiliate oficial.

---

## Fase C — Observabilidad (para priorizar con datos)

### T54 — Feedback T35 opt-in → Supabase

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P1 |
| **Origen** | Evaluación §4.5 |

**Objetivo:** Migración `feedback` + RLS; checkbox “enviar a DropDeep”; el founder ve agregados sin PII de más.

**Criterio:** Local-only sigue funcionando offline; sync solo con sesión + opt-in.

---

### T55 — Analítica privacy-friendly

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P1 |
| **Origen** | Evaluación §4.6 |

**Objetivo:** Eventos anónimos: `view_discover`, `parse_ae`, `start_research`, `copilot_paste_ok`, `save_portfolio`. Tabla + Edge o insert RLS; sin cookies de terceros.

**Criterio:** Dashboard mínimo (SQL o vista admin) responde “dónde abandonan”; informe en dogfood siguiente.

**Gate T47:** no contratar SerpAPI hasta ver si Descubrir+paste+T53 bastan según T51/T55.

---

## Fase D — Ingeniería / calidad

### T56 — Extracción incremental de `report.js`

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P2 |
| **Origen** | Evaluación §4.8 |

**Objetivo:** Sacar secciones (snapshot, next-decision, bundles, VSL, Montecarlo) a `src/ui/report/*.js` sin cambiar UX.

**Criterio:** `report.js` &lt; ~1200 líneas; tests/smoke de informe verdes.

---

### T57 — E2E WebKit (móvil Safari)

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P2 |
| **Origen** | Evaluación §4.9 |

**Objetivo:** Job CI con Playwright WebKit + viewport 375 (o proyecto dedicado); cubrir home overflow + Descubrir parse.

**Criterio:** Job verde en PR; documentado en README.

---

### T58 — Checklist RLS en PRs de migración

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P2 |
| **Origen** | Evaluación §4.10 |

**Objetivo:** Plantilla `.github/PULL_REQUEST_TEMPLATE/migration.md` o sección en CONTRIBUTING: políticas, roles, smoke SQL.

**Criterio:** Primera migración (006 T45/T54) la usa.

---

### T59 — CSP, Open Graph y a11y Descubrir

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P2 |
| **Origen** | Evaluación §4.11 |

**Objetivo:** Revisar headers Pages / meta `og:` para compartir; focus/labels en `#discover-view`.

**Criterio:** Checklist en PR; sin romper CSP `script-src 'self'`.

---

## Fase E — Opcional (después de validar)

### T62 — Parametrizar país/moneda (exploratorio)

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P3 |
| **Origen** | Evaluación §4.13 |
| **Gate** | Dogfood T51 OK + demanda fuera de Chile |

Solo diseño/ADR primero; no hardcodear MX/AR sin señales.

---

## Orden de ejecución recomendado

| Orden | IDs | Nota |
|-------|-----|------|
| 1 | **T51** | Empieza ya (humano) |
| 2 | **T52**, **T61** | Paralelo técnico/docs, sin bloquear |
| 3 | **T50** (cerrar chips/Meta Interests) | Bajo esfuerzo |
| 4 | **T53** | Mejora paste mientras Portals |
| 5 | **T45 → T49** | Cuando App Key exista |
| 6 | **T54**, **T55** | Datos para priorizar |
| 7 | **T47** | Solo si T55 + presupuesto lo justifican |
| 8 | **T56–T59**, **T66** | Mantenibilidad (T65 XSS ✅; T66 diferido) |
| 9 | **T62** | Si hay señal de expansión |

---

## Fuera de este roadmap (siguen en PLAN §7)

Spy Opción B, Stripe, TikTok scrapers, FX en vivo, CRDT, i18n UI, mockup in-app, CapCut/ElevenLabs automatizados.

---

## Índice T51+

| ID | Título | P | Fase | Estado |
|----|--------|---|------|--------|
| T51 | Dogfooding founder 3–5 productos | P0 | A | ✅ | [DOGFOODING-T51.md](DOGFOODING-T51.md) + e2e |
| T52 | Code splitting vistas | P0 | A | ✅ |
| T53 | Enriquecer Descubrir (sin Affiliate) | P1 | B | ⬜ |
| T54 | Feedback T35 → Supabase opt-in | P1 | C | ⬜ |
| T55 | Analítica privacy-friendly | P1 | C | ⬜ |
| T56 | Extraer módulos de report.js | P2 | D | ⬜ |
| T57 | E2E WebKit CI | P2 | D | ⬜ |
| T58 | Checklist RLS migraciones | P2 | D | ⬜ |
| T59 | CSP / OG / a11y Descubrir | P2 | D | ⬜ |
| T61 | Nota modelo de negocio (docs) | P3 | A | ⬜ |
| T62 | País/moneda parametrizable | P3 | E | ⬜ |
| T63 | Higiene deps (audit fix + Dependabot + CI) | P1 | A | ✅ |
| T64 | Bump mayor Vite/Vitest/happy-dom/Playwright | P2 | D | ⬜ |
| T65 | XSS / sanitize innerHTML + DOMPurify | P0 | D | ✅ |
| T66 | Partir `events.js` en módulos (`src/events/*`) | P2 | D | ⬜ | diferido — ver nota abajo |

T45–T50: ver [PLAN §8](PLAN-MEJORAS.md#8-índice-rápido-de-tareas) y §10.

---

## T63 — Higiene de dependencias (devDependencies) + visibilidad en CI

| | |
|--|--|
| **Estado** | ✅ |
| **Prioridad** | P1 |
| **Origen** | Revisión externa (Claude, 2026-08-06) |

**Hecho:** `npm audit fix` (postcss 8.5.15→8.5.26; 9→8 vulns); `.github/dependabot.yml` semanal; step no bloqueante `npm audit --audit-level=high` en `ci.yml`. Sin tocar deps de producción ni bumps mayores.

---

## T64 — Bump mayor de tooling (Vite / Vitest / happy-dom / Playwright)

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P2 |
| **Origen** | Remanente de T63 (`npm audit` aún reporta happy-dom crítica + Playwright alta + Vite/esbuild moderadas) |
| **Depende** | Rama aparte; no mezclar con features |

**Objetivo:** Actualizar con prueba explícita:

- `vite` 5 → 6/8 (y esbuild transitivo)
- `vitest` 2 → 3/4
- `happy-dom` 15 → 20+ (fix RCE GHSA-37j7-fg3j-429f)
- `@playwright/test` 1.51 → ≥1.55.1 (SSL download)

**Criterio:** `npm test` + `npm run test:e2e` + `npm run build` verdes; changelog de breaking changes revisado. **No** usar `npm audit fix --force` a ciegas en `main`.

---

## T65 — XSS / sanitización de sinks `innerHTML`

| | |
|--|--|
| **Estado** | ✅ |
| **Prioridad** | P0 |
| **Origen** | Revisión arquitectura (2026-08) |

**Hecho:** `src/utils/sanitize.js` con `escapeHtml`/`e`, `escapeDeep`, `safeUrl`/`safeHref`, `dataCopyAttr`, y **DOMPurify** (`purifyHtml`/`setSafeHtml`) para markup Gemini (Shopify body, bloques HTML). Toasts vía `textContent`; badges de score con nodos DOM; informe/print/feed/wizard escapados. Tests en `tests/sanitize.test.js`.

---

## T66 — Partir `events.js` (mantenibilidad, diferido)

| | |
|--|--|
| **Estado** | ⬜ diferido |
| **Prioridad** | P2 |
| **Origen** | Revisión arquitectura (2026-08); confirmado “tener presente para más adelante” |
| **No hacer** | Capa `src/controllers/` ni “routerController” (no hay router SPA). Las calculadoras/simuladores ya se bindean en `report.js` / `metaAdsAuditPanel.js`. |

**Objetivo (cuando toque):** Orquestador fino `setupEventListeners()` + módulos en `src/events/` (p. ej. `navigation`, `promptHub`, `spy`, `settings`, `portfolioExport`). Sin mover lógica de dominio. Preferible junto a T56.

**Criterio:** Misma API pública (`import { setupEventListeners } from './events.js'`); `npm test` + build verdes.

*(T60 reservado / no usado.)*
