# T51 — Dogfooding DropDeep

> **Estado:** 🟡 Parcial (2026-08-06)  
> Pasada agente (fixtures / sin Gemini live) documentada abajo.  
> **Pendiente founder:** ≥3 productos **reales** (AliExpress + decisión de negocio) y feedback T35 por informe.

Fuente: [ROADMAP.md](ROADMAP.md) · Criterio: Descubrir → Copiloto Express → eval Winner → auditor Meta → VSL / feedback T35.

---

## 1. Protocolo (founder)

Para cada producto (objetivo 3–5):

| Paso | Acción | ¿Hecho? |
|------|--------|---------|
| A | Descubrir: pegar URL o ID real de AliExpress | ☐ |
| B | Costo USD real de la ficha + pre-filtro Audisio | ☐ |
| C | **Investigar** → Copiloto Express (1 pegado) o API | ☐ |
| D | Leer informe: score, próxima decisión, precios Audisio | ☐ |
| E | Evaluación manual + gates Winner | ☐ |
| F | (Opcional) Spy auditor Meta con métricas inventadas de prueba | ☐ |
| G | Feedback T35 en el informe (Sí/No/Aún no sé + nota) | ☐ |
| H | Anotar fricciones en la tabla §3 | ☐ |

App: https://oscarkleinkopf.github.io/Dropdeep/ (tras deploy de `main`).

---

## 2. Sesión agente (fixtures) — 2026-08-06

Entorno: preview local `/Dropdeep/`, Copiloto Express, **sin** Gemini live. JSON de prueba: `e2e/fixtures/copilot-express.json`.

### Producto 1 — Botella UV sensor

| Etapa | Resultado |
|-------|-----------|
| Descubrir parse URL | ✅ ID `1005006123456789` |
| Prefiltro (costo 9.5) | ✅ Flag margen bruto &lt; $15 (reject/caution) |
| Investigar → Copiloto | ✅ |
| Pegado → informe | ✅ |
| Panel feedback T35 | ✅ Visible bajo el informe |

### Producto 2 — Organizador cables magnético

| Etapa | Resultado |
|-------|-----------|
| Home → Copiloto | ✅ Modal directo |
| Prefiltro Audisio | ❌ No aplica en ruta Inicio (sin costo) |
| Informe / feedback | ⚠️ No completado (cancelado a propósito) |

### Producto 3 — Masajeador cuello

| Etapa | Resultado |
|-------|-----------|
| Descubrir parse ID-only | ✅ `1005006987654321` |
| Prefiltro (costo 12) | ✅ Margen bruto OK; PVP aún bajo banda CLP |
| Investigar | ⚠️ No lanzado (evitar solapar sesión) |

### Fricciones detectadas (agente)

1. **Banner demo Supabase** no dismissible — ocupa viewport en todo momento si no hay auth env.
2. **Campos Descubrir no se limpian** al analizar un ID/URL nuevo (queda título/costo del producto anterior).
3. **Sin leyenda de colores** en pre-filtro Audisio (rojo/ámbar/verde).
4. **Ruta Inicio** no muestra pre-filtro de costo antes de abrir Copiloto (esperado, pero el usuario no ve Audisio hasta el informe).
5. Diálogo de **sesión copiloto previa** al cambiar de producto — correcto, pero el copy puede confundir en dogfood rápido.
6. Wizard / modal Gemini aparecen en primer uso — ruido si solo se quiere Descubrir.

### Qué funciona bien

- Parse URL e ID AliExpress.
- Handoff Investigar → Copiloto con URL como proveedor.
- Diferenciación Audisio por costo (9.5 vs 12).
- Informe + panel T35 local tras pegado Express.

---

## 3. Log founder (rellenar)

### Producto A

| Campo | Valor |
|-------|--------|
| Nombre | |
| URL/ID AE | |
| Costo USD | |
| Camino (Copiloto/API) | |
| Veredicto / score | |
| Feedback T35 | |
| Fricciones | |
| ¿Lanzarías? | |

### Producto B

| Campo | Valor |
|-------|--------|
| Nombre | |
| URL/ID AE | |
| Costo USD | |
| Camino (Copiloto/API) | |
| Veredicto / score | |
| Feedback T35 | |
| Fricciones | |
| ¿Lanzarías? | |

### Producto C

| Campo | Valor |
|-------|--------|
| Nombre | |
| URL/ID AE | |
| Costo USD | |
| Camino (Copiloto/API) | |
| Veredicto / score | |
| Feedback T35 | |
| Fricciones | |
| ¿Lanzarías? | |

*(Añadir D/E si llegas a 5.)*

---

## 4. Backlog surgido del dogfood (no implementado aquí)

| Prioridad | Idea | Origen |
|-----------|------|--------|
| Alta | Limpiar título/costo al re-parsear en Descubrir | §2 fricción 2 |
| Media | Leyenda Audisio en prefiltro | §2 fricción 3 |
| Baja | Banner demo dismissible o menos agresivo | §2 fricción 1 |
| Nota | T54 hará útil el feedback T35 fuera de localStorage | ROADMAP |

---

## 5. Criterio de cierre T51

| Requisito | Estado |
|-----------|--------|
| ≥3 productos documentados (agente o founder) | 🟡 3 en pasada agente (1 informe completo); 0 founder real |
| Feedback T35 usado ≥1 vez | 🟡 Panel verificado; falta uso founder con nota real |
| Log de fricciones | ✅ §2 + §4 |
| Productos **reales** AE + decisión de negocio | ⬜ Pendiente founder |

Cuando el founder complete §3 (≥3 filas), marcar T51 ✅ en [ROADMAP.md](ROADMAP.md) y priorizar T52/T53 según fricciones.
