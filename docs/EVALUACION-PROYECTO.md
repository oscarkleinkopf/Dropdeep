# Evaluación del proyecto DropDeep — opinión y mejoras

> Documento de evaluación generado 2026-08-06. No modifica código ni el plan vigente; T45–T50 siguen como están en [PLAN-MEJORAS.md §10](PLAN-MEJORAS.md#10-descubrimiento-real-de-productos-t45t50).

## 1. Veredicto general

DropDeep está en un momento sano: T01–T44 cerrados, 102 tests, CI con E2E, proxy con rate limit en prod, móvil corregido ([#33](https://github.com/oscarkleinkopf/Dropdeep/pull/33)), plan de discovery abierto ([#34](https://github.com/oscarkleinkopf/Dropdeep/pull/34)) y MVP Descubrir ya en `main` ([#35](https://github.com/oscarkleinkopf/Dropdeep/pull/35)). Es una app **honesta** (sin mocks) y **gratis primero**, lo cual es raro y correcto en esta categoría.

El mayor riesgo ya no es técnico: es que la promesa "encuentra productos en tendencia" sigue pendiente de un tercero (AliExpress Open Platform). El MVP de pegado mitiga pero no sustituye.

## 2. Fortalezas

- **Ruta gratis real:** Copiloto Express (1 pegado), evaluación manual determinista, calculadoras Audisio 100% offline. El producto funciona sin pagar ni registrarse.
- **Integridad de datos:** tras T02/T12/T34, nada presenta datos simulados como reales. Spy con badges honestos (T11). Esto es ventaja competitiva frente a herramientas de hype.
- **Metodología codificada:** Audisio & Domingo (CLP, gates Winner, CPA máximo, VSL, presupuesto $300) da diferenciación clara para el mercado Chile.
- **Infra madura:** Supabase con RLS, proxy con cuota por sesión y abuse-limits (T20 en prod), sync de portafolio con tombstones (T19).
- **Calidad de ingeniería reciente:** Vitest (102), Playwright E2E (copiloto + móvil), CI Node 22, Pages alineado a `main`.
- **Descubrir MVP (#35):** desbloquea valor sin App Key y mantiene la honestidad.

## 3. Debilidades y riesgos

### Producto

- **Descubrimiento incompleto:** sin Affiliate API, "Descubrir" depende de que el usuario ya encontró el producto. TikTok/Trends sigue siendo manual fuera de la app.
- **Dogfooding pendiente:** el plan dice 3–5 productos reales y aún no hay evidencia de ese ciclo. El feedback T35 existe pero es local-only (no llega al founder).
- **Un solo mercado:** todo el valor (CLP, FX, CPA Chile) apunta a Chile; eso es fuerza de foco pero techo de mercado.

### Técnica

- **Bundle pesado:** `index-*.js` ~654 KB (174 KB gzip) + Chart 210 KB. Sin code splitting real; en 3G chileno esto se siente. Hay warning de Vite desde hace tiempo.
- **Archivos gigantes:** `src/ui/report.js` (2612 líneas), `src/style.css` (6001), `index.html` (1353). Riesgo de regresiones al editar; el propio PLAN lo reconoce (§7 reescritura diferida).
- **Un solo browser en E2E:** solo Chromium; WebKit/iOS es donde vive el público móvil.
- **Seguridad Supabase depende de revisión manual:** migraciones nuevas (006 futura) sin proceso formal de review de RLS.
- **Sin analítica:** no se sabe dónde abandonan los usuarios (ni siquiera privacy-friendly).

### Ops / proceso

- **Secretos y review manual:** App Key AliExpress, SerpAPI, etc. requerirán proceso claro (dónde viven, quién los rota).
- **Reglas del producto bloquean monetización:** Stripe prohibido es coherente hoy, pero no hay decisión registrada sobre modelo a futuro.

## 4. Mejoras propuestas (priorizadas)

### P0 — corto plazo

1. **Cerrar el ciclo de dogfooding** (ya planeado): 3–5 productos reales end-to-end, registrar fricciones. Sin esto, T45+ se construye a ciegas.
2. **Seguimiento Portals → T45:** al aprobar, Edge `discover-proxy` con firma HMAC, cuota tipo gemini-proxy, fixtures en CI.
3. **Code splitting básico:** lazy import de Chart ya existe; extender a vistas (portfolio, spy, prompt-hub) y route-based chunks. Objetivo: bundle inicial < 300 KB.

### P1 — valor de producto

4. **Enriquecer Descubrir sin Affiliate:** extraer precio/imagen del HTML público de la ficha vía proxy (o Gemini grounding) con badge "no verificado"; hoy el usuario teclea el costo a mano.
5. **Feedback T35 sincronizable (opt-in):** hoy se pierde; una tabla `feedback` con RLS permitiría ver fricción real de otros usuarios, no solo la del founder.
6. **Analítica privacy-friendly:** eventos anónimos (vista, inicio research, pegado copiloto, guardado) sin PII — puede ser una tabla Supabase simple; sin ella se prioriza a oscuras.
7. **Trends CL (T47) solo si hay presupuesto SerpAPI:** si no, quitar del camino crítico y dejar el campo `trendLabel: unknown` honesto.

### P2 — ingeniería / calidad

8. **Extracción incremental de report.js:** separar render de secciones (snapshot, next-decision, bundles, VSL) en módulos; no reescribir, extraer.
9. **E2E WebKit en CI:** `playwright install webkit` en job separado o runner macOS para cubrir iOS Safari real (el fallo de mobile-smoke lo evidenció).
10. **Checklist de RLS por migración:** plantilla de PR para migraciones con verificación de políticas (006 ya viene).
11. **Auditoría CSP/meta:** revisar headers de Pages, `og:` tags para compartir, y accesibilidad de la nueva vista Descubrir.

### P3 — decisión de negocio (documentar, no implementar)

12. **Modelo a futuro:** dejar escrito en el PLAN si algún día habrá tier pagado (o donaciones/BYOK-only). Hoy la regla "no Stripe" es correcta; conviene una nota explícita de por qué y cuándo se revisaría.
13. **Expansión de mercado:** si el dogfooding valida, considerar parametrizar país/moneda (hoy CL hardcodeado en reglas y copy).

## 5. Roadmap sugerido (orden, no fechas)

1. Dogfooding (producto) + Portals/T45 (discovery) en paralelo
2. Code splitting (P0 técnico, bajo riesgo)
3. Enriquecer Descubrir + feedback sync
4. Analítica mínima → datos para priorizar T47/T48
5. Extracción report.js + E2E WebKit (mantenibilidad)
