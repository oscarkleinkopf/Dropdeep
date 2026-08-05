# Plan de mejoras DropDeep

> Documento ejecutable para agentes/bots sin contexto previo. **Solo planificación** — no implementar desde este archivo salvo que una tarea concreta lo indique explícitamente.
>
> **Última auditoría de código:** 2026-08-05 — contraste plan ↔ repo tras import desde Antigravity (`silly-meitner`). Varias tareas quedaron **a medias** (posible corte por límite de tokens).
>
> **Metodología de negocio (2026-08-05):** DropDeep se alinea al **método Audisio & Domingo** (precios CLP Chile, calificación Winner, auditoría Meta Ads offline, creativos VSL). Ver [§9](#9-metodología-audisio--domingo) y tareas **T38–T44**.
>
> Leyenda de estado: ✅ Hecho · 🟡 Parcial · ⬜ No iniciado.

---

## Tabla de contenidos

1. [Contexto del producto y reglas fijas](#1-contexto-del-producto-y-reglas-fijas)
2. [Evaluación end-to-end (2026-07-29)](#2-evaluación-end-to-end-2026-07-29)
3. [Estado actual (qué ya existe)](#3-estado-actual-qué-ya-existe)
4. [Auditoría 2026-08-05 — ¿qué quedó a medias?](#4-auditoría-2026-08-05--qué-quedó-a-medias)
5. [Tareas numeradas (T01–T44)](#5-tareas-numeradas-t01t44)
6. [Orden sugerido de ejecución](#6-orden-sugerido-de-ejecución)
7. [Backlog diferido](#7-backlog-diferido)
8. [Índice rápido de tareas](#8-índice-rápido-de-tareas)
9. [Metodología Audisio & Domingo](#9-metodología-audisio--domingo)

---

## 1. Contexto del producto y reglas fijas

### Contexto (breve)

**DropDeep** analiza productos para dropshipping, orientado a emprendedores principiantes (mercado Chile / CLP como referencia primaria). Ofrece investigación de mercado, copywriting, activos de campaña y validación de productos.

**Norte de negocio:** metodología **Alejo Audisio & Domingo** — precios/márgenes, calificación de productos *Winner*, diagnóstico de métricas Meta Ads (inputs del usuario, sin API Meta) y directrices de creativos VSL. Detalle normativo en [§9](#9-metodología-audisio--domingo).

### Reglas fijas (no negociables)

| Regla | Detalle |
|-------|---------|
| **Ruta gratis sin API pagada** | Debe ser realmente útil y **nunca bloquearse**: packs por vertical (`src/data/verticalPacks.js`), **Modo Copiloto** con paste-back (`src/research/copilotFlow.js`), **Evaluación manual** determinista (`src/research/manualRubric.js`). Calculadoras Audisio (T38–T40) son **100% offline**. |
| **API opcional** | Gemini BYOK (`src/utils/geminiStorage.js`) o proxy Supabase con cuota diaria (`supabase/functions/gemini-proxy/`) es un **acelerador**, no requisito. |
| **Prohibido** | Datos mock/simulados presentados como reales; Stripe/billing; secretos en git; **integración Meta Ads API** (el auditor usa métricas pegadas/manuales). |
| **Metodología honesta** | Umbrales Audisio son **reglas de negocio del producto**, no datos de mercado en vivo. UI debe etiquetar “según método Audisio & Domingo” / “umbrales Chile de referencia”. |
| **Logística del método** | AliExpress al inicio → proveedor privado con volumen. **No** modelar pago contraentrega ni Dropi como camino recomendado. |
| **Auth modal** | `#auth-modal` debe permanecer **fuera** de `#app-shell` (`index.html` líneas 66–105 vs 108+). |
| **Build y deploy** | `npm run build` debe pasar; GitHub Pages con base `/Dropdeep/` (`vite.config.js`). |
| **UI** | Español; código modular en `src/`. |
| **Commits** | Autor solo vía variables de entorno: `GIT_AUTHOR_NAME=oscarkleinkopf`, `GIT_AUTHOR_EMAIL=oscar.kleinkopf@gmail.com`, mismos para `GIT_COMMITTER_*`. |
| **Documentación visible** | Si una tarea cambia UI, flujos, límites o textos en español, actualizar `docs/MANUAL.md` y `CHANGELOG.md` en el **mismo commit** (regla `.cursor/rules/docs-manual.mdc`). |

### Dirección reciente (git log)

Commits recientes (`master`, jul 2026):

| Commit | Resumen |
|--------|---------|
| `031b013` | Manual/CHANGELOG alineados con Express, proxy, cuota por investigación |
| `e3b43d1` | Pipeline API honesto, cuota proxy por sesión (004), Copiloto Express, parse unificado |
| `fecd3e4` | Plan de mejoras ejecutable (este documento) |
| `7aafdea` | Manual español, CHANGELOG, enlace Ayuda in-app |
| `92e26e6` | Modo Copiloto paste-back + evaluación manual determinista |

**Producción Supabase (jul 2026):** migraciones 001–004 aplicadas, `gemini-proxy` desplegado, secretos `GEMINI_API_KEY` + `GEMINI_PROXY_DAILY_LIMIT`, `VITE_GEMINI_PROXY=true` en GitHub Pages. Cuota 429 verificada en vivo.

---

## 2. Evaluación end-to-end (2026-07-29)

> Evaluación crítica previa a fase de **dogfooding solo founder**. Sin implementación — solo diagnóstico para repriorizar tareas.

### Veredicto general

DropDeep cumple la promesa central del tier gratis: **Copiloto Express (1 pegado)**, **evaluación manual offline** y **packs verticales** producen un informe accionable sin API pagada. El sprint `e3b43d1` eliminó las mayores fugas de confianza (plantillas API falsas, A/B con CTR aleatorio, cuota proxy por llamada). Quedan **fricciones de dogfooding diario** (BYOK ignorada con sesión, sesión copiloto volátil, gráfico de tendencia simulado presentado como Google Trends) y **cero red de tests**. El producto es **usable hoy** para validar nichos; falta cerrar el loop **decisión → feedback** para iterar con datos propios.

### Fortalezas

| Área | Evidencia |
|------|-----------|
| Ruta gratis real | `copilotFlow.js` + `reportSchema.js` (`ALL_IN_ONE`); default Express en `researchMode.js` |
| Evaluación manual determinista | `manualRubric.js` — veredictos Lanzar/Validar/Descartar sin IA |
| Pipeline API honesto | `gemini.js` → `reportParse.js` + `reportFallbacks.js`; banner `_incompleteSections` en `report.js` |
| Cuota proxy por investigación | `004_research_session_quota.sql`, `researchSession.js`, proxy devuelve `usage` |
| Docs y ayuda | `docs/MANUAL.md` documenta prioridad proxy/BYOK; `#help-manual-btn` en `index.html` |
| Seguridad base | RLS en `001_profiles.sql`, `002_research_reports.sql`, `003_gemini_usage.sql`; export `stripSensitiveFields` en `export.js` |
| PWA staleness mitigado | `public/sw.js` v6 — network-first para HTML y `/assets/` hasheados |

### Top 5 debilidades (histórico 2026-07-29)

> **Nota 2026-08-05:** los puntos 1–4 ya están resueltos (T33, T34, T09+T10, T05). El #5 sigue vigente. Ver [§4 Auditoría](#4-auditoría-2026-08-05--qué-quedó-a-medias) para el top actual.

| # | Debilidad | Estado hoy |
|---|-----------|------------|
| 1 | BYOK ignorada si hay sesión + proxy | ✅ Resuelto T33 |
| 2 | Gráfico Trends simulado con `Math.random()` | ✅ Resuelto T34 |
| 3 | Sin “próxima decisión” / comparador sin eval manual | ✅ Resuelto T09 + T10 |
| 4 | Sesión copiloto volátil | ✅ Resuelto T05 |
| 5 | Sin tests ni CI | ✅ Resuelto T25 + T36 + T44 (Vitest + `ci.yml`) |

### Otras observaciones (actualizado 2026-08-05)

- ~~**Cuota proxy UI parcial**~~ — ✅ T16: badge en menú usuario + fetch al login.
- ~~**Spy inferido como verificado**~~ — ✅ T11-A: badge Inferido por IA; pixel/GA = No verificado; checklist manual.
- **Sync remoto unidireccional:** ✅ T19 — upsert + delete remoto + tombstones anti-resurrección.
- **Caché sin fuente/modo:** ⬜ T28 — `getCacheKey(query, language)` solo.
- ~~**Código muerto**~~ — ✅ T30: eliminados `reportGenerator.js` y shim `src/data.js`.
- **CI Node:** ✅ T37 pins OK; ✅ T25/T36 job `build-and-test` en `ci.yml`.
- ~~**Bundles a medias**~~ — ✅ cableado a `generateBundleStructure` (PR #5).

### Coherencia producto (ruta gratis → decisión)

| Paso | ¿Entrega valor? | Nota |
|------|-----------------|------|
| Wizard / onboarding | Sí (con fricción) | 🟡 T13/T14 — wizard/CTA no cierran del todo el camino gratis |
| Copiloto Express | Sí | 1 pegado → Product Score + copys |
| Eval manual | Sí | Veredicto explícito offline |
| Reporte → guardar | Sí | Portafolio local + sync opcional (delete remoto T19 ✅) |
| Reporte → decidir | Sí | ✅ T09 panel Próxima decisión |
| Comparar | Sí | ✅ T10 pondera eval manual cuando todos la tienen |
| Export / kit | Sí | CSV/MD/JSON + Shopify/Woo + ops 20–23 |

### UX walk-through (fricciones)

- **Duplicación CTAs:** Inicio tiene copiloto + eval manual + wizard — coherente pero denso para primer visita.
- **Express vs API:** Con ruta API + profundidad Express, API ejecuta Completo (documentado en MANUAL) — puede sorprender.
- **Proxy 429:** Mensaje español correcto (`errors.js`); sugerencia BYOK contradice prioridad proxy actual.
- **Español:** Consistente en UI principal; título HTML aún en inglés (`index.html:7`).

---

## 3. Estado actual (qué ya existe)

### Arquitectura de arranque

| Pieza | Archivo | Función |
|-------|---------|---------|
| Entrada HTML | `index.html` | Shell, modales (auth **fuera** de app), vistas, CDN Chart.js + Lucide |
| Bootstrap | `src/main.js` | Auth, onboarding, wizard, toggles modo/ruta, copiloto, eval manual, sync historial |
| Eventos | `src/events.js` | Navegación, búsqueda, portafolio, Prompt Hub, Spy, export, ajustes |
| Estado | `src/state.js` | Portafolio localStorage, reporte activo, selección comparar |

### Rutas de investigación

| Ruta | Selector | Flujo |
|------|----------|-------|
| **Copiloto (gratis)** | `src/config/researchPath.js` → `RESEARCH_PATH_COPILOT` | `flow.js` → `copilotPanel.js` → `copilotFlow.js` |
| **API** | `RESEARCH_PATH_API` | `flow.js` → `gemini.js` (`runRealResearchSequence`) o proxy |
| **Evaluación manual** | Botón `#manual-eval-cta-btn` | `manualEvaluation.js` + `manualRubric.js` |

**Modo profundidad:** `src/config/researchMode.js` — Rápido (2 pasos) vs Completo (5 pasos); aplica a copiloto y API.

### Pipeline compartido copiloto (parcialmente compartido con API)

| Módulo | Rol |
|--------|-----|
| `src/research/reportSchema.js` | Esquemas JSON, lista de pasos, `buildCopilotPrompt()` |
| `src/research/reportParse.js` | `parseResearchJson`, `validateStepPayload`, `applyStepToReport`, `assembleCopilotReport` |
| `src/research/fastMode.js` | Placeholders honestos en modo rápido (`FAST_MODE_SKIP_MSG`) |
| `src/research/scoring.js` | Product Score numérico |
| `src/research/gemini.js` | `sanitizeReport()`, secuencia API vía `reportParse.js` + `buildApiPrompt()` |

### Tier gratis y límites

| Límite | Valor | Archivo |
|--------|-------|---------|
| Portafolio local | 10 | `src/config/freeTier.js` → `FREE_PORTFOLIO_CAP` |
| Comparar (anon) | 2 | `getCompareMax(false)` |
| Comparar (logueado) | 3 | `getCompareMax(true)` |
| Proxy diario (display) | 2 (env) | `FREE_PROXY_DAILY_LIMIT` |
| Caché local | 24 h | `src/research/cache.js` |

### Auth y sync

- Supabase: `src/auth/*`, migraciones `supabase/migrations/001_profiles.sql`, `002_research_reports.sql`, `003_gemini_usage.sql`
- Proxy: `supabase/functions/gemini-proxy/index.ts` — JWT + RPC `check_and_increment_gemini_usage`
- Sync portafolio: `src/research/historySync.js`
- Auth gate **no bloquea** app: `src/ui/authGate.js`

### UI principal

| Vista | Archivo |
|-------|---------|
| Inicio / feed | `src/ui/feed.js` |
| Reporte | `src/ui/report.js` (muy grande, ~1900+ líneas) |
| Portafolio / comparar | `src/ui/portfolio.js` |
| Prompt Hub + packs | `src/ui/promptHub.js`, `src/data/verticalPacks.js` |
| Copiloto | `src/ui/copilotPanel.js` |
| Eval manual | `src/ui/manualEvaluation.js` |
| Spy | `src/ui/spy.js` |
| Onboarding / wizard | `src/ui/onboarding.js`, `src/ui/firstProductWizard.js` |
| Export | `src/ui/export.js` |

### CI / deploy

- `.github/workflows/deploy-pages.yml` — Node 22, `npm ci`, `npm run build`, secrets Supabase/proxy
- **Sin tests** en el repo (`package.json` solo `dev`, `build`, `preview`, `icons`)

### Deuda / inconsistencias observadas (auditoría 2026-08-05)

1. ~~**BYOK pierde frente a proxy con sesión**~~ — ✅ T33.
2. ~~**Gráfico tendencia simulado**~~ — ✅ T34.
3. ~~**Sesión copiloto volátil**~~ — ✅ T05.
4. ~~**Comparador sin eval manual**~~ — ✅ T10.
5. ~~**Spy sin verificación**~~ — ✅ T11-A (Opción A).
6. ~~**`src/data.js` shim roto**~~ — ✅ T30 eliminado.
7. **Sin E2E Playwright** — ⬜ T08; ~~unit/CI~~ ✅ T25/T36/T44.
8. **Caché no distingue fuente/modo** — ⬜ T28.
9. ~~**Bundles half-wired**~~ — ✅ §21 usa `generateBundleStructure`.
10. ~~**Sync delete solo local**~~ — ✅ T19.
11. **Validación JSON copiloto incompleta** — ✅ T06/T07 (tips + ejemplo JSON + UI pasos completados).

---

## 4. Auditoría 2026-08-05 — ¿qué quedó a medias?

> Contraste del plan frente al código en `main` (`d5c6f46` + working tree). Motivo probable de cortes: sesiones Antigravity agotando tokens a mitad de tarea.

### Resumen cuantitativo

| Estado | Cantidad | IDs |
|--------|----------|-----|
| ✅ Hecho | 20 | T01–T07, T09–T10, T12, T15, T16, T19, T27, T32–T34, T37 |
| 🟡 Parcial | 8 | T13, T14, T18, T21, T24, T29, T30, T31 |
| ⬜ No iniciado | 9 | T08, T11, T17, T20, T22, T23, T25, T28, T35 (+ T26→T36) |
| Residuo fuera de índice | 1 | Bundles: import muerto / UI hardcodeada |

### Cortes mid-task (alta confianza de “se quedó a medias”)

| Ítem | Qué hay | Qué falta |
|------|---------|-----------|
| **Bundles (ops §21)** | `bundles.js` + uso en `report.js` + tab en `index.html` | ✅ UI usa `generateBundleStructure(report)` (PR #5) |
| **T06** | Tips parse + ejemplo JSON en modal | ✅ Cerrado |
| **T07** | Peek pasos completados + caption; error no avanza | ✅ Cerrado |
| **T14** | `_isDraft` + badge en **feed** | Badge “Borrador” en **portafolio**; CTAs wizard (pack debería ser primario) |
| **T18** | Toast + auto-export al límite 10 | Modal con listado/eliminar — no existe |
| **T19** | Delete remoto + tombstones + badge sync | ✅ Cerrado |
| **T30** | `reportGenerator.js` ya no existe | Arreglar o eliminar shim `src/data.js` |
| **T31** | `#meta-interests-disclaimer` en HTML | Empieza `.hidden`; solo se muestra tras búsqueda |

### Hecho y verificado en código (no solo en changelog)

| ID | Evidencia clave |
|----|-----------------|
| T01–T04, T12, T27 | `gemini.js` + `reportParse` / `reportFallbacks` / `ALL_IN_ONE` / A/B determinista |
| T05 | `dropdeep_copilot_session` en `copilotFlow.js` + banner retomar |
| T09–T10 | `getNextDecision` / `pickCompareWinner` en `scoring.js` |
| T15 | CTAs vacíos en feed, portafolio, spy |
| T16 | Badge proxy en `userMenu.js` + `geminiProxy.js` |
| T32–T34 | Ayuda HTML; `geminiRoute.js`; `buildTrendSeries` sin random |
| T37 | `checkout@v5`, `setup-node@v5`, Node 22 en `deploy-pages.yml` |

### Features recientes (fuera de T01–T37) — cableado

| Feature | Estado |
|---------|--------|
| CSV Shopify / WooCommerce | ✅ Cableado (`export.js`, `events.js`, `index.html`) |
| Montecarlo (§20) | ✅ UI + listeners en `report.js` |
| HTML blocks (§22) | ✅ Usa `htmlBlocks.js` |
| WhatsApp scripts (§23) | ✅ Usa `whatsappScripts.js` |
| Bundles (§21) | ✅ Hecho — `generateBundleStructure` en UI (PR #5) |

---

## 5. Tareas numeradas (T01–T44)

---

### T01 — Refactorizar ruta API para reutilizar `reportParse.js`

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. `gemini.js` usa `parseAndValidateStep`, `applyStepToReport`, `assembleCopilotReport` + `buildApiPrompt()`. Loop unificado por pasos API.

**Objetivo:** Una sola fuente de verdad para parseo/merge de pasos JSON, igualando forma de salida copiloto ↔ API.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 |
| **Impacto / Esfuerzo** | Alto / Alto (~2–3 días) |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí, pero **solapa** `src/research/gemini.js`, `reportParse.js`, `reportSchema.js` — no editar esos archivos en paralelo con otra tarea |

**Archivos a modificar**

- `src/research/gemini.js` (principal)
- `src/research/reportParse.js` (extraer helpers si faltan, p.ej. merge final)
- `src/research/reportSchema.js` (opcional: exportar builders de prompt API desde mismos templates)
- Tests nuevos: `tests/reportParse.test.js` (ver T28)

**Pasos de implementación**

1. Mapear cada paso de `runRealResearchSequence` (pasos 1–5 + fast step 2) al `stepId` de `COPILOT_STEPS`.
2. Tras cada respuesta Gemini, usar `parseAndValidateStep(stepId, text)` en lugar de `cleanAndParseJSON` + merge ad hoc.
3. Acumular en objeto `partialReport` con `applyStepToReport`.
4. Al final, `assembleCopilotReport` + `sanitizeReport` + `calculateProductScore`; marcar `_source: 'api'`.
5. Eliminar o reducir bloques `defaultReport` / plantillas de contingencia (ver T02).
6. Reutilizar `buildCopilotPrompt()` para prompts API donde sea posible (añadir flag `forApi: true` si hace falta texto de grounding).

**Criterio de aceptación**

- Reporte API Completo y copiloto Completo para el mismo producto tienen **mismas claves top-level** y mismos defaults en `sanitizeReport`.
- No quedan merges duplicados de `demographics`/`avatarBrief` solo en `gemini.js`.
- `npm run build` pasa.

**Cómo probar manualmente**

1. Sin clave: no aplica.
2. Con BYOK: Modo Completo + ruta API, producto "Organizador de cables magnético".
3. Misma corrida vía Modo Copiloto pegando JSON válido por paso.
4. Comparar estructura JSON en consola (`state.currentReport`) — mismos campos requeridos por `export.js`.

**Riesgos / NO romper**

- Proxy y BYOK deben seguir funcionando.
- Modo Rápido debe seguir usando `buildFastModeReport`.
- No eliminar logs del terminal modal.

---

### T02 — Etiquetar honestamente fallbacks de API (eliminar datos genéricos como si fueran reales)

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. `reportFallbacks.js`, catches sin plantillas; banner `_incompleteSections` + export MD.

**Objetivo:** Si un paso API falla al parsear, el usuario ve placeholders explícitos (como modo rápido), no copy genérico de "soporte ergonómico".

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ideal después de T01; puede hacerse antes parcialmente |
| **Paralelizable** | Parcial — solapa `gemini.js`, `report.js` |

**Archivos**

- `src/research/gemini.js` (bloques catch ~585–621, ~671–700, ~777–847, ~908–956)
- `src/research/fastMode.js` (reutilizar `FAST_MODE_SKIP_MSG` o constante compartida)
- `src/ui/report.js` (badge "Sección incompleta" si detecta skip msg)
- `docs/MANUAL.md`, `CHANGELOG.md`

**Pasos**

1. Crear `src/research/reportFallbacks.js` con objetos mínimos marcados `_incomplete: true` o texto `FAST_MODE_SKIP_MSG`.
2. Reemplazar plantillas largas en catches por skips honestos.
3. En UI reporte, mostrar banner cuando `_incomplete` o contenido = skip msg.

**Criterio de aceptación**

- Simular parse fallido (prompt que devuelva texto plano): reporte abre con secciones marcadas "No generado — reintenta paso X", **sin** párrafos genéricos de producto.
- Export CSV/MD incluye nota de incompletitud.

**Prueba manual**

1. BYOK requerido.
2. Temporalmente forzar error (modelo inválido en Ajustes) en paso 2 — o usar mock local en dev.
3. Verificar badges en reporte.

**NO romper:** Investigación exitosa debe verse igual que hoy.

---

### T03 — Cuota proxy: contar por investigación, no por llamada Gemini

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. Migración `004_research_session_quota.sql`, `researchSessionId` en proxy, docs actualizados. **Prod:** migración + Edge Function desplegadas; 429 verificado en Pages. **Residual:** badge cuota completo en menú usuario (T16).

**Objetivo:** Con límite 2/día, el usuario puede completar investigaciones enteras (1 consumo = 1 secuencia hasta 5 pasos).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | No en `gemini-proxy` si otro agente toca Supabase |

**Archivos**

- `supabase/functions/gemini-proxy/index.ts`
- `supabase/migrations/004_research_session_quota.sql` (nuevo)
- `src/research/geminiProxy.js` (pasar `researchSessionId`)
- `src/research/researchSession.js` (generar UUID por secuencia)
- `src/config/freeTier.js`, `docs/MANUAL.md`

**Pasos**

1. Añadir RPC `check_and_increment_gemini_usage` con modo `p_increment_only_on_session_start` o tabla `gemini_research_sessions` (user_id, session_id, date).
2. Primera llamada de una secuencia incrementa contador; siguientes pasos con mismo `sessionId` no incrementan.
3. Cliente: `startResearchSession` genera UUID; `createProxyGenerativeModel` lo envía en body.
4. Documentar: "2 investigaciones completas/día vía proxy", no "2 llamadas".

**Criterio de aceptación**

- Usuario logueado con proxy: modo Completo (5 pasos) consume **1** unidad de cuota.
- Tercera investigación en el mismo día UTC muestra error `proxy_daily_quota` existente.

**Prueba manual**

1. Supabase configurado + proxy activo + cuenta de prueba.
2. Ejecutar Deep Research Completo; verificar contador (respuesta `usage` del proxy en network tab).
3. Repetir 3 veces en un día — la 3.ª debe fallar con mensaje en español de `errors.js`.

**NO romper:** BYOK no usa cuota proxy. Spy scan debe definir si cuenta como investigación (decisión: 1 scan = 1 unidad).

---

### T04 — Modo Copiloto "un solo pegado" (Modo Rápido 1-step)

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. `COPILOT_STEPS.ALL_IN_ONE`, toggle **Express**, default sin preferencia previa. **Deferred:** T05 persistencia sesión.

**Objetivo:** Reducir fricción del camino gratis: opción de **1 copiar + 1 pegar** para reporte mínimo viable.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `reportSchema.js`, `copilotFlow.js`, `copilotPanel.js`, `index.html` |

**Archivos**

- `src/research/reportSchema.js` — nuevo step `COPILOT_STEPS.ALL_IN_ONE` o mega-schema
- `src/research/copilotFlow.js` — lista `[ALL_IN_ONE]` cuando `ultraFastMode`
- `src/ui/copilotPanel.js` — UI hint "1 pegado"
- `src/config/researchMode.js` o nuevo toggle `copilotSteps: 1|2|5`
- `index.html` — copy en `#copilot-modal`
- `docs/MANUAL.md`

**Pasos**

1. Definir prompt único que pida JSON con esquema combinado (base + marketing mínimo) inspirado en `buildCopilotPrompt(BASE)` + `FAST_MARKETING`.
2. Validación: `validateStepPayload` extendida para mega-objeto.
3. Toggle en dashboard: "Copiloto express (1 pegado)" vs actual Rápido (2) / Completo (5).
4. Default recomendado para principiantes: express o rápido.

**Criterio de aceptación**

- Flujo express: 1 prompt copiado, 1 pegado, reporte abre con demographics + adCopy + Product Score.
- Sin API key.

**Prueba manual**

1. Ruta Copiloto + modo express.
2. Pegar JSON válido mínimo — reporte completo sin segundo paso.
3. JSON inválido — error claro en `#copilot-error-msg`.

**NO romper:** Modos 2 y 5 pasos siguen disponibles.

---

### T05 — Persistir progreso parcial del copiloto (localStorage)

> **Estado (2026-07-29):** ✅ Hecho — `copilotFlow.js` (`dropdeep_copilot_session`), `copilotPanel.js` (cerrar vs descartar), banner retomar en `feed.js`, toast al cargar en `main.js`.

**Objetivo:** Si el usuario cierra el modal o recarga, puede retomar el paso N del copiloto.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `copilotFlow.js`, `copilotPanel.js` |

**Archivos**

- `src/research/copilotFlow.js`
- `src/ui/copilotPanel.js`
- `src/ui/feed.js` (CTA "Retomar copiloto")
- `index.html` (opcional banner en modal)

**Pasos**

1. Clave `dropdeep_copilot_session` con `{ productName, competitorUrl, fastMode, steps, currentStepIndex, partialReport, updatedAt }`.
2. Guardar tras cada `processCopilotPaste` exitoso; borrar al completar o cancelar explícito.
3. Al abrir app, si hay sesión < 7 días, toast "Retomar investigación de X".
4. Botón "Descartar progreso" en modal.

**Criterio de aceptación**

- Completar paso 1/5, cerrar modal, recargar → "Retomar" abre paso 2 con `partialReport` intacto.
- Cancelar con confirmación borra storage.

**Prueba manual:** Sin Gemini. Copiloto Completo, pegar paso 1, F5, retomar.

**NO romper:** `cancelCopilotSession()` explícito debe limpiar storage.

---

### T06 — Validación JSON pegado: feedback accionable

> **Estado (2026-08-05):** ✅ Hecho — tips SyntaxError/truncado en `json.js`; UI «Ver ejemplo de JSON» por paso; validateStepPayload cita campos.

**Objetivo:** Errores de pegado en copiloto explican qué campo falta y cómo arreglarlo (markdown, comillas, truncado).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/research/reportParse.js`
- `src/utils/json.js`
- `src/ui/copilotPanel.js`

**Pasos**

1. En `parseResearchJson`, capturar `SyntaxError` y sugerir "¿Incluiste ```json? Quita markdown".
2. En `validateStepPayload`, mensajes con nombre de campo esperado (`demographics.who`, etc.).
3. UI: enlace "Ver ejemplo de JSON" colapsable por paso (snippet desde `reportSchema.js`).

**Criterio de aceptación**

- Pegar `{` sin cerrar → mensaje menciona JSON truncado y botón Reintentar.
- Pegar objeto sin `demographics` en paso 1 → error cita regla de `validateStepPayload`.

**Prueba manual:** Sin Gemini. Pegar basura, markdown, JSON parcial.

---

### T07 — Recuperación de errores en copiloto (reintentar paso sin perder anteriores)

> **Estado (2026-08-05):** ✅ Hecho — catch no avanza índice; caption + barra de completados; **Ver pasos completados** / **Paso anterior** (peek solo lectura); **Volver al paso actual**; tests en `tests/copilotRecovery.test.js`. “Editar paso anterior” queda P2.

**Objetivo:** Tras error de validación, el usuario no pierde pasos ya completados.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T05 recomendada |
| **Paralelizable** | Solapa `copilotFlow.js` |

**Archivos**

- `src/research/copilotFlow.js` — `processCopilotPaste` no incrementa índice en error; `getCompletedCopilotSteps` / `peekCompletedCopilotStep`
- `src/ui/copilotPanel.js` + `index.html` — lista colapsable, peek, caption de progreso
- `tests/copilotRecovery.test.js`

**Pasos**

1. Auditoría: confirmar que error no avanza `currentStepIndex`.
2. Añadir UI "Ver pasos completados" (lista colapsable).
3. Opcional: "Editar paso anterior" (avanzado, P2) — diferido.

**Criterio de aceptación**

- Fallo en paso 3 no borra datos de pasos 1–2 en `partialReport`.
- Progreso bar refleja pasos completados.

**Prueba manual:** Copiloto 5 pasos; paso 3 inválido → reintentar → continuar al 4.

---

### T08 — Tests E2E paste-back del copiloto (Playwright)

> **Estado (2026-08-05):** ⬜ No iniciado — sin `playwright.config.js`, `e2e/` ni script `test:e2e`.

**Objetivo:** Regresión automática del flujo gratis crítico.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí (archivos nuevos en `e2e/`) |

**Archivos a crear**

- `playwright.config.js`
- `e2e/copilot-paste.spec.js`
- `e2e/fixtures/copilot-step1.json`, `copilot-step2-fast.json`
- `.github/workflows/ci.yml` (job test separado de deploy)
- `package.json` — script `test:e2e`

**Pasos**

1. `npm run build && npm run preview -- --port 4173`.
2. Test: navegar a `/Dropdeep/`, setear localStorage ruta copiloto, abrir modal, pegar fixtures, procesar, assert `#report-view` visible y título producto.
3. Modo rápido: 2 fixtures; modo express (T04): 1 fixture.

**Criterio de aceptación**

- CI ejecuta E2E en PR/push a `master` (o manual `workflow_dispatch` si sin secretos).
- Test pasa sin Gemini/red externa.

**Prueba manual:** `npm run test:e2e` local.

**NO romper:** Deploy Pages sigue pasando.

---

### T09 — Bloque "Próxima decisión" al final del reporte

> **Estado (2026-07-29):** ✅ Hecho — panel **Próxima decisión** en `report.js` + `getNextDecision()` en `scoring.js`; CTAs guardar, eval manual, kit, comparar, completar secciones.

**Objetivo:** Principiante sabe qué hacer: lanzar, validar más, comparar o evaluar manualmente.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `report.js`, `style.css` |

**Archivos**

- `src/ui/report.js` — sección fija o sticky footer
- `src/research/scoring.js`, `manualRubric.js` — helpers de recomendación
- `docs/MANUAL.md`

**Pasos**

1. Matriz simple: Product Score + presencia `manualEvaluation` → CTAs: "Guardar portafolio", "Evaluación manual", "Comparar", "Exportar kit".
2. Si `_researchMode === 'fast'`, CTA "Completar secciones (Copiloto 5 pasos o API)".
3. Textos en español accionables ("Siguiente paso sugerido: …").

**Criterio de aceptación**

- Tras abrir cualquier reporte, panel visible con ≥2 acciones clicables que funcionan.
- Reporte copiloto rápido muestra aviso de secciones omitidas.

**Prueba manual:** Sin API. Copiloto rápido → ver panel → clic Evaluación manual abre modal.

---

### T10 — Integrar evaluación manual con Product Score en comparador

> **Estado (2026-07-29):** ✅ Hecho — `pickCompareWinner()` en `scoring.js`; comparador con filas manual + hint de señal usada.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `portfolio.js` |

**Archivos**

- `src/ui/portfolio.js` — `openProductComparison`
- `src/research/scoring.js` — `getEffectiveScore(report)` (nuevo)

**Pasos**

1. Si `manualEvaluation.score` existe, usar promedio ponderado o mostrar ambos scores.
2. Fila "Cuál lanzar primero" considera manual eval.
3. Hint actualizado en `.comparator-verdict-hint`.

**Criterio de aceptación**

- Dos productos: uno con manual 85/100 Lanzar, otro Product Score 90 sin manual → UI explica criterio.

**Prueba manual:** Eval manual + guardar 2 productos + comparar.

---

### T11 — Spy: mantener honesto o añadir fuente verificada

> **Estado (2026-08-05):** ✅ Hecho (Opción A) — banner + badge Inferido por IA; pixel/GA = No verificado; checklist manual gratis. Opción B sigue diferida.

**Objetivo:** Usuario entiende límites; opcionalmente datos verificables (Shopify/Wappalyzer) sin inventar.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Alto (si fuente real) |
| **Dependencias** | Ninguna |
| **Paralelizable** | Parcial |

**Archivos**

- `src/ui/spy.js`
- `index.html` (copy Spy)
- Opcional backend: `supabase/functions/store-scan/index.ts` (nuevo)
- `docs/MANUAL.md`

**Opción A (rápida — recomendada primero):**

1. Banner permanente: "Análisis inferido por IA — no verificado. No sustituye visitar la tienda."
2. Desactivar métricas pixel/GA como booleanos definitivos; mostrar "No verificado".
3. Modo gratis: enlace a checklist manual (copiar URL, abrir tienda, anotar precio).

**Opción B (fuente real — backlog parcial):**

1. Edge function fetch URL (robots.txt, HTML público) + parse Shopify theme/apps.
2. Fusionar con Gemini solo para copy hooks.

**Criterio de aceptación (Opción A)**

- Sin BYOK: pantalla empty honesta (ya existe ~177–183).
- Con BYOK: resultados muestran badge "Inferido por IA".

**Prueba manual:** URL Shopify pública con/sin API.

**NO romper:** Meta Hidden Interests (datos curados estáticos) sigue funcionando; mantener `#meta-interests-disclaimer`.

---

### T12 — Renombrar simulador A/B a heurística local (sin CTR falso)

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. Comparador determinista, sin CTR ni “científico”.

**Objetivo:** No presentar CTR como predicción científica.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `report.js` |

**Archivos**

- `src/ui/report.js` (~882–901, 1530–1628)
- `docs/MANUAL.md`

**Pasos**

1. Título → "Comparador heurístico de titulares (offline)".
2. Eliminar `Math.random()`; scores deterministas por keywords.
3. Sustituir "CTR estimado" por "Puntuación relativa de gancho (no predice ventas reales)".
4. Veredicto basado en suma determinista.

**Criterio de aceptación**

- Mismos titulares → mismos scores en dos clics consecutivos.
- Copy no menciona "científico" ni "% CTR" como predicción.

**Prueba manual:** Abrir reporte → sección A/B → dos titulares fijos → repetir simulación.

---

### T13 — Onboarding: alinear pasos con ruta copiloto por defecto

> **Estado (2026-08-05):** 🟡 Parcial — pasos pack→copiloto→eval→portafolio existen; CTA “Iniciar Copiloto” no fuerza `setResearchPath(COPILOT)`.

**Objetivo:** Checklist empuja el camino gratis real (pack → copiloto → eval → portafolio).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T04 opcional |
| **Paralelizable** | Solapa `onboarding.js` |

**Archivos**

- `src/ui/onboarding.js`
- `src/config/researchPath.js` — asegurar default copiloto

**Pasos**

1. Paso "copilot" marca done al completar copiloto (`markFirstResearchDone` ya en `copilotPanel.js`).
2. Quitar referencias obsoletas a "solo API".
3. CTA copiloto pre-selecciona ruta copiloto en toggle.

**Criterio de aceptación**

- Usuario nuevo ve onboarding; completar copiloto tacha paso 2.

**Prueba manual:** localStorage limpio, flujo onboarding.

---

### T14 — Wizard primer producto: reducir dead-ends

> **Estado (2026-08-05):** 🟡 Parcial — `_isDraft` + badge en feed; falta badge en portafolio y reordenar CTAs (pack primario).

**Objetivo:** Wizard siempre lleva a acción con valor (copiar pack, copiloto, eval).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `firstProductWizard.js` |

**Archivos**

- `src/ui/firstProductWizard.js`
- `index.html` (wizard modal)

**Pasos**

1. Paso 3: ordenar CTAs — "Copiar pack" primario, "Copiloto" secundario, "Deep Research API" terciario con tooltip "requiere clave".
2. Si sin nombre producto, deshabilitar API/copiloto con mensaje claro.
3. Borrador `_isDraft: true` ya existe — mostrar badge en portafolio.

**Criterio de aceptación**

- Wizard sin API: usuario puede copiar pack y/o abrir copiloto.
- Borrador visible en portafolio con etiqueta "Borrador".

**Prueba manual:** Portafolio vacío → abrir wizard → solo copiar pack.

---

### T15 — Estados vacíos coherentes (feed, portafolio, spy)

> **Estado (2026-08-05):** ✅ Hecho — CTAs en feed, portafolio vacío y spy empty state.

**Objetivo:** CTAs útiles en cada vacío.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/ui/feed.js`
- `src/ui/portfolio.js`
- `src/ui/spy.js`
- `index.html`

**Pasos**

1. Feed vacío: botones "Modo Copiloto", "Evaluación manual", "Abrir wizard".
2. Portafolio vacío: ya tiene CTAs — verificar ids `#empty-portfolio-cta`, `#empty-portfolio-wizard-cta`.
3. Spy: CTA "Ir a Prompt Hub" para investigar competidor manualmente.

**Criterio de aceptación**

- Cada vista vacía tiene ≥1 CTA que navega correctamente (`switchView`).

**Prueba manual:** Sin datos locales, recorrer 3 vistas.

---

### T16 — Mostrar cuota proxy restante en UI

> **Estado (2026-07-29):** ✅ Hecho — badge en menú usuario + fetch Supabase al login; hint profundidad; BYOK muestra *Usando BYOK*.

**Objetivo:** Usuario logueado ve cuántas investigaciones proxy le quedan hoy.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | T03 (definición de unidad) |
| **Paralelizable** | Solapa `userMenu.js`, `geminiProxy.js` |

**Archivos**

- `src/ui/userMenu.js` o `geminiKeyBanner.js`
- `src/research/geminiProxy.js` — parsear `usage` de respuesta proxy
- `supabase/migrations` — policy lectura `gemini_usage` (ya existe SELECT own)

**Pasos**

1. Tras llamada proxy exitosa, guardar `{ count, limit }` en sessionStorage.
2. Badge en menú usuario: "Proxy: 1/2 hoy".
3. Si agotado, CTA BYOK + copiloto.

**Criterio de aceptación**

- Logueado + proxy: badge visible y decrementa tras investigación (post-T03).

**Prueba manual:** Cuenta + proxy + 2 investigaciones.

---

### T17 — Manejo unificado errores Gemini en copiloto (paridad con API)

> **Estado (2026-08-05):** ⬜ No iniciado — `classifyGeminiError` no se usa en `copilotPanel.js`.

**Objetivo:** Mismos mensajes clasificados si en futuro copiloto llama API (no aplica hoy) y para flujos híbridos.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/research/errors.js`
- `src/ui/copilotPanel.js` — reutilizar textos de `classifyGeminiError` para errores JSON genéricos

**Pasos:** Mapa de errores parse → tipo `parse` con acciones sugeridas.

**Criterio:** Mensajes copiloto consistentes con terminal API para errores JSON.

---

### T18 — Límite portafolio: UX export + eliminar rápido

> **Estado (2026-08-05):** 🟡 Parcial — toast + auto-export al tope; falta modal con listado/eliminar.

**Objetivo:** Al llegar a 10 productos, flujo claro sin frustración.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `portfolio.js` |

**Archivos**

- `src/ui/portfolio.js` — `toggleSaveProduct` ya llama `exportPortfolioJSON` al límite
- Modal confirmación nuevo en `index.html` o reutilizar toast + modal

**Pasos**

1. Modal: "Límite 10 — exportar JSON o eliminar producto".
2. Listar productos más antiguos con checkbox eliminar.

**Criterio:** Al guardar #11, modal aparece; export genera archivo.

**Prueba manual:** Llenar portafolio con 10 items dummy vía localStorage.

---

### T19 — Sync remoto: conflictos y borrado

> **Estado (2026-08-05):** ✅ Hecho — `deleteRemoteResearchReport` + tombstones anti-resurrección; toast si falla nube; badge **Sincronizado** / **Solo local** en detalle; tests `historySyncDelete.test.js`.

**Objetivo:** Portafolio nube + local no duplica ni pierde datos silenciosamente.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `historySync.js` |

**Archivos**

- `src/research/historySync.js` — delete remoto, tombstones, merge filtrado, flush al sync
- `src/ui/portfolio.js` — borrar/quitar corazón llama delete nube
- `tests/historySyncDelete.test.js`

**Pasos**

1. Al eliminar producto local, `delete` en `research_reports` por slug.
2. Toast si sync falla (offline); tombstone evita que reaparezca al merge.
3. Indicador "Sincronizado" / "Solo local" en detalle portafolio.

**Criterio**

- Eliminar item logueado lo quita tras reload en otro dispositivo (mismo usuario).

**Prueba manual:** Dos browsers, misma cuenta Supabase.

---

### T20 — Rate limiting / abuso proxy (server-side)

> **Estado (2026-08-05):** ⬜ No iniciado — sin migración `005`; solo cuota diaria en proxy.

**Objetivo:** Proteger costo Gemini del fundador.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | T03 |
| **Paralelizable** | Solo en `gemini-proxy` |

**Archivos**

- `supabase/functions/gemini-proxy/index.ts`
- `supabase/migrations/005_proxy_abuse.sql` (nuevo) — p.ej. límite por minuto, tamaño payload

**Pasos**

1. Rechazar `contents` > N caracteres.
2. Cooldown 30s entre sesiones nuevas por user.
3. Log estructurado (sin prompt completo — privacidad).

**Criterio:** Spam 10 req/10s → 429 con mensaje español en cliente.

---

### T21 — Privacidad BYOK: aclaraciones y no loguear claves

> **Estado (2026-08-05):** 🟡 Parcial — input password + nota de seguridad; falta copy explícito “no se envía a DropDeep…”.

**Objetivo:** Usuario entiende dónde vive la clave; auditoría de fugas.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/ui/geminiKeyBanner.js`, `index.html` (settings modal)
- `src/utils/geminiStorage.js`
- Grep repo: `console.log.*key`, `VITE_.*GEMINI`

**Pasos**

1. Settings: texto "La clave no se envía a DropDeep; solo a Google (o proxy si inicias sesión)".
2. Auditar que input type password no persiste en URL.
3. Documentar en `docs/MANUAL.md`.

**Criterio:** Network tab BYOK: requests solo a `generativelanguage.googleapis.com`.

---

### T22 — Bundle: auto-host o lazy-load Chart.js y Lucide

> **Estado (2026-08-05):** ⬜ No iniciado — siguen CDN en `index.html`; no están deps npm.

**Objetivo:** Reducir dependencia CDN y peso inicial.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `index.html`, `vite.config.js`, `package.json` |

**Archivos**

- `package.json` — `chart.js`, `lucide` npm
- `src/main.js` o `ui/charts.js` — dynamic import
- `index.html` — quitar CDN scripts
- CSP en `index.html` — ajustar `script-src`

**Pasos**

1. Import Lucide icons on demand en `main.js`.
2. Chart solo en reporte/portafolio vía dynamic import.
3. Medir `dist/assets` antes/después.

**Criterio:** Build pasa; app funciona offline para assets locales post-visita.

**Prueba:** Lighthouse o tamaño bundle en CI artifact.

---

### T23 — Accesibilidad básica (modales, navegación, formularios)

> **Estado (2026-08-05):** ⬜ No iniciado — sin `aria-modal` / focus trap / Escape en modales.

**Objetivo:** WCAG mínimo viable — foco, labels, aria.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `index.html`, modales |

**Archivos**

- `index.html` — copiloto, manual eval, auth
- `src/ui/authModal.js`, `copilotPanel.js`
- `src/style.css` — `:focus-visible`

**Pasos**

1. Trap focus en modales abiertos.
2. `aria-modal="true"`, `role="dialog"`.
3. Cerrar con Escape.
4. Contraste badges en `--text-muted`.

**Criterio:** Tab solo dentro modal; Escape cierra copiloto.

**Prueba manual:** Teclado solo, sin ratón.

---

### T24 — Responsive móvil: copiloto y reporte

> **Estado (2026-08-05):** 🟡 Parcial — reporte con tabs horizontales bajo 900px; copiloto sin full-screen bajo 640px ni touch targets 44px.

**Objetivo:** Paste-back usable en móvil (textareas, botones).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `style.css` |

**Archivos**

- `src/style.css` — `.copilot-body`, `.report-layout`, nav header
- `index.html`

**Pasos**

1. Modales full-screen < 640px.
2. Sidebar reporte → tabs horizontales scroll.
3. Touch targets ≥ 44px.

**Criterio:** DevTools iPhone SE — copiloto usable sin scroll horizontal.

---

### T25 — Tests unitarios `reportParse` + `manualRubric`

> **Estado (2026-08-05):** ✅ Hecho — Vitest (`npm test`) + suite parse/rubric/Audisio en `main` vía stack #12.

**Objetivo:** CI no frágil — lógica pura sin browser.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Bajo |
| **Dependencias** | T01 refuerza valor |
| **Paralelizable** | Sí |

**Archivos**

- `tests/reportParse.test.js`
- `tests/manualRubric.test.js`
- `package.json` — `vitest` devDependency
- `.github/workflows/ci.yml`

**Pasos**

1. Vitest + casos: JSON markdown, validateStepPayload errors, computeManualEvaluation verdicts.
2. CI: `npm test` en Node 22.

**Criterio:** 15+ tests pasan; no requieren red.

---

### T26 — CI mínimo: build + test en PR

> **Estado (2026-08-05):** ⬜ No iniciado — subsumido por **T36** (mismo objetivo; preferir T36).

**Objetivo:** No depender solo de deploy Pages para detectar roturas.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T25, T08 |
| **Paralelizable** | Sí (workflow nuevo) |

**Archivos**

- `.github/workflows/ci.yml` (nuevo)

**Pasos**

1. Jobs: `npm ci`, `npm run build`, `npm test`, opcional `test:e2e` en schedule.
2. No bloquear deploy si E2E flaky — separar required checks.

**Criterio:** PR muestra check verde build+unit.

---

### T27 — Unificar prompts API con `reportSchema.buildCopilotPrompt`

> **Estado (2026-07-29):** ✅ Hecho — `e3b43d1`. `buildApiPrompt()` en `reportSchema.js`; `gemini.js` sin prompts inline duplicados.

**Objetivo:** Eliminar drift entre prompts copiloto y API (complemento de T01).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | T01 |
| **Paralelizable** | No — misma zona |

**Archivos**

- `src/research/reportSchema.js`
- `src/research/gemini.js`

**Pasos**

1. Añadir `buildApiPrompt(stepId, ctx)` que extienda copiloto con instrucciones grounding/search.
2. Reemplazar strings inline en `gemini.js`.

**Criterio:** Diff de prompts paso 1 copiloto vs API solo difiere en cláusulas de búsqueda.

---

### T28 — Caché: invalidar al cambiar modo o fuente

> **Estado (2026-08-05):** ⬜ No iniciado — `getCacheKey(query, language)` sin source/mode.

**Objetivo:** No servir reporte API cacheado cuando usuario elige copiloto (o viceversa).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/research/cache.js` — incluir `_source`, `_researchMode` en clave
- `src/research/flow.js` — `openCacheModal` muestra origen

**Pasos**

1. `getCacheKey(query, language, source, mode)`.
2. Modal caché: "Reporte API Completo del …" vs "Copiloto Rápido …".

**Criterio:** Mismo producto, distinta ruta → no reutiliza caché cruzada.

---

### T29 — Product Score: documentar y alinear con eval manual

> **Estado (2026-08-05):** 🟡 Parcial — pesos en MANUAL + comentarios `scoring.js`; badge del informe sin tooltip.

**Objetivo:** Principiante entiende diferencia Product Score (datos reporte) vs eval manual (criterios propios).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/ui/report.js` — tooltip Product Score
- `src/research/scoring.js` — comentario exportable
- `docs/MANUAL.md`

**Pasos**

1. Tooltip con pesos (margin 25%, saturation 20%, …).
2. Enlace "Completar evaluación manual" junto al score.

**Criterio:** Hover score muestra fórmula en español.

---

### T30 — Limpiar código muerto (`reportGenerator.js`, shim `data.js`)

> **Estado (2026-08-05):** ✅ Hecho — shim `src/data.js` eliminado (PR #4).

**Objetivo:** Reducir confusión para futuros agentes.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/data/reportGenerator.js` — eliminar si cero imports (verificar `grep`)
- `src/data.js` — quitar export roto o reexportar desde `competitorAnalysis.js` si existe
- `src/data/index.js`

**Pasos**

1. `grep -r reportGenerator` — si vacío, delete.
2. Arreglar o eliminar `data.js` shim.
3. `npm run build`.

**Criterio:** Build pasa; no exports rotos.

---

### T31 — Meta Hidden Interests: disclaimer visible por defecto

> **Estado (2026-08-05):** 🟡 Parcial — disclaimer en HTML pero `.hidden` hasta que hay resultados de búsqueda.

**Objetivo:** Datos curados estáticos (`metaInterests.js`) no parecen audiencias Meta en vivo.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `src/ui/spy.js` — `#meta-interests-disclaimer`
- `index.html`

**Pasos**

1. Disclaimer visible sin necesidad de búsqueda.
2. Texto: "Lista curada offline para inspiración — verifica en Meta Ads Manager".

**Criterio:** Abrir tab Meta → disclaimer visible.

---

### T32 — Enlace ayuda in-app → manual (cuando exista URL estable)

> **Estado (2026-07-29):** ✅ Hecho — `7aafdea`. `#help-manual-btn` y `#user-menu-help-link` en `index.html` → `docs/MANUAL.md` en GitHub.

**Objetivo:** Principiantes acceden a documentación desde la app.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna (otro agente puede estar editando esto) |
| **Paralelizable** | Coordinar — solapa `index.html`, README |

**Archivos**

- `index.html` — footer o menú usuario
- URL: `https://github.com/oscarkleinkopf/Dropdeep/blob/master/docs/MANUAL.md`

**Pasos**

1. Link "Ayuda" abre manual en nueva pestaña.
2. Actualizar MANUAL si cambia ancla.

**Criterio:** Clic Ayuda abre MANUAL.md correcto.

---

### T33 — Prioridad BYOK sobre proxy (o selector explícito)

> **Estado (2026-07-29):** ✅ Hecho — `getGeminiRoute()` en `src/config/geminiRoute.js`; BYOK guardada gana sobre proxy con sesión; logs terminal BYOK/proxy; hint Ajustes + manual actualizado.

**Objetivo:** Si el usuario guardó clave Gemini en Ajustes, Deep Research y Spy usan **BYOK** por defecto aunque haya sesión + `VITE_GEMINI_PROXY=true`. Opcional: selector en Ajustes “Usar: Mi clave | Proxy (cuota diaria)”.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 (dogfooding) |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `flow.js`, `gemini.js`, `spy.js`, `geminiKeyBanner.js` |

**Archivos**

- `src/research/flow.js` — `runApiResearchDirect`: BYOK si `hasGeminiKey()` y preferencia ≠ `proxy`
- `src/research/gemini.js` — `useProxy` solo si no hay BYOK elegida
- `src/ui/spy.js` — misma regla que API
- `src/utils/geminiStorage.js` o nuevo `src/config/geminiRoute.js` — `getGeminiRoute(): 'byok' | 'proxy' | 'auto'`
- `src/ui/geminiKeyBanner.js`, `index.html` (settings) — toggle ruta Gemini
- `docs/MANUAL.md`, `CHANGELOG.md` — actualizar tabla prioridad proxy vs BYOK

**Pasos**

1. Definir precedencia: `BYOK guardada` > `proxy con sesión` > fallback copiloto.
2. Persistir preferencia `dropdeep_gemini_route` (`auto` default = BYOK si existe clave).
3. Terminal API debe loguear “Usando BYOK” vs “Usando proxy”.
4. Spy reutiliza helper compartido (no duplicar lógica).

**Criterio de aceptación**

- Logueado + BYOK + proxy activo → Deep Research llama `generativelanguage.googleapis.com`, **no** `gemini-proxy`.
- Sin BYOK + logueado → proxy como hoy.
- Selector “Forzar proxy” sigue consumiendo cuota diaria.

**Prueba manual**

1. Login + pegar BYOK en Ajustes + proxy activo en sitio.
2. Ejecutar Deep Research Completo — network tab sin invoke `gemini-proxy`.
3. Cambiar a “Usar proxy” — consume cuota, hint N/M actualiza.

**Riesgos / NO romper**

- Anon sin BYOK sigue yendo a copiloto si elige API sin clave.
- Cuota proxy no debe incrementarse en llamadas BYOK.

---

### T34 — Gráfico de tendencia honesto (sin random ni copy engañoso)

> **Estado (2026-07-29):** ✅ Hecho — `charts.js` sin `Math.random()`; serie determinista desde `report.trend` o N/A; copy sección 03 + manual honestos.

**Objetivo:** El gráfico de 12 meses no usa datos aleatorios ni afirma “Google Trends en vivo” si no hay fuente real.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `charts.js`, `report.js` |

**Archivos**

- `src/ui/charts.js` — eliminar `Math.random()`; derivar curva determinista de `report.trend` (string %) o línea plana
- `src/ui/report.js` — copy sección tendencias: “Ilustrativo basado en tendencia del informe — no Google Trends en vivo”
- `docs/MANUAL.md` — aclarar naturaleza del gráfico

**Pasos**

1. Función `buildTrendSeries(report)` → 12 puntos monotónicos acordes a `report.trend`.
2. Mismo producto + mismo trend → misma curva en recargas.
3. Si `report.trend` ausente, mostrar mensaje “Sin dato de tendencia” en lugar de gráfico falso.

**Criterio de aceptación**

- Dos recargas del mismo reporte → gráfico idéntico.
- Copy no menciona “Google Trends recopilado” sin grounding real.

**Prueba manual:** Abrir reporte copiloto → sección 03 → verificar estabilidad y disclaimer.

**NO romper:** Chart.js sigue renderizando; sentiment/projection charts intactos.

---

### T35 — Captura feedback dogfooding por reporte (local)

> **Estado (2026-08-05):** ⬜ No iniciado — sin `dropdeep_report_feedback_*` ni panel en `report.js`.

**Objetivo:** Tras revisar un informe, el founder (y cualquier usuario) puede registrar “¿Te ayudó a decidir?” sin backend — para iterar producto con señal real.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 (dogfooding) |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `report.js`, `style.css` |

**Archivos**

- `src/ui/report.js` — panel compacto al final: 👍 Sí / 👎 No / “Aún no sé” + textarea opcional (280 chars)
- `src/state.js` o `src/utils/feedbackStorage.js` (nuevo) — `localStorage` clave `dropdeep_report_feedback_{slug}`
- `src/ui/portfolio.js` — icono discreto si hay feedback guardado
- `docs/MANUAL.md`, `CHANGELOG.md`

**Pasos**

1. Esquema `{ productSlug, helpful: 'yes'|'no'|'unsure', note, updatedAt }`.
2. Guardar al pulsar; toast confirmación.
3. Export JSON portafolio **no** incluye feedback (o sección separada opcional).

**Criterio de aceptación**

- Feedback persiste tras F5; no requiere auth ni red.
- Panel no bloquea scroll ni CTAs existentes.

**Prueba manual:** Completar copiloto → marcar “Sí” + nota → recargar → ver estado restaurado.

**NO romper:** Privacidad — solo localStorage; sin enviar a Supabase.

---

### T36 — CI mínimo: build + unit tests (sin bloquear deploy)

> **Estado (2026-08-05):** ✅ Hecho — `.github/workflows/ci.yml` (Node 22, test + build).

**Objetivo:** Complemento de T26 orientado a dogfooding: detectar roturas en `reportParse` / `manualRubric` en cada push, sin flaky E2E como gate.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T25 |
| **Paralelizable** | Sí (workflow nuevo) |

**Archivos**

- `.github/workflows/ci.yml` (nuevo) — `npm ci`, `npm run build`, `npm test`
- `package.json` — scripts `test`, devDependency `vitest`
- `tests/reportParse.test.js`, `tests/manualRubric.test.js`

**Pasos**

1. Job en PR/push a `master`; Node 22 (alineado con deploy).
2. Deploy Pages **independiente** — CI fallido no impide deploy manual si se desea (documentar).
3. Badge opcional en README.

**Criterio de aceptación**

- Push con test roto → check CI rojo visible en GitHub.
- Sin secretos Supabase requeridos para unit tests.

**Prueba manual:** `npm test` local pasa; romper assert a propósito → CI falla.

---

### T37 — Pin acciones GitHub y eliminar warnings deprecación

> **Estado (2026-08-05):** ✅ Hecho — `actions/checkout@v5`, `setup-node@v5`, Node 22 en `deploy-pages.yml`. Residual: alinear pins cuando exista `ci.yml` (T36).

**Objetivo:** Mantener workflow deploy sin warnings Node 20; acciones en majors recientes.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Bajo / Bajo |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí |

**Archivos**

- `.github/workflows/deploy-pages.yml` — verificar `actions/checkout@v5`, `setup-node@v5`, Node 22
- `.github/workflows/ci.yml` — mismo pin cuando exista (T36)

**Pasos**

1. Ejecutar workflow en GitHub → Actions log sin “Node 20 deprecated”.
2. Documentar versión Node en README si difiere de local.

**Criterio:** Build log limpio de warnings deprecación Node.

**Nota:** Deploy ya usa Node 22 (`deploy-pages.yml:28`); tarea es verificación + pin consistente en CI nuevo.

---

### T38 — Motor de reglas financieras Audisio (constantes + precio/margen)

> **Estado (2026-08-05):** ✅ Hecho — `audisioRules.js`, `pricingAudisio.js`, panel Precios Audisio (merge #12).

**Objetivo:** Codificar políticas §9.1 como módulo puro reutilizable (offline): multiplicador costo→PVP ≈2.5, margen neto objetivo 35%, rango PVP 40k–100k CLP, piso 20k CLP, margen bruto mínimo $15 USD, presupuesto test $300 USD.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 (metodología) |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Sí (archivos nuevos) |

**Archivos**

- Nuevo: `src/config/audisioRules.js` — constantes + helpers (`suggestRetailFromCost`, `checkPriceBandClp`, `netMarginTarget`, `grossMarginUsd`)
- Nuevo: `src/research/pricingAudisio.js` — cálculo con inputs usuario (costo AliExpress, FX CLP/USD editable, comisiones)
- `src/ui/report.js` — panel “Precios Audisio” en snapshot o sección ops
- `docs/MANUAL.md`, `CHANGELOG.md`

**Pasos**

1. Constantes con comentarios citando §9; FX **no** live — default documentado + input usuario.
2. Dado costo origen: sugerir PVP ≈ costo×2.5; flags si bajo 20k CLP o fuera de 40k–100k.
3. Mostrar margen bruto USD y si cumple mínimo $15; hint oferta/regalo para acercarse a 35% neto.
4. Disclaimer UI: “Reglas del método Audisio & Domingo — no cotización en vivo”.

**Criterio de aceptación**

- Sin API: usuario ingresa costo 10 USD → ve PVP sugerido ~25 USD / equivalente CLP con FX editable.
- PVP bajo 20k CLP → alerta bloqueante “no vender bajo este piso”.
- `npm run build` pasa.

**NO romper:** Calculadora ROAS/CPA actual; añadir, no reemplazar a ciegas.

---

### T39 — Rúbrica Winner Audisio (gates + alineación eval manual)

> **Estado (2026-08-05):** ✅ Hecho — pilares Winner + gates en evaluación manual (merge #12).

**Objetivo:** Evaluación manual (y opcionalmente Product Score) emite veredicto Winner alineado al método: Solución / Emoción / WOW (mín. 1, ideal 3), caja no mayor que zapatos, margen bruto sobre $15 USD, CPA test $5–$7 (máx $12–$15; $20 solo ticket ~$100), calidad + atemporalidad.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P0 (metodología) |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | T38 (margen absoluto / precio) |
| **Paralelizable** | Solapa `manualRubric.js`, `manualEvaluation.js`, `scoring.js` |

**Archivos**

- `src/research/manualRubric.js` — separar `problemWow` en 3 criterios o checkboxes; gates duros
- `src/ui/manualEvaluation.js`, `index.html` — UI de gates
- `src/research/scoring.js` — `getNextDecision` menciona gates Winner
- Tests: extender T25 con casos Winner
- `docs/MANUAL.md`, `CHANGELOG.md`

**Pasos**

1. Criterios booleanos/slider: `solvesPain`, `emotionalHook`, `wowFactor` — fail si los 3 son falsos/bajos.
2. Gate tamaño/peso (reusar `shippingSize` con umbral).
3. Gate margen bruto USD (desde T38 o inputs rubrica).
4. Campo CPA proyectado (usuario) vs bandas Audisio → contribución + alerta.
5. Veredicto: si falla gate indispensable → no puede ser “Lanzar” aunque score ≥70.

**Criterio de aceptación**

- Producto sin solución/emoción/WOW → Descartar o Validar con explicación explícita del gate.
- Margen $10 USD → no “Lanzar”.
- Offline, sin Gemini.

---

### T40 — Auditor Meta Ads Chile (umbrales offline)

> **Estado (2026-08-05):** ✅ Hecho — Spy Auditoría Meta Ads Chile offline (merge #12).

**Objetivo:** Herramienta offline: inputs CTR, CPC, ATC, CPM, venta, costos → CPA Máximo Audisio + semáforo de umbrales Chile.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Medio |
| **Dependencias** | T38 (componentes de margen para CPA máx) |
| **Paralelizable** | Parcial — UI nueva; no tocar Spy API |

**Archivos**

- Nuevo: `src/research/metaAdsAudit.js` — fórmulas puras
- Nuevo UI: sección en Spy o vista “Auditoría ads” / panel en reporte
- `index.html`, `src/events.js`, `src/style.css`
- `docs/MANUAL.md`, `CHANGELOG.md`
- Tests unitarios fórmulas (con T25/T44)

**Fórmulas / umbrales (codificar exactamente)**

- CPA Máx = margen final tras: costo AliExpress+IVA 19%, comisión pasarela (MP), comisión Shopify, IVA venta 10–19% (input).
- CTR: bajo 2% malo; 3–4% bueno; 6–8% excelente.
- CPC: ideal 100–200 CLP; techo aceptable bajo 300 CLP.
- ATC: normal 1k–3k CLP; tolerar si = 1/3–1/5 del CPA máx.
- CPM Chile: 3k–6k tipico; 10k–15k OK en nichos competitivos si tráfico calidad.

**Criterio de aceptación**

- Usuario ingresa métricas → diagnóstico en español con semáforo; si CPA campaña &gt; CPA máx → “estás perdiendo plata”.
- Cero llamadas a Meta API; disclaimer “umbrales de referencia del método, no benchmark en vivo”.

**NO romper:** T12 comparador de titulares; Spy inferido (T11).

---

### T41 — Kit creativos VSL + checklist de lanzamiento (Audisio)

> **Estado (2026-08-05):** ✅ Hecho — §24 VSL + checklist + export kit (merge #12).

**Objetivo:** En informe o Prompt Hub: plantillas de guión VSL (20–60s), tipografías (Montserrat 13 CapCut; Poppins Canva; hook MAYÚSCULAS negro/blanco), locución ElevenLabs 1.15x, checklist lanzamiento (mín. 5 videos + 5–10 imágenes; warm-up Interacción $5/día 1–2 días; budget inicial $10/día × 4 días principiantes / $20 experimentados; sin segmentación manual).

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna (puede ir en paralelo a T38) |
| **Paralelizable** | Solapa `report.js`, `promptHub.js`, `whatsappScripts.js` patterns |

**Archivos**

- Nuevo: `src/research/vslAudisio.js` o extensión `reportSchema` prompts
- `src/ui/report.js` / `promptHub.js` — sección checklist
- `docs/MANUAL.md`, `CHANGELOG.md`

**Criterio de aceptación**

- Checklist marcable offline; guión VSL exportable en kit MD.
- Copy no inventa rendimiento de ads.

---

### T42 — Presupuesto de testeo $300 USD + autofinanciamiento en ops

> **Estado (2026-08-05):** ✅ Hecho — Montecarlo anclado a pool $300 / presets $10–$20 (merge #12).

**Objetivo:** Conectar §20 Montecarlo / calculadora con plan de test: $300 USD primer mes–mes y medio; proyección días a $10–20/día; aviso cuando CPA proyectado agota budget sin aprendizaje.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P2 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T38, Montecarlo ya en `montecarlo.js` |
| **Paralelizable** | Solapa `report.js`, `montecarlo.js` |

**Criterio:** Defaults Audisio en inputs Montecarlo; texto “presupuesto de testeo del método”.

---

### T43 — Documentar metodología en MANUAL + disclaimers CLP/Chile

> **Estado (2026-08-05):** ✅ Hecho — MANUAL §12 + Ayuda deep-link (merge #12).

**Objetivo:** `docs/MANUAL.md` explica método Audisio & Domingo, cuándo usar auditor ads, FX editable, y que no hay sync Meta. Glosario: CPA máx, ATC, Winner gates.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | Ideal tras T38–T40 (o docs stub primero) |
| **Paralelizable** | Sí |

**Criterio:** Sección manual enlazada desde Ayuda; CHANGELOG entrada “Metodología Audisio”.

---

### T44 — Tests unitarios fórmulas Audisio

> **Estado (2026-08-05):** ✅ Hecho — tests pricing/meta/gates/montecarlo/vsl (≥12 asserts Audisio; merge #12).

**Objetivo:** Vitest para `audisioRules`, `pricingAudisio`, `metaAdsAudit`, gates Winner — sin red.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Alto / Bajo |
| **Dependencias** | T38, T39, T40, T25 |
| **Paralelizable** | Sí (archivos `tests/`) |

**Criterio:** ≥12 asserts (multiplicador 2.5, piso 20k CLP, CPA máx, CTR bands, gate 0/3 criterios).

---

## 6. Orden sugerido de ejecución

### Fase metodología Audisio (nueva — 2026-08-05)

```
T38 → T39 → T40 → T44
  │      │      └── auditor Meta Ads Chile (offline)
  │      └── rúbrica Winner + gates
  └── constantes precio/margen CLP

Paralelo: T41 (VSL/checklist) || T43 (docs) || T42 (Montecarlo $300)
```

### Fase dogfooding — founder solo (actualizado 2026-08-05)

Ya hechos en el camino crítico: **T33, T09, T05, T16, T10, T34**.

**Siguiente oleada recomendada (cerrar cortes + metodología + red de seguridad):**

```
Bundles → T30 → T38 → T39 → T25/T44 → T36 → T40 → T41
  cortes     │      metodología pricing/Winner    │      ads + creativos
             └── shim                          tests
```

**Top prioridades ahora**

| Orden | ID | Por qué primero |
|-------|-----|-----------------|
| 0 | **Bundles** | Cierre corte Antigravity (rápido) |
| 1 | **T30** | Shim roto |
| 2 | **T38 + T39** | Encarnar método Audisio en pricing + Winner (norte de producto) |
| 3 | **T25 + T44 + T36** | Tests de parse/rubric **y** fórmulas Audisio + CI |
| 4 | **T40** | Auditor ads Chile — valor dogfooding post-lanzamiento |
| 5 | **T41 + T43** | Creativos VSL + manual |

**Oleada P1 restante (infra)**

- T19, T20, T08, T13/T14, T18, T35 (T06/T07/T11-A ✅)

### Fase 0 — Integridad y confianza (P0) — ✅ COMPLETADA

```
T03 → T01 → T02 → T27 → T04 → T12   (commits e3b43d1, prod Supabase jul 2026)
```

### Fase 1 — Calidad camino gratis + tests (P1) — en curso

| Stream A (copiloto) | Stream B (infra + tests) | Stream C (honestidad UI) | Stream D (Audisio) |
|---------------------|--------------------------|--------------------------|--------------------|
| T06✅, T07✅ | T25✅, T36✅, T08⬜, T44✅ | T11✅, T35⬜ | T38✅, T39✅ |
| T13🟡, T14🟡 | T19🟡, T20⬜ | Bundles🟡 | T40⬜, T41⬜, T42⬜, T43⬜ |

### Fase 2 — Retención y robustez (P1–P2)

```
T19 (cerrar delete), T20  ||  T13/T14 (cerrar), T15✅
T18 (modal límite)  ||  T21🟡
```

### Fase 3 — Polish (P2)

```
T22⬜, T23⬜, T24🟡  ||  T28⬜, T29🟡, T30🟡, T31🟡, T17⬜
T37✅ (re-verificar pins al crear ci.yml)
```

### Matriz de solapamiento de archivos (evitar paralelo)

| Archivo | Tareas que lo tocan |
|---------|---------------------|
| `src/ui/spy.js` | T11, T31, T40 (si auditor vive en Spy) |
| `src/research/copilotFlow.js` | T07 |
| `src/ui/copilotPanel.js` | T06, T07, T17 |
| `src/ui/report.js` | T29, T35, Bundles, T38, T41, T42 |
| `src/research/manualRubric.js` | T39, T44 |
| `src/research/bundles.js` | Bundles residual |
| `src/config/audisioRules.js` | T38, T39, T40, T44 (nuevo) |
| `supabase/functions/gemini-proxy` | T20 |
| `index.html` | T14, T18, T23, T24, T40, T41 |
| `.github/workflows/*` | T08, T26/T36 |
| `src/data.js` | T30 |

---

## 7. Backlog diferido

| Item | Razón de postponer |
|------|-------------------|
| **Spy Opción B** (scraping Shopify/Wappalyzer real) | Requiere Edge Function con fetch externo, legal/robots, mantenimiento; Opción A suficiente para honestidad MVP. |
| **Stripe / billing / tier Pro real** | Explícitamente prohibido en reglas del producto. |
| **Netlify deploy** | Proyecto usa GitHub Pages (`deploy-pages.yml`); `netlify.toml` existe pero no es camino principal. |
| **Comparar >3 productos** | Mensaje "Pro próximamente" en UI — sin producto Pro definido. |
| **Sincronización offline-first completa** | Supabase sync es best-effort; CRDT/queue es over-engineering hasta validar uso. |
| **i18n inglés** | Producto es UI español; `outputLanguage` en Gemini no implica UI bilingüe. |
| **Reescritura total `report.js`** | Archivo grande pero funcional; preferir extracción incremental. |
| **Integración Meta Ads API / Marketing API** | Coste, OAuth, fuera de alcance. El **auditor T40** cubre el método con inputs manuales (Audisio). |
| **Tipo de cambio CLP/USD en vivo** | FX editable por usuario (T38); feed FX sería dependencia y fuente de desconfianza. |
| **Pago contraentrega / Dropi como flujo** | Explicitamente fuera del método Audisio — no modelar como recomendado. |
| **Imagen/mockup generation in-app** | Sección prompts IA en reporte es copy-paste externo; gateway Netlify no configurado. |
| **ElevenLabs / CapCut automatizados** | T41 documenta specs; automatizar edición/voz está fuera de MVP. |

---

## 8. Índice rápido de tareas

Leyenda: ✅ Hecho · 🟡 Parcial (posible corte Antigravity) · ⬜ No iniciado

| ID | Título | P | Estado | Nota auditoría 2026-08-05 |
|----|--------|---|--------|---------------------------|
| T01 | Refactor API → `reportParse.js` | P0 | ✅ | Verificado |
| T02 | Fallbacks API honestos | P0 | ✅ | Verificado |
| T03 | Cuota proxy por investigación | P0 | ✅ | Verificado + prod |
| T04 | Copiloto 1 pegado (express) | P0 | ✅ | Verificado |
| T05 | Persistir sesión copiloto | P1 | ✅ | Verificado |
| T06 | Validación JSON accionable | P1 | ✅ | Tips parse + ejemplo JSON en modal |
| T07 | Recuperación errores copiloto | P1 | ✅ | Peek pasos + caption; error no avanza índice |
| T08 | E2E Playwright paste-back | P1 | ⬜ | Sin Playwright |
| T09 | Bloque "Próxima decisión" | P1 | ✅ | Verificado |
| T10 | Comparador + eval manual | P1 | ✅ | Verificado |
| T11 | Spy honesto / fuente real | P1 | ✅ | Opción A en main; Opción B diferida |
| T12 | A/B heurístico (no CTR falso) | P1 | ✅ | Verificado |
| T13 | Onboarding alineado copiloto | P2 | 🟡 | CTA no setea ruta copiloto |
| T14 | Wizard sin dead-ends | P2 | 🟡 | Draft en feed; falta portafolio + CTAs |
| T15 | Estados vacíos CTAs | P2 | ✅ | Verificado |
| T16 | UI cuota proxy restante | P1 | ✅ | Verificado (menú usuario) |
| T17 | Errores unificados copiloto | P2 | ⬜ | Sin `classifyGeminiError` en copiloto |
| T18 | UX límite portafolio 10 | P2 | 🟡 | Toast+export; sin modal |
| T19 | Sync remoto borrado/conflictos | P1 | 🟡 | Upsert sí; delete remoto no |
| T20 | Rate limit abuso proxy | P1 | ⬜ | Sin migración 005 |
| T21 | Privacidad BYOK | P2 | 🟡 | Falta copy explícito destino clave |
| T22 | Bundle Chart/Lucide | P2 | ⬜ | Sigue CDN |
| T23 | Accesibilidad modales | P2 | ⬜ | Sin aria/focus trap |
| T24 | Móvil copiloto/reporte | P2 | 🟡 | Reporte OK parcial; copiloto no |
| T25 | Tests unitarios parse/rubric | P1 | ✅ | Vitest en `main` |
| T26 | CI build + test (legacy) | P1 | ✅ | Cubierto por T36 |
| T27 | Unificar prompts API/schema | P1 | ✅ | Verificado |
| T28 | Caché por fuente/modo | P2 | ⬜ | Clave solo query+lang |
| T29 | Documentar Product Score | P2 | 🟡 | Docs sí; tooltip UI no |
| T30 | Limpiar código muerto | P2 | ✅ | Shim eliminado (#4) |
| T31 | Disclaimer Meta interests | P2 | 🟡 | Hidden hasta búsqueda |
| T32 | Enlace ayuda → manual | P2 | ✅ | Verificado |
| T33 | BYOK gana sobre proxy | P0 | ✅ | Verificado |
| T34 | Gráfico tendencia honesto | P1 | ✅ | Verificado |
| T35 | Feedback dogfooding local | P1 | ⬜ | Sin storage/panel |
| T36 | CI build + unit tests | P1 | ✅ | `ci.yml` en `main` |
| T37 | Pin acciones GitHub / Node | P2 | ✅ | checkout/setup-node v5 + Node 22 |
| T38 | Reglas financieras Audisio (CLP/margen) | P0 | ✅ | Merge #12 |
| T39 | Rúbrica Winner + gates Audisio | P0 | ✅ | Merge #12 |
| T40 | Auditor Meta Ads Chile offline | P1 | ✅ | Merge #12 |
| T41 | Kit VSL + checklist lanzamiento | P1 | ✅ | Merge #12 |
| T42 | Presupuesto test $300 en Montecarlo | P2 | ✅ | Merge #12 |
| T43 | MANUAL metodología Audisio | P1 | ✅ | Merge #12 |
| T44 | Tests fórmulas Audisio | P1 | ✅ | Merge #12 |
| — | Bundles ops §21 wire-up | — | ✅ | PR #5 |

---

## 9. Metodología Audisio & Domingo

> Fuente: instrucciones de sistema del consultor e-commerce (Audisio & Domingo), adoptadas como **norte de producto** el 2026-08-05. Codificar en T38–T44. **No inventar métricas** — las calculadoras usan inputs del usuario + umbrales fijos del método.

### 9.1 Políticas financieras y precios

| Regla | Valor |
|-------|-------|
| Margen neto objetivo | ~35% (facilitar con oferta/regalo de alto valor percibido) |
| Multiplicador costo → PVP | ≈ ×2.5 (ej. costo 10 → venta ~25) |
| Rango PVP recomendado | 40.000 – 100.000 CLP |
| Piso absoluto PVP | No vender bajo 20.000 CLP |
| Presupuesto ads de testeo | 300 USD primer mes / mes y medio → luego autofinanciar |
| Logística | AliExpress al inicio → proveedor privado con volumen |
| Fuera de método | Pago contraentrega; Dropi |

### 9.2 Calificación producto Winner (para testear en campaña)

1. **Indispensable — cumplir mínimo 1, ideal 3:** solución de problema · conexión emocional · efecto WOW.
2. **Dimensiones/peso:** empaque ligero, volumen ≤ caja de zapatos.
3. **Margen bruto:** más de 15 USD por unidad.
4. **CPA proyectado:** test inicial 5–7 USD; máx aceptable 12–15 USD; estirar a 20 USD solo si producto ~100 USD.
5. **Calidad + atemporalidad:** excelente funcionamiento; preferir no estacional.

### 9.3 Auditoría Meta Ads (Chile) — inputs del anunciante

**CPA máximo** = margen final tras: venta − costo AliExpress con IVA 19% − comisión pasarela (ej. Mercado Pago) − comisión Shopify − IVA de la venta (10–19%).  
Regla: el CPA de campaña **nunca** debe superar este CPA máximo.

| Métrica | Umbral método |
|---------|----------------|
| CTR | Mín. 2%; bueno 3–4%; excelente 6–8% |
| CPC | Ideal 100–200 CLP; aceptable bajo 300 CLP |
| ATC (costo add-to-cart) | Normal 1.000–3.000 CLP; tolerar si = 1/3–1/5 del CPA máx |
| CPM Chile | Típico 3.000–6.000 CLP; nichos competitivos 10.000–15.000 CLP OK si tráfico calidad |

### 9.4 Creativos y lanzamiento

- Video 20–60 s; guión **Hook (3–7 s) → Body → CTA** (urgencia / envío gratis).
- CapCut: Montserrat 13; Canva: Poppins; hook visual: MAYÚSCULAS negras sobre fondo blanco.
- Locución AI (ElevenLabs) ~1.15×; recortar silencios en CapCut.
- Lanzamiento: mín. 5 videos + 5–10 imágenes; cuentas nuevas: warm-up Interacción 5 USD/día × 1–2 días antes de Ventas; budget inicial 10 USD/día × ≥4 días (principiantes) o 20 USD/día (experimentados); **sin** segmentación manual (Advantage+ / inteligencia Meta).

### 9.5 Gap vs código actual (2026-08-05)

| Capacidad método | En DropDeep hoy | Tarea |
|------------------|-----------------|-------|
| Multiplicador 2.5 + bandas CLP | Snapshot USD genérico; sin piso 20k CLP | **T38** |
| Margen neto 35% / bruto $15 | Rubrica `margin` es slider % subjetivo | **T38 + T39** |
| Gates Winner (1 de 3) | `problemWow` unificado; sin hard gates | **T39** |
| CPA proyectado bandas 5–15 | CPA estimado simple CPC/conv en `report.js` | **T39 + T40** |
| CPA máximo con IVA/comisiones CL | No modelado | **T40** |
| Semáforo CTR/CPC/ATC/CPM Chile | No existe (T12 es heurística de titulares, no Ads) | **T40** |
| VSL Hook/Body/CTA + checklist 5 creativos | UGC/scripts genéricos; WhatsApp §23 | **T41** |
| Budget test 300 USD | Montecarlo sin ancla Audisio | **T42** |
| Docs método | MANUAL sin Audisio | **T43** |
| Tests fórmulas | Sin Vitest | **T44** (+ T25) |

### 9.6 Principios de implementación

1. **Offline-first:** todas las calculadoras Audisio funcionan sin Gemini ni Meta API.
2. **Etiquetar origen:** “Según método Audisio & Domingo” — nunca como “datos de Meta en vivo”.
3. **FX editable:** no hardcodear un dólar eterno sin permitir override.
4. **No contradecir honestidad:** T12 (sin CTR falso en titulares) sigue; T40 usa CTR **declarado por el usuario**.
5. **Compatibilidad:** mantener eval manual actual; Winner gates **añaden** restricciones al veredicto Lanzar, no borran el score 0–100.

---

*Actualizado 2026-08-05: auditoría mid-task + adopción metodología Audisio & Domingo (T38–T44). Verificar archivos antes de ejecutar cada tarea.*
