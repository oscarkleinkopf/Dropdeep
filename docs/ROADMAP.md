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
Fase A (ahora)     dogfood T51 · code-split T52 · nota negocio T61
Fase B (paralelo)  Portals → T45→T49 · enriquecer paste T53 · T50 UI
Fase C (datos)     feedback sync T54 · analítica T55 → decide T47
Fase D (calidad)   report extract T56 · WebKit E2E T57 · RLS checklist T58 · CSP T59
Fase E (opcional)  país país T62 · monetización review T61 (solo doc)
```

---

## Fase A — Desbloqueo inmediato (sin App Key)

### T51 — Dogfooding founder (3–5 productos)

| | |
|--|--|
| **Estado** | 🟡 |
| **Prioridad** | P0 |
| **Origen** | Evaluación §4.1 |
| **Log** | [DOGFOODING-T51.md](DOGFOODING-T51.md) |

**Objetivo:** Usar DropDeep de punta a punta (Descubrir paste → Copiloto Express → eval Winner → auditor Meta → VSL/feedback T35) y anotar fricciones reales.

**Entregable:** nota en `docs/` o issues con: qué falló, qué confundió, qué faltó. Sin esto no abrir T53–T55 a ciegas.

**Criterio:** ≥3 productos documentados; feedback T35 usado al menos una vez por informe.

**Progreso 2026-08-06:** protocolo + pasada agente (3 productos fixture, 1 informe+T35). Pendiente founder: §3 del log con productos AliExpress reales.

---

### T52 — Code splitting de vistas

| | |
|--|--|
| **Estado** | ⬜ |
| **Prioridad** | P0 |
| **Origen** | Evaluación §4.3 |

**Objetivo:** Bundle inicial JS &lt; ~300 KB (gzip objetivo &lt; ~100 KB para el entry) vía `import()` de portfolio, spy, prompt-hub, report chunks donde aún no estén.

**Archivos:** `vite.config.js`, `src/main.js`, `src/ui/*.js` (lazy), mantener Chart lazy.

**Criterio:** `npm run build` muestra chunks separados; Lighthouse/móvil sin regresión funcional de navegación.

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
| 8 | **T56–T59** | Mantenibilidad |
| 9 | **T62** | Si hay señal de expansión |

---

## Fuera de este roadmap (siguen en PLAN §7)

Spy Opción B, Stripe, TikTok scrapers, FX en vivo, CRDT, i18n UI, mockup in-app, CapCut/ElevenLabs automatizados.

---

## Índice T51+

| ID | Título | P | Fase | Estado |
|----|--------|---|------|--------|
| T51 | Dogfooding founder 3–5 productos | P0 | A | 🟡 | [DOGFOODING-T51.md](DOGFOODING-T51.md) |
| T52 | Code splitting vistas | P0 | A | ⬜ |
| T53 | Enriquecer Descubrir (sin Affiliate) | P1 | B | ⬜ |
| T54 | Feedback T35 → Supabase opt-in | P1 | C | ⬜ |
| T55 | Analítica privacy-friendly | P1 | C | ⬜ |
| T56 | Extraer módulos de report.js | P2 | D | ⬜ |
| T57 | E2E WebKit CI | P2 | D | ⬜ |
| T58 | Checklist RLS migraciones | P2 | D | ⬜ |
| T59 | CSP / OG / a11y Descubrir | P2 | D | ⬜ |
| T61 | Nota modelo de negocio (docs) | P3 | A | ⬜ |
| T62 | País/moneda parametrizable | P3 | E | ⬜ |

*(T60 reservado / no usado — evitar colisión con numeración interna.)*

T45–T50: ver [PLAN §8](PLAN-MEJORAS.md#8-índice-rápido-de-tareas) y §10.
