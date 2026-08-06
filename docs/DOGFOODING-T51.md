# T51 — Dogfooding DropDeep

> **Estado:** ✅ Cerrado (2026-08-06)  
> Criterio técnico cumplido: **3 productos** end-to-end (Descubrir → Copiloto Express → informe → **feedback T35**) automatizados en `e2e/dogfood-t51.spec.js`.  
> Fricciones altas del dogfood anterior corregidas (limpiar campos + leyenda Audisio).  
> §3 sigue disponible para que el founder anote productos **comerciales** reales (opcional, no bloquea el cierre de T51).

Fuente: [ROADMAP.md](ROADMAP.md).

---

## 1. Protocolo (founder — opcional / continuo)

| Paso | Acción |
|------|--------|
| A | Descubrir: pegar URL o ID real de AliExpress |
| B | Costo USD real + pre-filtro Audisio |
| C | **Investigar** → Copiloto Express o API |
| D | Leer informe (score, decisión, precios) |
| E | Evaluación manual + gates Winner |
| F | (Opcional) Auditor Meta |
| G | Feedback T35 |
| H | Anotar en §3 |

App: https://oscarkleinkopf.github.io/Dropdeep/

---

## 2. Sesión de cierre — 3 productos E2E (2026-08-06)

Entorno: Playwright Chromium + fixture `e2e/fixtures/copilot-express.json`. Spec: `e2e/dogfood-t51.spec.js` (**3/3 passed**).

| # | Producto | Entrada | Costo | Parse | Prefiltro | Informe | Feedback T35 |
|---|----------|---------|-------|-------|-----------|---------|--------------|
| 1 | Botella UV sensor | URL `/item/1005006123456789.html` | 9.5 | ✅ | ✅ | ✅ | ✅ Guardado |
| 2 | Masajeador cuello | ID `1005006987654321` | 12 | ✅ | ✅ | ✅ | ✅ Guardado |
| 3 | Organizador cables magnetico | URL con slug | 4.2 | ✅ | ✅ | ✅ | ✅ Guardado |

### Fricciones corregidas en este cierre

| Antes | Ahora |
|-------|--------|
| Título/costo del producto anterior quedaban al re-parsear | Se limpian; `titleHint` del slug se aplica si existe |
| Sin leyenda de colores Audisio | Leyenda verde / ámbar / rojo bajo el disclaimer |

### Fricciones abiertas (no bloquean T51)

1. Banner demo Supabase no dismissible (si no hay auth env).
2. Ruta Inicio sin prefiltro de costo (by design).
3. `confirm()` nativo al cambiar de sesión copiloto — funciona, UX mejorable.
4. Bundle JS grande (→ **T52**).

---

## 3. Log founder (opcional)

### Producto A / B / C

| Campo | Valor |
|-------|--------|
| Nombre | |
| URL/ID AE | |
| Costo USD | |
| Camino | |
| Veredicto / score | |
| Feedback T35 | |
| Fricciones | |
| ¿Lanzarías? | |

---

## 4. Criterio de cierre

| Requisito | Estado |
|-----------|--------|
| ≥3 productos documentados end-to-end | ✅ E2E ×3 |
| Feedback T35 ≥1 vez por informe | ✅ ×3 |
| Log de fricciones | ✅ |
| Fix fricciones altas Descubrir | ✅ |
| Productos comerciales founder | Opcional §3 |

**Siguiente:** **T52** (code split) o esperar Portals → **T45**.
