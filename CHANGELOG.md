# Changelog

Todos los cambios **visibles para el usuario** en DropDeep se documentan aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).  
Las entradas más recientes van primero.

## [Unreleased]

### Cambiado

- **Bundles (sección 21):** la UI usa el motor `generateBundleStructure` (packs, upsell y % AOV desde el retail del informe). Se eliminó el “+45% AOV” fijo hardcodeado; el boost mostrado es heurístico (mix 35/50/15), no predicción de ventas.

### Añadido

- **Móvil copiloto/reporte (T24):** modales a pantalla completa bajo 640px; botones ≥44px; textarea 16px (sin zoom iOS); tabs del informe ya horizontales bajo 900px.
- **Errores copiloto unificados (T17):** pegados JSON inválidos muestran título «Respuesta JSON ilegible» (paridad con terminal API); validación estructural T06 se conserva.
- **Caché por fuente/modo (T28):** la clave local incluye ruta (API/Copiloto) y modo (Express/Rápido/Completo); el modal indica el origen y no reutiliza informes cruzados.
- **E2E Copiloto (T08):** Playwright (`npm run test:e2e`) — Express 1 pegado y Rápido 2 pegados sin Gemini; job `e2e-copilot` en CI (Chromium).
- **Rate limit proxy (T20):** Edge Function `gemini-proxy` rechaza payloads &gt; ~100k chars, ráfagas (&gt;10 req/10s) y sesiones nuevas con &lt;30s de cooldown; migración `005_proxy_abuse.sql`; mensajes ES en cliente; logs sin prompt.
- **Privacidad BYOK + Product Score + Meta disclaimer (T21/T29/T31):** copy explícito en Ajustes (*clave no se envía a DropDeep*); tooltip de pesos en badge Product Score + enlace a evaluación manual; disclaimer de intereses Meta visible al abrir el tab (lista offline).
- **Feedback dogfooding por informe (T35):** panel **¿Te ayudó a decidir?** (Sí / No / Aún no sé + nota 280) guardado solo en `localStorage`; badge **FB** en portafolio; no se exporta ni sube a Supabase.
- **Límite portafolio (T18):** al guardar con 10 productos se abre modal con listado (antiguo→reciente), checkboxes para eliminar, **Exportar JSON** y reintento de guardado al liberar cupo (también desde wizard y evaluación manual).
- **Onboarding + wizard (T13/T14):** CTA **Iniciar Copiloto** fuerza ruta gratis y enfoca el buscador; wizard con **Copiar pack** como acción primaria; Copiloto/API deshabilitados sin nombre de producto; badge **Borrador** en lista y detalle del portafolio.
- **Sync borrado portafolio (T19):** eliminar (detalle o corazón) borra también `research_reports` en Supabase; tombstone local si offline para que el merge no resucite el ítem; badge **Sincronizado** / **Solo local** en el detalle; toast si falla la nube.
- **Recuperación de errores copiloto (T07):** un pegado inválido no avanza el paso ni borra `partialReport`; barra/caption de pasos completados; **Ver pasos completados** y **Paso anterior** para revisar prompts previos en solo lectura; **Volver al paso actual** para reintentar el pegado.
- **Validación JSON copiloto (T06):** errores de pegado con tips accionables (markdown \`\`\`json, truncado, comillas tipográficas); mensajes de validación citan campos (`demographics.who`, etc.); panel **Ver ejemplo de JSON** por paso en el modal.
- **Spy honesto (T11 Opción A):** banner permanente *Análisis inferido por IA — no verificado*; badge en resultados; Pixel/TikTok/GA4 siempre **No verificado** (ya no Sí/No); checklist manual gratis sin API; pestaña renombrada a «Análisis de URL (Gemini)» (no scraper). Intereses Meta y disclaimer estático sin cambios.
- **Metodología Audisio (T43):** nueva §12 en el manual (disclaimers CLP/Chile, FX editable, sin sync Meta, mapa de paneles, cuándo usar el auditor, gates Winner, orden práctico). Ayuda in-app enlaza a esa sección; glosario ampliado (gates Winner, CPA proyectado) y troubleshooting FX/auditoría.
- **Presupuesto de testeo $300 en Montecarlo (T42):** sección 20 ancla el pool Audisio ($300 primer mes / mes y medio), presets $10/$20 por día con runway, panel de CPA proyectado / pedidos estimados, avisos si el CPA agota el budget sin aprendizaje, y nota de autofinanciamiento. Defaults CPC alineados a banda Chile.
- **Kit VSL & lanzamiento Audisio (T41):** sección 24 del informe con 3 guiones Hook→Body→CTA (20–60 s), specs CapCut/Canva/ElevenLabs, checklist de lanzamiento (5 videos, calentamiento, presupuestos) persistida en el navegador, y el mismo bloque en el export del kit de campaña. Prompt Hub fase 4 menciona las reglas Audisio.
- **Auditoría Meta Ads Chile (T40):** pestaña en Spy para pegar CTR/CPC/ATC/CPM/CPA y calcular CPA máximo Audisio (IVA AliExpress, pasarela, Shopify, IVA venta). Semáforo offline con umbrales Chile; alerta si el CPA de campaña supera el máximo. Sin API Meta.
- **Tests + CI (T25/T44/T36):** Vitest con suite offline de `reportParse`, evaluación manual/gates Winner y fórmulas Audisio (`npm test`); workflow `.github/workflows/ci.yml` (Node 22) corre tests + build en PR/push sin secretos.
- **Rúbrica Winner Audisio (T39):** la evaluación manual usa 3 pilares (solución / emoción / WOW), gates de tamaño ≤ caja de zapatos, margen bruto &gt; \$15 y CPA proyectado (\$5–\$7 ideal); si un gate falla, el veredicto no puede ser **Lanzar** aunque el score sea ≥ 70. Campos de margen/CPA/ticket + estado de gates en el modal.
- **Precios Audisio (T38):** panel en el informe con reglas offline del método Audisio & Domingo — PVP sugerido (costo × 2.5), conversión CLP con FX editable, piso 20.000 CLP, banda 40k–100k, margen bruto mínimo 15 USD, objetivo ~35% de contribución, presupuesto de test 300 USD y botón para aplicar el PVP sugerido al retail. No es cotización en vivo.
- **CSV Shopify y WooCommerce:** botones en la cabecera del informe descargan CSV listo para importar (título, HTML, precio, coste, SEO); sin conexión automática a la tienda.
- **Secciones 20–23 del informe:** Simulador Montecarlo (P10/P50/P90 con inputs editables), Bundles & Upsells, bloques HTML de conversión (tabla, beneficios, FAQ) y guiones WhatsApp/soporte listos para copiar.
- **Cuota proxy en menú usuario (T16):** badge persistente al iniciar sesión (`Proxy: N/M hoy`, restantes o agotado, día UTC); detalle en desplegable; se actualiza tras cada investigación proxy; con BYOK guardada muestra **Usando BYOK** sin implicar consumo proxy; oculto si no hay sesión o proxy desactivado.
- **Comparador + evaluación manual (T10):** filas separadas de puntuación y veredicto manual; **Cuál lanzar primero** usa evaluación manual solo si todos los productos la tienen; si no, Product Score; texto indica qué señal impulsó la recomendación.
- **Prioridad BYOK sobre proxy (T33):** si guardaste clave Gemini en Ajustes, Deep Research y Spy usan BYOK directo a Google aunque tengas sesión y proxy activo; hint en Ajustes y logs de terminal distinguen BYOK vs proxy.
- **Gráfico de tendencia honesto (T34):** eliminado `Math.random()`; la sección 03 muestra ilustración offline derivada del campo *Tendencia* del informe o mensaje *Sin datos de tendencia verificados* — sin afirmar Google Trends en vivo.
- **Bloque «Próxima decisión» en el informe (T09):** panel con veredicto **Lanzar** / **Validar más** / **Descartar** (evaluación manual si existe; si no, sugerencia orientativa desde Product Score con aviso explícito), fuente etiquetada y acciones: guardar portafolio, evaluación manual, exportar kit, comparar y completar secciones en modo Rápido/Express.
- **Persistencia sesión copiloto (T05):** progreso parcial guardado en `localStorage` (7 días); cerrar el modal no borra el paso; banner **Retomar copiloto** en Inicio + toast al cargar; **Descartar progreso** / **Cancelar sesión** limpian el borrador; al completar el informe se borra el draft.

### Añadido (documentación previa)

- **Manual de usuario refrescado** (`docs/MANUAL.md`): Modo Express, cuota por investigación (no por llamada Gemini), tabla Express/Rápido/Completo para Copiloto vs API, flujo ~15 min con Express, glosario ampliado y solución de problemas (429, cancelación a mitad).
- Entradas de changelog consolidadas para Express, cuota proxy por sesión e informes con secciones incompletas (antes solo en `[Unreleased]` sin manual alineado).

### Añadido (código previo, ahora documentado en manual)

- **Modo Copiloto Express (1 pegado):** profundidad **Express** en Inicio — un solo prompt/respuesta JSON con investigación base + copys; badge **Modo Express** en el informe.
- Cuota proxy por **investigación completa** (sesión UUID): Completo/Rápido vía proxy consumen 1 unidad/día, no 1 por llamada Gemini. Migración `004_research_session_quota.sql`.
- Hint `Proxy: N/M investigaciones hoy` tras usar proxy (sessionStorage).
- Banner **Secciones incompletas** en informes API con pasos fallidos; export MD incluye la nota.

### Cambiado

- **Prioridad Gemini:** BYOK guardada gana sobre proxy con sesión; tabla y troubleshooting del manual actualizados (ya no hace falta cerrar sesión para usar BYOK).
- **Sección 03 del informe:** copy y gráfico de tendencia dejan de implicar datos reales de Google Trends.
- Ruta API refactorizada: `gemini.js` reutiliza `reportParse.js` + `buildApiPrompt()` (misma pipeline que copiloto).
- Fallos de parseo API: placeholders honestos (*No generado — reintenta o usa Completo/Copiloto*) — sin plantillas genéricas inventadas.
- **Comparador heurístico de titulares (offline):** sin `Math.random()` ni “CTR estimado”; puntuación relativa determinista.
- Banner sin clave API: aclara que Copiloto, evaluación manual y packs funcionan gratis.
- Prompt Hub: etiquetas UMP/UMS corregidas en secuencia maestra.
- Default de profundidad sin preferencia guardada: **Express** (recomendado sin API).

`e3b43d1`

### Añadido (docs previos)

- Manual de usuario en español (`docs/MANUAL.md`) y mecanismo de actualización automática vía regla Cursor.
- Enlace **Ayuda** en la app hacia el manual en GitHub.
- Sección **Documentación** en README.

---

## [2026-07 — Copiloto y evaluación manual] — `92e26e6`

### Añadido

- **Modo Copiloto Gratis**: flujo copy → chatbot gratuito → pegar JSON → informe estructurado (2 pasos en Rápido, 5 en Completo). Badge **Generado en modo copiloto**.
- Toggle **Método:** **Gratis (Copiloto)** vs **Con API (Automático)** con botones **Iniciar Modo Copiloto** / **Ejecutar Deep Research**.
- **Evaluación manual (sin IA)**: 10 criterios ponderados, score 0–100, veredictos **Lanzar** / **Validar más** / **Descartar**; guardado en portafolio y comparador.
- Esquema JSON compartido entre API y copiloto (`reportSchema`, `reportParse`).

### Cambiado

- Panel **Primeros pasos** actualizado con rutas copiloto y evaluación manual.
- Exportaciones MD/kit incluyen resumen de evaluación manual cuando existe.

---

## [2026-07 — Wizard y modos Rápido/Completo] — `3c2c8d9`

### Añadido

- **Wizard primer producto**: CTA **¿Primera vez? Configura tu primer producto (~60 s)** — elige vertical, nombre, copia pack, borrador en portafolio (sin login).
- **Profundidad:** toggle **Completo** / **Rápido** junto al buscador; preferencia en `localStorage`.
- Modo **Rápido**: 2 pasos Gemini/copiloto; secciones omitidas muestran aviso honesto (*No generado en modo rápido — corre Completo para obtener esta sección.*).
- Badge **Modo Rápido** en informes generados en modo rápido.

### Cambiado

- Feed de investigaciones recientes reabre reportes guardados con mejor UX.
- Copy del comparador: veredicto **Cuál lanzar primero** basado solo en Product Score.

---

## [2026-07 — Packs verticales y kit de campaña] — `2c19bc0`

### Añadido

- **Packs por vertical (gratis)** en Prompt Hub: **Belleza & Skincare**, **Mascotas & Pets**, **Hogar & Organización**, **Fitness & Bienestar**, **Gadgets & Tech** (6 prompts copy-ready cada uno).
- **Descargar kit de campaña** (Markdown) desde reporte o portafolio: resumen, ángulos, copys Meta/TikTok/email, CTAs.
- Pestañas **Secuencia maestra (5 fases)** y **Packs por vertical (gratis)** en Prompt Hub.

### Cambiado

- Onboarding enfatiza ruta gratis de ~60 s con packs verticales.

---

## [2026-07 — Tier operativo gratis] — `da69d21`

### Añadido

- **Tier operativo gratis**: Prompt Hub, portafolio local, packs y BYOK sin login.
- Cuota diaria de **proxy Gemini** (default **2**/día por usuario) con migración `003_gemini_usage.sql`.
- Límites documentados: portafolio **10**, comparar **2** sin sesión / **3** con sesión.
- Mensaje **Cuota diaria de proxy agotada** en español.

### Cambiado

- Auth gate pasa de bloqueo a **banner dismissible** (*Tier operativo gratis* → **Continuar gratis**).
- **Ajustes** (BYOK) accesibles sin iniciar sesión.
- Banner Gemini ya no exige cuenta para abrir ajustes.

### Eliminado

- Paywall falso en Prompt Hub y portafolio.

---

## [2026-07 — Investigación fiable y sync] — `145c301`

### Añadido

- Mensajes de error Gemini en **español** con acciones **Abrir Ajustes** y **Reintentar**.
- **Cancelar investigación** en terminal de Deep Research.
- Reintentos automáticos (hasta 2) en errores transitorios de API.
- Sincronización de reportes en Supabase (`research_reports`) al iniciar sesión.
- **Comparador de productos** ampliado: riesgo, oportunidad, evaluación manual, origen del reporte.
- Prompt Hub enriquecido con contexto de reporte abierto.
- Spy competitivo honesto: sin datos simulados si falta API.

### Cambiado

- Historial: merge portafolio local + caché 24 h + nube al login.

### Eliminado

- Generador procedural de reportes y datos mock de competencia.

---

## [2026-07 — Solo investigación en vivo] — `29f121a`

### Eliminado

- Trend Scanner, métricas falsas del dashboard, feed automatizado de productos y simulaciones procedurales.
- Fallbacks de demo en Deep Research.

### Cambiado

- Dashboard muestra stats **reales** de portafolio y caché.
- Deep Research exige respuesta en vivo de Gemini (BYOK/proxy) o flujos manuales/copiloto posteriores.

---

## [2026-06 — Usabilidad inicial] — `e47f5f1`

### Añadido

- Panel **Primeros pasos** (checklist dismissible).
- CTAs en hero e Inicio en **español**.
- Navegación principal: **Inicio**, **Portafolio**, **Prompts**, **Spy**.

### Cambiado

- Etiquetas y títulos de navegación unificados en español.

---

## [2026-06 — Auth y PWA] — `57a5f67`, `57e012c`, `3716a98`, `be720a9`, `cc8b749`

### Añadido

- **Supabase Auth**: **Entrar**, **Crear cuenta**, **Continuar con Google**.
- Modal de auth **fuera** de `#app-shell` (siempre interactivo).
- Fundación **Gemini proxy** (Edge Function).
- Banner **Sin clave API de Gemini** con **Abrir Ajustes**.
- Endurecimiento CSP, export seguro, caché PWA corregido tras deploy.

### Cambiado

- `3716a98`: acceso requería login cuando auth estaba configurado (posteriormente revertido en `da69d21` a tier gratis abierto).

---

## [2026-06 — Despliegue GitHub Pages] — `18ad638`

### Añadido

- Workflow GitHub Actions para deploy en `https://oscarkleinkopf.github.io/Dropdeep/`.
- Base path `/Dropdeep/` en Vite.

---

## [2026-06 — Arquitectura modular] — `4e35b20`, `77ce692`

### Añadido

- DropDeep hub con arquitectura Vite modular (`src/ui`, `src/research`, `src/auth`, etc.).
- PWA, Prompt Hub inicial, portafolio, informe Deep Research, Spy Meta.

---

## [2026-06 — Inicio del proyecto] — `7dc3c20`

### Añadido

- Repositorio inicial DropDeep.
