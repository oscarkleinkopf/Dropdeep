# Plan de mejoras DropDeep

> Documento ejecutable para agentes/bots sin contexto previo. **Solo planificación** — no implementar desde este archivo salvo que una tarea concreta lo indique explícitamente.

---

## Tabla de contenidos

1. [Contexto del producto y reglas fijas](#1-contexto-del-producto-y-reglas-fijas)
2. [Evaluación end-to-end (2026-07-29)](#2-evaluación-end-to-end-2026-07-29)
3. [Estado actual (qué ya existe)](#3-estado-actual-qué-ya-existe)
4. [Tareas numeradas (T01–T37)](#4-tareas-numeradas-t01t37)
5. [Orden sugerido de ejecución](#5-orden-sugerido-de-ejecución)
6. [Backlog diferido](#6-backlog-diferido)
7. [Índice rápido de tareas](#7-índice-rápido-de-tareas)

---

## 1. Contexto del producto y reglas fijas

### Contexto (breve)

**DropDeep** analiza productos para dropshipping, orientado a emprendedores principiantes. Ofrece investigación de mercado, copywriting, activos de campaña y validación de productos.

### Reglas fijas (no negociables)

| Regla | Detalle |
|-------|---------|
| **Ruta gratis sin API pagada** | Debe ser realmente útil y **nunca bloquearse**: packs por vertical (`src/data/verticalPacks.js`), **Modo Copiloto** con paste-back (`src/research/copilotFlow.js`), **Evaluación manual** determinista (`src/research/manualRubric.js`). |
| **API opcional** | Gemini BYOK (`src/utils/geminiStorage.js`) o proxy Supabase con cuota diaria (`supabase/functions/gemini-proxy/`) es un **acelerador**, no requisito. |
| **Prohibido** | Datos mock/simulados presentados como reales; Stripe/billing; secretos en git. |
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

### Top 5 debilidades (con evidencia)

| # | Debilidad | Archivos | Impacto |
|---|-----------|----------|---------|
| 1 | **BYOK ignorada si hay sesión + proxy** — usuario con clave guardada sigue consumiendo cuota proxy | `flow.js:54-56`, `gemini.js:377`, `spy.js:174-190` | Founder dogfooding con BYOK pierde control y cuota |
| 2 | **Gráfico “Google Trends” simulado con `Math.random()`** — copy afirma datos reales | `charts.js:13-16`, `report.js:545-548` | Fuga de confianza en informe copiloto/API |
| 3 | **Sin bloque “próxima decisión”** — comparador ignora eval manual para ganador (`Product Score` only) | `report.js` (T09 resuelto; comparador T10 pendiente) | Principiante no sabe lanzar/validar/descartar |
| 4 | **Sesión copiloto volátil** — cerrar modal = perder progreso | `copilotFlow.js` (T05 resuelto) | Fricción alta en flujo gratis multi-paso |
| 5 | **Sin tests ni CI** — solo deploy Pages | `package.json` (sin `test`), `.github/workflows/deploy-pages.yml` | Regresiones silenciosas en parse/rubric |

### Otras observaciones

- **Cuota proxy UI parcial:** hint `Proxy: N/M` solo tras usar proxy (`geminiProxy.js` + `researchMode.js`); no visible al login ni en menú usuario (T16 incompleto).
- **Spy inferido como verificado:** pixel/GA mostrados Sí/No definitivos (`spy.js:96-98`); disclaimer solo en empty state, no en resultados.
- **Sync remoto unidireccional:** `historySync.js` upsert al completar; `portfolio.js:308-324` borra solo localStorage.
- **Caché sin fuente/modo:** `cache.js:1-3` — misma clave para copiloto vs API.
- **Código muerto:** `src/data.js` exporta `generateCompetitorStoreAnalysis` inexistente en `data/index.js`; `reportGenerator.js` ya eliminado.
- **CI Node:** workflow ya usa Node **22** (`deploy-pages.yml:28`); falta job **test** separado (T26).

### Coherencia producto (ruta gratis → decisión)

| Paso | ¿Entrega valor? | Nota |
|------|-----------------|------|
| Wizard / onboarding | Sí | Empuja pack → copiloto; onboarding alineado (`onboarding.js`) |
| Copiloto Express | Sí | 1 pegado → Product Score + copys |
| Eval manual | Sí | Veredicto explícito offline |
| Reporte → guardar | Sí | Portafolio local + sync opcional |
| Reporte → decidir | **Parcial** | Score sí; falta CTA decisión integrada (T09) |
| Comparar | **Parcial** | Muestra eval manual pero ganador = Product Score |
| Export / kit | Sí | CSV/MD/JSON + sanitización |

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

### Deuda / inconsistencias observadas (post-sprint jul 2026)

1. ~~**BYOK pierde frente a proxy con sesión**~~ — resuelto T33 (`geminiRoute.js`).
2. ~~**Gráfico tendencia simulado**~~ — resuelto T34 (`charts.js` + copy `report.js`).
3. **Sesión copiloto volátil** — resuelto T05 (`copilotFlow.js` + `copilotPanel.js` + banner Inicio).
4. **Spy sin verificación** — Gemini infiere pixel/CMS; resultados sin badge “Inferido por IA” (T11-A pendiente).
5. **`src/data.js` shim roto** — export `generateCompetitorStoreAnalysis` no existe en `data/index.js` (T30).
6. **Sin tests E2E/unit** — paste-back crítico sin regresión automática (T08, T25, T26).
7. **Comparador no pondera eval manual** en fila “Cuál lanzar primero” (T10).
8. **Caché no distingue fuente/modo** — `getCacheKey(query, language)` solo (T28).

---

## 4. Tareas numeradas (T01–T37)

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

**Objetivo:** Tras error de validación, el usuario no pierde pasos ya completados.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Bajo |
| **Dependencias** | T05 recomendada |
| **Paralelizable** | Solapa `copilotFlow.js` |

**Archivos**

- `src/research/copilotFlow.js` — verificar que `processCopilotPaste` en catch **no** incrementa índice (ya correcto; auditar)
- `src/ui/copilotPanel.js` — botón "Paso anterior" solo lectura para revisar prompts completados

**Pasos**

1. Auditoría: confirmar que error no avanza `currentStepIndex`.
2. Añadir UI "Ver pasos completados" (lista colapsable).
3. Opcional: "Editar paso anterior" (avanzado, P2).

**Criterio de aceptación**

- Fallo en paso 3 no borra datos de pasos 1–2 en `partialReport`.
- Progreso bar refleja pasos completados.

**Prueba manual:** Copiloto 5 pasos; paso 3 inválido → reintentar → continuar al 4.

---

### T08 — Tests E2E paste-back del copiloto (Playwright)

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

**Objetivo:** Portafolio nube + local no duplica ni pierde datos silenciosamente.

| Campo | Valor |
|-------|-------|
| **Prioridad** | P1 |
| **Impacto / Esfuerzo** | Medio / Medio |
| **Dependencias** | Ninguna |
| **Paralelizable** | Solapa `historySync.js` |

**Archivos**

- `src/research/historySync.js`
- `supabase/migrations/002_research_reports.sql`
- `src/ui/portfolio.js` — borrar remoto al eliminar local

**Pasos**

1. Al eliminar producto local, `delete` en `research_reports` por slug.
2. Toast si sync falla (offline).
3. Indicador "Sincronizado" / "Solo local" en detalle portafolio.

**Criterio**

- Eliminar item logueado lo quita tras reload en otro dispositivo (mismo usuario).

**Prueba manual:** Dos browsers, misma cuenta Supabase.

---

### T20 — Rate limiting / abuso proxy (server-side)

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

## 5. Orden sugerido de ejecución

### Fase dogfooding — founder solo (prioridad jul 2026)

Objetivo: **uso diario productivo y honesto** antes de escalar. Orden recomendado:

```
T33 → T09 → T05 → T25 → T36 → T16 (completar badge)
  │      │      │       │
  │      │      │       └── red de seguridad mientras iteras
  │      │      └── no perder pegados a medias
  │      └── cerrar loop decisión en reporte
  └── BYOK usable con sesión (bloqueo real del founder)
```

**Top 5 para empezar ya**

| Orden | ID | Por qué primero |
|-------|-----|-----------------|
| 1 | **T33** | Founder con BYOK no debe gastar cuota proxy ni quedar atrapado en 429 |
| 2 | **T09** | Reporte debe responder “¿lanzo, valido o descarto?” — núcleo del producto |
| 3 | **T05** | Copiloto multi-paso frágil; dogfooding diario pierde trabajo |
| 4 | **T25 + T36** | Tests + CI antes de más cambios en parse/rubric |
| 5 | **T16** (completar) | Visibilidad cuota proxy restante antes de invertir en investigación |

**Siguiente oleada (P1, paralelo moderado)**

- T10, T34, T35, T08 (E2E paste-back), T06, T07, T11-A, T19, T20

### Fase 0 — Integridad y confianza (P0) — ✅ COMPLETADA

```
T03 → T01 → T02 → T27 → T04 → T12   (commits e3b43d1, prod Supabase jul 2026)
```

### Fase 1 — Calidad camino gratis + tests (P1)

Paralelo posible en **equipos separados**:

| Stream A (copiloto + decisión) | Stream B (infra + tests) | Stream C (honestidad UI) |
|-------------------------------|--------------------------|--------------------------|
| T05, T06, T07, T09 | T25, T36, T08 | T11-A, T34 |
| T33 (BYOK) | T16 (badge completo) | T35 (feedback) |

**Solapamiento crítico:** no paralelizar T33 con T16 en `userMenu.js` sin coordinar.

### Fase 2 — Retención y robustez (P1–P2)

```
T19, T20 (sync/abuso)  ||  T13, T14, T15 (onboarding/wizard/vacíos)
T10 (comparador + eval manual)  ||  T18 (límites portafolio)
```

### Fase 3 — Polish (P2)

```
T22, T23, T24  ||  T28, T29, T30, T31, T21, T17, T37
```

### Matriz de solapamiento de archivos (evitar paralelo)

| Archivo | Tareas que lo tocan |
|---------|---------------------|
| `src/research/flow.js` | T33 |
| `src/research/gemini.js` | T33 |
| `src/ui/spy.js` | T11, T33 |
| `src/research/copilotFlow.js` | T04✅, T05, T07 |
| `src/ui/copilotPanel.js` | T04✅, T05, T06, T07 |
| `src/ui/report.js` | T02✅, T09, T12✅, T29, T34, T35 |
| `src/ui/charts.js` | T34 |
| `supabase/functions/gemini-proxy` | T03✅, T16, T20 |
| `index.html` | T04✅, T23, T24, T32✅, T33 |
| `.github/workflows/*` | T08, T26, T36, T37 |

---

## 6. Backlog diferido

| Item | Razón de postponer |
|------|-------------------|
| **Spy Opción B** (scraping Shopify/Wappalyzer real) | Requiere Edge Function con fetch externo, legal/robots, mantenimiento; Opción A suficiente para honestidad MVP. |
| **Stripe / billing / tier Pro real** | Explícitamente prohibido en reglas del producto. |
| **Netlify deploy** | Proyecto usa GitHub Pages (`deploy-pages.yml`); `netlify.toml` existe pero no es camino principal. |
| **Comparar >3 productos** | Mensaje "Pro próximamente" en UI — sin producto Pro definido. |
| **Sincronización offline-first completa** | Supabase sync es best-effort; CRDT/queue es over-engineering hasta validar uso. |
| **i18n inglés** | Producto es UI español; `outputLanguage` en Gemini no implica UI bilingüe. |
| **Reescritura total `report.js`** | Archivo grande pero funcional; preferir extracción incremental (T09, T12). |
| **Integración Meta Ads API** | Coste, OAuth, fuera de alcance tier gratis. |
| **Imagen/mockup generation in-app** | Sección prompts IA en reporte es copy-paste externo; gateway Netlify no configurado. |

---

## 7. Índice rápido de tareas

| ID | Título | P | Estado |
|----|--------|---|--------|
| T01 | Refactor API → `reportParse.js` | P0 | ✅ `e3b43d1` |
| T02 | Fallbacks API honestos | P0 | ✅ `e3b43d1` |
| T03 | Cuota proxy por investigación | P0 | ✅ `e3b43d1` + prod |
| T04 | Copiloto 1 pegado (express) | P0 | ✅ `e3b43d1` |
| T05 | Persistir sesión copiloto | P1 | ✅ jul 2026 |
| T06 | Validación JSON accionable | P1 | pendiente |
| T07 | Recuperación errores copiloto | P1 | pendiente |
| T08 | E2E Playwright paste-back | P1 | pendiente |
| T09 | Bloque "Próxima decisión" en reporte | P1 | ✅ jul 2026 |
| T10 | Comparador + eval manual | P1 | ✅ jul 2026 |
| T11 | Spy honesto / fuente real | P1 | pendiente |
| T12 | A/B heurístico (no CTR falso) | P1 | ✅ `e3b43d1` |
| T13 | Onboarding alineado copiloto | P2 | pendiente |
| T14 | Wizard sin dead-ends | P2 | pendiente |
| T15 | Estados vacíos CTAs | P2 | pendiente |
| T16 | UI cuota proxy restante | P1 | ✅ jul 2026 |
| T17 | Errores unificados copiloto | P2 | pendiente |
| T18 | UX límite portafolio 10 | P2 | pendiente |
| T19 | Sync remoto borrado/conflictos | P1 | pendiente |
| T20 | Rate limit abuso proxy | P1 | pendiente |
| T21 | Privacidad BYOK | P2 | pendiente |
| T22 | Bundle Chart/Lucide | P2 | pendiente |
| T23 | Accesibilidad modales | P2 | pendiente |
| T24 | Móvil copiloto/reporte | P2 | pendiente |
| T25 | Tests unitarios parse/rubric | P1 | pendiente |
| T26 | CI build + test (legacy) | P1 | pendiente → ver T36 |
| T27 | Unificar prompts API/schema | P1 | ✅ `e3b43d1` |
| T28 | Caché por fuente/modo | P2 | pendiente |
| T29 | Documentar Product Score | P2 | pendiente |
| T30 | Limpiar código muerto | P2 | pendiente |
| T31 | Disclaimer Meta interests | P2 | pendiente |
| T32 | Enlace ayuda → manual | P2 | ✅ `7aafdea` |
| T33 | BYOK gana sobre proxy | P0 | ✅ jul 2026 |
| T34 | Gráfico tendencia honesto | P1 | ✅ jul 2026 |
| T35 | Feedback dogfooding local | P1 | **nuevo** |
| T36 | CI build + unit tests | P1 | **nuevo** |
| T37 | Pin acciones GitHub / Node | P2 | **nuevo** |

---

*Actualizado 2026-07-29 tras evaluación end-to-end y sprint `e3b43d1` + prod Supabase. Verificar archivos antes de ejecutar cada tarea — otro agente puede haber modificado docs en paralelo.*
