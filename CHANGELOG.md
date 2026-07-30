# Changelog

Todos los cambios **visibles para el usuario** en DropDeep se documentan aquí.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).  
Las entradas más recientes van primero.

## [Unreleased]

### Añadido

- **Manual de usuario refrescado** (`docs/MANUAL.md`): Modo Express, prioridad proxy sobre BYOK con sesión, cuota por investigación (no por llamada Gemini), tabla Express/Rápido/Completo para Copiloto vs API, flujo ~15 min con Express, glosario ampliado y solución de problemas (429, cancelación a mitad).
- Entradas de changelog consolidadas para Express, cuota proxy por sesión e informes con secciones incompletas (antes solo en `[Unreleased]` sin manual alineado).

### Añadido (código previo, ahora documentado en manual)

- **Modo Copiloto Express (1 pegado):** profundidad **Express** en Inicio — un solo prompt/respuesta JSON con investigación base + copys; badge **Modo Express** en el informe.
- Cuota proxy por **investigación completa** (sesión UUID): Completo/Rápido vía proxy consumen 1 unidad/día, no 1 por llamada Gemini. Migración `004_research_session_quota.sql`.
- Hint `Proxy: N/M investigaciones hoy` tras usar proxy (sessionStorage).
- Banner **Secciones incompletas** en informes API con pasos fallidos; export MD incluye la nota.

### Cambiado

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
