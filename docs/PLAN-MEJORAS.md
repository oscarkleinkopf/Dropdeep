# Plan de mejoras DropDeep

> Documento ejecutable para agentes/bots sin contexto previo. **Solo planificación** — no implementar desde este archivo salvo que una tarea concreta lo indique explícitamente.

---

## Tabla de contenidos

1. [Contexto del producto y reglas fijas](#1-contexto-del-producto-y-reglas-fijas)
2. [Estado actual (qué ya existe)](#2-estado-actual-qué-ya-existe)
3. [Tareas numeradas (T01–T32)](#3-tareas-numeradas-t01t32)
4. [Orden sugerido de ejecución](#4-orden-sugerido-de-ejecución)
5. [Backlog diferido](#5-backlog-diferido)
6. [Índice rápido de tareas](#6-índice-rápido-de-tareas)

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

Commits recientes (`master`): copiloto paste-back + evaluación manual → wizard primer producto + modos Rápido/Completo → packs verticales + kit de campaña → tier operativo gratis + cuota proxy → eliminación de mock research.

---

## 2. Estado actual (qué ya existe)

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
| `src/research/gemini.js` | `sanitizeReport()`, secuencia API **con prompts duplicados** y merge manual (no usa `reportParse.js`) |

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

### Deuda / inconsistencias ya observadas en código

1. **`gemini.js` no reutiliza `reportParse.js`** — prompts duplicados respecto a `reportSchema.js`; merge manual distinto al copiloto.
2. **Cuota proxy por llamada, no por investigación** — ~~cada paso Gemini invoca `gemini-proxy`~~ → **corregido** (T03): sesión UUID, migración 004.
3. **Fallbacks en API con plantillas genéricas** — ~~`gemini.js` rellena datos placeholder~~ → **corregido** (T02): `reportFallbacks.js`.
4. **Simulador A/B en reporte** — ~~`Math.random()` + “Simulador Científico”~~ → **corregido** (T12): comparador heurístico offline.
5. **Spy sin scraping real** — Gemini infiere desde URL; UI lo declara parcialmente (`spy.js` ~143) pero resultados pueden alucinarse.
6. **Sesión copiloto volátil** — cerrar modal = `cancelCopilotSession()` pierde progreso parcial.
7. **`src/data.js` shim roto** — exporta `generateCompetitorStoreAnalysis` desde `./data/index.js` pero `index.js` no lo reexporta; `src/data/reportGenerator.js` parece legacy sin imports.
8. **Sin tests E2E** del paste-back del copiloto.

---

## 3. Tareas numeradas (T01–T32)

---

### T01 — Refactorizar ruta API para reutilizar `reportParse.js`

> **Estado (2026-07-29):** ✅ Hecho — `gemini.js` usa `parseAndValidateStep`, `applyStepToReport`, `assembleCopilotReport` + `buildApiPrompt()`. Loop unificado por pasos API.

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

> **Estado (2026-07-29):** ✅ Hecho — `reportFallbacks.js`, catches sin plantillas; banner `_incompleteSections` + export MD.

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

> **Estado (2026-07-29):** ✅ Hecho — `004_research_session_quota.sql`, `researchSessionId` en proxy, docs actualizados. **Residual:** desplegar migración + Edge Function en Supabase prod; T16 badge completo pendiente (hint ligero en profundidad).

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

> **Estado (2026-07-29):** ✅ Hecho — `COPILOT_STEPS.ALL_IN_ONE`, toggle **Express**, default sin preferencia previa. **Deferred:** T05 persistencia sesión.

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

**Objetivo:** Comparar productos prioriza veredicto manual cuando existe, no solo Product Score de IA.

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

> **Estado (2026-07-29):** ✅ Hecho — comparador determinista, sin CTR ni “científico”.

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

> **Estado (2026-07-29):** ✅ Hecho — `buildApiPrompt()` en `reportSchema.js`; `gemini.js` sin prompts inline duplicados.

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

## 4. Orden sugerido de ejecución

### Fase 0 — Integridad y confianza (P0, secuencial)

```
T03 → T01 → T02 → T27
         ↓
       T04
```

- **T03** primero: sin esto el proxy es engañoso para usuarios logueados.
- **T01 + T27 + T02**: pipeline API honesto y unificado.
- **T04**: mayor impacto en ruta gratis (paralelo a T01 solo si tocan archivos distintos; si no, después de T01).

### Fase 1 — Calidad camino gratis + tests (P1)

Paralelo posible en **equipos separados**:

| Stream A (copiloto) | Stream B (infra) | Stream C (honestidad UI) |
|---------------------|------------------|--------------------------|
| T05, T06, T07 | T25, T26, T08 | T11-A, T12 |
| T04 (si no hecho) | T16 (post T03) | T09, T10 |

**Solapamiento crítico:** no paralelizar T01 y T27 con T04 en mismos archivos `reportSchema.js`.

### Fase 2 — Retención y robustez (P1–P2)

```
T19, T20 (sync/abuso)  ||  T13, T14, T15 (onboarding/wizard/vacíos)
T29, T10 (decisiones)  ||  T18 (límites portafolio)
```

### Fase 3 — Polish (P2)

```
T22, T23, T24  ||  T28, T29, T30, T31, T32, T21, T17
```

### Matriz de solapamiento de archivos (evitar paralelo)

| Archivo | Tareas que lo tocan |
|---------|---------------------|
| `src/research/gemini.js` | T01, T02, T27 |
| `src/research/reportSchema.js` | T01, T04, T27 |
| `src/research/copilotFlow.js` | T04, T05, T07 |
| `src/ui/copilotPanel.js` | T04, T05, T06, T07 |
| `src/ui/report.js` | T02, T09, T12, T29 |
| `supabase/functions/gemini-proxy` | T03, T16, T20 |
| `index.html` | T04, T23, T24, T32 |
| `.github/workflows/*` | T08, T26 |

---

## 5. Backlog diferido

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

## 6. Índice rápido de tareas

| ID | Título | P |
|----|--------|---|
| T01 | Refactor API → `reportParse.js` | P0 |
| T02 | Fallbacks API honestos (sin datos genéricos) | P0 |
| T03 | Cuota proxy por investigación | P0 |
| T04 | Copiloto 1 pegado (express) | P0 |
| T05 | Persistir sesión copiloto | P1 |
| T06 | Validación JSON accionable | P1 |
| T07 | Recuperación errores copiloto | P1 |
| T08 | E2E Playwright paste-back | P1 |
| T09 | Bloque "Próxima decisión" en reporte | P1 |
| T10 | Comparador + eval manual | P1 |
| T11 | Spy honesto / fuente real | P1 |
| T12 | A/B heurístico (no CTR falso) | P1 |
| T13 | Onboarding alineado copiloto | P2 |
| T14 | Wizard sin dead-ends | P2 |
| T15 | Estados vacíos CTAs | P2 |
| T16 | UI cuota proxy restante | P1 |
| T17 | Errores unificados copiloto | P2 |
| T18 | UX límite portafolio 10 | P2 |
| T19 | Sync remoto borrado/conflictos | P1 |
| T20 | Rate limit abuso proxy | P1 |
| T21 | Privacidad BYOK | P2 |
| T22 | Bundle Chart/Lucide | P2 |
| T23 | Accesibilidad modales | P2 |
| T24 | Móvil copiloto/reporte | P2 |
| T25 | Tests unitarios parse/rubric | P1 |
| T26 | CI build + test | P1 |
| T27 | Unificar prompts API/schema | P1 |
| T28 | Caché por fuente/modo | P2 |
| T29 | Documentar Product Score | P2 |
| T30 | Limpiar código muerto | P2 |
| T31 | Disclaimer Meta interests | P2 |
| T32 | Enlace ayuda → manual | P2 |

---

*Generado a partir del estado del repo en rama `master` (commits recientes: copiloto, eval manual, wizard, tier gratis). Verificar archivos antes de ejecutar cada tarea — otro agente puede haber modificado docs en paralelo.*
