# Manual de usuario — DropDeep

> **Versión del manual:** alineada con el código en `main`.  
> **App en vivo:** [https://oscarkleinkopf.github.io/Dropdeep/](https://oscarkleinkopf.github.io/Dropdeep/)  
> **Metodología Chile:** [§12 Audisio y Domingo](#12-metodología-audisio-y-domingo-chile)

---

## Tabla de contenidos

1. [¿Qué es DropDeep y qué problema resuelve?](#1-qué-es-dropdeep-y-qué-problema-resuelve)
2. [Qué NO hace DropDeep](#2-qué-no-hace-dropdeep)
3. [Conoce la interfaz](#3-conoce-la-interfaz)
4. [Ruta gratis (sin API de pago)](#4-ruta-gratis-sin-api-de-pago)
   - [4.1 Packs por vertical en Prompt Hub](#41-packs-por-vertical-en-prompt-hub)
   - [4.2 Modo Copiloto paso a paso](#42-modo-copiloto-paso-a-paso)
   - [4.3 Evaluación manual + gates Winner (Audisio)](#43-evaluación-manual--gates-winner-audisio)
   - [4.4 Guardar en portafolio y exportar](#44-guardar-en-portafolio-y-exportar)
5. [Ruta con API (Gemini)](#5-ruta-con-api-gemini)
   - [5.1 BYOK — tu propia clave](#51-byok--tu-propia-clave)
   - [5.2 Proxy con cuenta y cuota diaria](#52-proxy-con-cuenta-y-cuota-diaria)
   - [5.3 Modo Rápido vs Completo](#53-modo-rápido-vs-completo)
   - [5.4 Qué cambia respecto al Copiloto](#54-qué-cambia-respecto-al-copiloto)
6. [Tu primer producto en ~15 minutos](#6-tu-primer-producto-en-15-minutos)
7. [Cómo leer un informe de investigación](#7-cómo-leer-un-informe-de-investigación)
8. [Comparar productos y decidir cuál lanzar primero](#8-comparar-productos-y-decidir-cuál-lanzar-primero)
9. [Cuenta, privacidad y datos](#9-cuenta-privacidad-y-datos)
10. [Solución de problemas](#10-solución-de-problemas)
11. [Glosario](#11-glosario)
12. [Metodología Audisio y Domingo (Chile)](#12-metodología-audisio-y-domingo-chile)

---

## 1. ¿Qué es DropDeep y qué problema resuelve?

**DropDeep** es una herramienta web (PWA) para emprendedores que empiezan en **dropshipping**. Te ayuda a investigar un producto antes de invertir en tienda, stock o anuncios.

El problema que resuelve: cuando ves un producto “viral” en TikTok o AliExpress, no sabes si vale la pena. DropDeep te guía para obtener un **informe estructurado** con:

- Datos de viabilidad (costo, precio, margen, ROI, saturación, envío).
- Perfil del comprador y frases reales que usaría en anuncios.
- Ángulos de marketing, scripts UGC, copys para Meta/TikTok, emails y ficha de producto.
- Un **Product Score** (0–100) para comparar opciones.

**Filosofía del producto:** el camino gratuito debe ser **realmente útil**. No necesitas pagar ni registrarte para investigar con **Modo Copiloto**, **Evaluación manual** o **Prompt Hub**. La API de Gemini (BYOK o proxy) es un **acelerador opcional** que automatiza el mismo flujo.

Para precios, gates Winner, auditoría de ads y lanzamiento en **Chile (CLP)**, DropDeep codifica el **[método Audisio y Domingo](#12-metodología-audisio-y-domingo-chile)** de forma **offline** (sin sync a Meta ni tipo de cambio en vivo).

---

## 2. Qué NO hace DropDeep

Sé honesto contigo mismo sobre estos límites:

| DropDeep **no**… | Detalle |
|------------------|---------|
| Garantiza ventas | Los scores y veredictos son orientativos, no predicciones de ingresos. |
| Sustituye tu validación real | Muestras, pedidos de prueba y ads pequeños siguen siendo necesarios. |
| Tiene paywall ni Stripe | No hay planes de pago integrados en la app. |
| Simula investigaciones | No hay datos falsos ni “modo demo” de reportes. Todo viene de tu chatbot, de Gemini en vivo, de tu portafolio o de caché local reciente. |
| Gestiona tu tienda | No conecta con Shopify, Meta Ads ni proveedores de forma automática. |
| Lista “trending” AliExpress en vivo | **Descubrir** usa un enlace/ID que **tú pegas**; la API Affiliate oficial llega cuando Portals/Open Platform aprueben la App Key. |
| Espía competidores sin IA | El análisis de **URL de tienda** en Spy requiere Gemini BYOK o proxy; sin API verás un mensaje claro y un **checklist manual gratis**. La salida con IA lleva badge **Inferido por IA**; Pixel/GA se muestran como **No verificado** (no escaneamos el HTML). La **Auditoría Meta Ads (Chile)** es offline: pegas tus métricas (no hay API Meta ni datos inventados). |
| Sincroniza en la nube sin cuenta | El portafolio local funciona sin login; la nube (Supabase) es opcional. |

---

## 3. Conoce la interfaz

### Navegación principal

| Pestaña | Qué hace |
|---------|----------|
| **Inicio** | Buscador, métricas de tu actividad e investigaciones recientes. |
| **Descubrir** | Pegas URL o ID de AliExpress → pre-filtro Audisio (costo USD) → lanzas Copiloto/API. Sin catálogo Affiliate en vivo aún. |
| **Portafolio** | Productos guardados, notas, comparación y exportación. |
| **Prompts** | Prompt Hub: secuencia maestra o packs por vertical (sin API). |
| **Spy** | Espionaje competitivo: análisis de URL con Gemini (**inferido por IA**, no scraper HTML; pixel/GA = No verificado), intereses Meta de referencia, y **Auditoría Meta Ads Chile** (offline / Audisio). |

### Buscador en Inicio

Tres controles importantes:

1. **Método:** `Gratis (Copiloto)` vs `Con API (Automático)`.
2. **Profundidad:** `Express` (1 pegado) · `Rápido` (2 pasos) · `Completo` (5 pasos). Por defecto: **Express** (ideal sin API).
3. **Campo de producto** + URL de competidor opcional.

Botones secundarios:

- **Evaluación manual (sin IA)** — checklist offline.
- **Generar prompts sin API** — abre Prompt Hub.
- **Abrir Descubrir (AliExpress)** — si aún no tienes nombre: pega URL/ID del proveedor.

### Descubrir (AliExpress)

1. Copia el enlace del producto en AliExpress (o el ID numérico largo).
2. En **Descubrir** → **Analizar enlace** (valida host e ID).
3. Completa el **costo en USD** (y PVP opcional) para ver el **pre-filtro Audisio** (banda CLP, margen bruto).
4. **Investigar** rellena Inicio con el nombre + URL y arranca Copiloto/API (la URL se trata como proveedor AliExpress en los prompts).
5. **Evaluación rápida** abre la rúbrica manual con ese nombre.

Esto **no** descarga hot lists ni Trends; es el MVP mientras llega la App Key Affiliate (plan T45).

### Ajustes (icono engranaje)

**Configuración de API** → clave Gemini, modelo, idioma y búsqueda en Google (grounding). Funciona **sin iniciar sesión** en modo BYOK.

### Avisos opcionales

- **Tier operativo gratis** — banner dismissible que invita a crear cuenta para sync y créditos proxy (la app **nunca** se bloquea).
- **Sin clave API de Gemini** — recuerda que Deep Research automático y Spy con IA necesitan clave o proxy; el Copiloto no.

---

## 4. Ruta gratis (sin API de pago)

Esta es la ruta recomendada si empiezas con **$0** en herramientas de IA de pago.

### 4.1 Packs por vertical en Prompt Hub

1. Ve a **Prompts**.
2. Elige la pestaña **Packs por vertical (gratis)**.
3. Selecciona uno de los cinco packs:

| Pack | Nombre en la app |
|------|------------------|
| Belleza | **Belleza & Skincare** |
| Mascotas | **Mascotas & Pets** |
| Hogar | **Hogar & Organización** |
| Fitness | **Fitness & Bienestar** |
| Gadgets | **Gadgets & Tech** |

4. Sustituye `[TU PRODUCTO]` por el nombre de tu SKU (ej. “Rodillo de jade”, “Comedero inteligente”).
5. Cada pack incluye **6 prompts** listos para copiar (investigación, ángulos, Meta, TikTok/UGC, objeciones, email).
6. Copia el prompt que necesites y pégalo en **ChatGPT, Gemini, Claude o DeepSeek** (versión web gratuita).

> **Nota:** Los packs son **plantillas de arranque**. Para un informe completo dentro de DropDeep, usa **Modo Copiloto** o la API.

Si ya tienes un reporte abierto, la **Secuencia maestra (5 fases)** se enriquece automáticamente con datos reales de ese reporte.

### 4.2 Modo Copiloto paso a paso

El **Modo Copiloto** genera el **mismo JSON estructurado** que Deep Research con API. La diferencia: tú copias cada prompt, lo ejecutas en un chatbot gratis y pegas la respuesta de vuelta en DropDeep.

#### Cómo iniciarlo

1. En **Inicio**, deja **Método → Gratis (Copiloto)**.
2. Elige **Profundidad** (**Express**, Rápido o Completo). **Express** es el recomendado sin API: un solo copiar/pegar.
3. Escribe el nombre del producto y pulsa **Iniciar Modo Copiloto**.

Se abre el modal **Modo Copiloto Gratis** con tres pasos visibles:

1. **Copiar prompt** → botón **Copiar prompt**
2. **Pegar en tu chatbot gratis** (ChatGPT, Gemini, Claude, DeepSeek web)
3. **Pegar aquí la respuesta** → **Procesar respuesta**

#### Pasos según profundidad

| Profundidad | Pasos del copiloto | Contenido |
|-------------|-------------------|-----------|
| **Express** | 1 | Investigación base + copys en un solo JSON (recomendado sin API) |
| **Completo** | 5 | Reporte base → Avatar Brief → Offer Brief → Creativos (UGC + landing) → Materiales de marketing |
| **Rápido** | 2 | Reporte base → Copys publicitarios básicos |

En modo **Express**, el único paso es **Reporte express (1 pegado)** — *Express — investigación + copys en un JSON*.

Títulos de cada paso (modo Completo):

1. **Reporte de mercado y copywriting** — *Paso 1 — Investigación base*
2. **Ficha Avatar Brief** — *Paso 2 — Avatar psicográfico*
3. **Offer Brief de marketing** — *Paso 3 — Arquitectura de oferta*
4. **Activos creativos (UGC + landing)** — *Paso 4 — Scripts UGC y landing*
5. **Materiales de marketing** — *Paso 5 — Emails, anuncios y Shopify*

En modo Rápido, el paso 2 es **Copys publicitarios básicos** — *Paso 2 — Titulares y anuncios*.

#### Ejemplo simplificado (modo Rápido, paso 1)

**Prompt que copias** (extracto; el real incluye el esquema JSON completo):

```
Realiza una investigación de mercado profunda en español sobre el producto de dropshipping: "Smart Pet Feeder".
Actúa como Investigador de Mercado de Élite...
IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown, sin bloques ```, sin texto antes ni después.
```

**Respuesta que pegas** (ejemplo mínimo válido — en la práctica el chatbot debe devolver el objeto completo):

```json
{
  "name": "Smart Pet Feeder",
  "categoryId": "pet",
  "cost": 18,
  "retail": 49.9,
  "margin": 31.9,
  "roi": 177,
  "shipping": 10,
  "sales": 1200,
  "saturation": 35,
  "trend": "+80%",
  "suppliers": [{"platform": "AliExpress", "name": "PetAuto Feed", "price": 16, "shippingCost": 4, "shippingTime": "10-15", "link": "https://..."}],
  "demographics": {"who": "Dueños de perros/gatos 25-45 años...", "attitudes": "...", "dreams": "...", "defeats": "...", "outsideForces": "...", "prejudices": "...", "belief": "..."},
  "solutions": {"current": "...", "experience": "...", "likes": "...", "dislikes": "...", "horrorStories": ["...", "...", "..."], "skepticism": "..."},
  "secrets": {"historical": "...", "conspiracy": "...", "mechanismProblem": "...", "mechanismSolution": "..."},
  "eden": {"goldenAge": "...", "corruptor": "...", "contrast": "..."},
  "verbatims": ["Frase 1", "Frase 2"],
  "angles": [{"title": "1. Conspiración", "narrative": "...", "hook": "...", "headline": "..."}]
}
```

Tras **Procesar respuesta**:

- Si el JSON es válido → toast **Paso procesado correctamente.** y avanzas al siguiente paso.
- Si falla → el paso **no avanza**; los datos ya validados de pasos anteriores se conservan. Usa **Reintentar**, **Ver ejemplo de JSON**, o revisa **Ver pasos completados** / **Paso anterior** (solo lectura del prompt).
- Al terminar → toast **Reporte completo — generado en modo copiloto.** y badge **Generado en modo copiloto** en el informe.

#### Retomar o descartar progreso (T05)

El copiloto guarda automáticamente tu progreso parcial en este navegador (hasta **7 días**):

| Acción | Qué pasa |
|--------|----------|
| Cerrar el modal (punto rojo) | Se oculta el panel; el paso y datos pegados **se conservan** |
| Recargar la página (F5) | Banner **Investigación copiloto en progreso** en Inicio + toast *Retomar investigación de «…»* |
| **Retomar copiloto** | Abre el modal en el mismo paso con el `partialReport` intacto |
| **Descartar progreso** / **Cancelar sesión** | Pide confirmación y borra el borrador |
| Completar todos los pasos | Borra el borrador automáticamente |

#### Consejos para el Copiloto

- Pide al chatbot **solo JSON**, sin texto extra. Si devuelve markdown con \`\`\`json, quita los delimitadores antes de pegar (o pega igual: si falla, el error te lo indica).
- Si falla el parseo, lee el mensaje: tip de **JSON truncado**/markdown o campo faltante (`demographics.who`, etc.). Usa **Reintentar** y, si hace falta, **Ver ejemplo de JSON**. La barra de progreso y **Ver pasos completados** confirman cuántos pasos ya quedaron guardados.
- **Paso anterior** muestra el prompt de un paso ya aceptado (solo lectura); **Volver al paso actual** reactiva el pegado. No edita datos previos (eso sería un flujo avanzado).
- **Cerrar** (punto rojo) pausa la sesión — usa **Retomar copiloto** para continuar.
- **Cancelar sesión** o **Descartar progreso** elimina el borrador sin guardar informe incompleto.

### 4.3 Evaluación manual + gates Winner (Audisio)

La **Evaluación manual (sin IA)** es un checklist **100% offline** con puntuación determinística, alineado al **método Audisio & Domingo**. Ideal para validar una idea antes de invertir en ads.

**Cómo abrirla:** botón **Evaluación manual (sin IA)** en Inicio, panel **Primeros pasos**, o desde **Próxima decisión** en un informe.

#### Gates Winner (bloquean “Lanzar”)

Aunque el score sea ≥ 70, el veredicto **no puede ser Lanzar** si falla un gate:

| Gate | Regla |
|------|--------|
| Pilares Winner | Cumplir **mínimo 1** de 3 (ideal 3): solución de problemas · conexión emocional · efecto WOW |
| Tamaño/peso | Deslizador ≥ **50/100** (empaque ≤ caja de zapatos) |
| Margen bruto USD | Si lo completas: debe ser **> 15 USD** (se puede autocompletar desde costo/retail del informe) |
| CPA proyectado | Ideal **5–7 USD**; máx. **15 USD** (hasta **20 USD** solo si el ticket ≈ **100 USD**+) |

Los avisos (CPA faltante, pilares parciales, etc.) no bloquean solos, pero aparecen en la explicación.

#### Criterios ponderados (score 0–100)

| # | Criterio | Peso |
|---|----------|------|
| 1 | Margen neto (deslizador) | **15%** |
| 2–4 | Pilares Winner (checkboxes: solución / emoción / WOW) | **4%** c/u |
| 5 | Tamaño y peso de envío | **10%** |
| 6 | Saturación / competencia visible | **12%** |
| 7 | Disponibilidad de proveedores | **10%** |
| 8 | Estacionalidad / atemporalidad | **8%** |
| 9 | Riesgo de políticas de anuncios | **10%** |
| 10 | Potencial de UGC / creativos | **8%** |
| 11 | Ticket promedio y potencial AOV/upsell | **10%** |
| 12 | Calidad / devoluciones / fragilidad | **5%** |

**Total pesos:** 100%.

#### Veredictos automáticos

| Score | Veredicto base | Nota |
|-------|----------------|------|
| ≥ 70 | **Lanzar** | Solo si **todos** los gates duros pasan |
| 45–69 | **Validar más** | También se usa si score ≥ 70 pero un gate falla |
| < 45 | **Descartar** | — |

**Guardar:** **Guardar en portafolio** o **Guardar y ver reporte**.

### 4.4 Guardar en portafolio y exportar

#### Guardar

Desde un informe: **Guardar en Portafolio** (corazón en la barra del reporte).

En el detalle del portafolio verás **Sincronizado** (hay copia en Supabase para tu cuenta) o **Solo local** (este navegador, o aún no subió).

Si eliminas un producto estando logueado, DropDeep también borra la fila en la nube. Sin conexión: se elimina aquí y se reintenta al sincronizar (no debería “reaparecer” solo por merge).

Límite del tier gratis: **10 productos** en portafolio local. Al intentar guardar el 11.º se abre un modal: **Exportar JSON** o **eliminar** productos (listados del más antiguo al más reciente). Tras liberar espacio, el guardado se reintenta si venías del corazón del informe.

Al llenarse verás también el mensaje:

> *Portafolio local limitado a 10 productos. Exporta JSON o elimina uno para liberar espacio.*

#### Exportaciones disponibles (sin API)

| Acción | Formato | Dónde |
|--------|---------|-------|
| **Exportar Portafolio** | JSON | Portafolio |
| **Exportar CSV** | CSV | Cabecera del reporte |
| **CSV Shopify** | CSV listo para importar en Shopify | Cabecera del reporte |
| **CSV WooCommerce** | CSV listo para importar en WooCommerce | Cabecera del reporte |
| **Exportar MD** | Markdown | Cabecera del reporte |
| **Descargar kit de campaña** | Markdown (.md) | Cabecera del reporte o detalle en portafolio |
| **Exportar PDF Reporte** | PDF vía impresión del navegador | Cabecera del reporte |

El **kit de campaña** incluye resumen, bullets, ángulos, copys Meta/TikTok/email y notas de CTA — listo para tu equipo o Notion.

**CSV Shopify / WooCommerce:** generan un producto a partir del informe (título, descripción HTML, precio, coste, SEO). No conectan tu tienda; descargas el archivo y lo importas tú en el admin de cada plataforma.

---

## 5. Ruta con API (Gemini)

### 5.1 BYOK — tu propia clave

**BYOK** (*Bring Your Own Key*) = traes tu propia clave de Google Gemini.

1. Obtén una clave gratis en [Google AI Studio](https://aistudio.google.com/apikey).
2. En DropDeep, abre **Ajustes** (icono engranaje).
3. Pega tu clave en **Gemini API Key:** (formato `AIzaSy...`).
4. Elige **Modelo de Inteligencia** (por defecto: Gemini 2.5 Flash).
5. Pulsa **Guardar Clave**.

La clave se guarda **solo en tu navegador** (`localStorage`):

- Sin sesión: clave anónima en este dispositivo.
- Con sesión: clave asociada a tu usuario (`dropdeep_gemini_key_<uuid>`).

**Privacidad BYOK:** la clave **no se envía a DropDeep**. En modo BYOK solo viaja a Google (`generativelanguage.googleapis.com`) desde tu navegador. Si usas el **proxy** (sesión sin clave guardada), las llamadas van a tu función Supabase y la clave Gemini vive en el servidor — tu BYOK no se reenvía al proxy cuando está guardada (prioridad BYOK).

**Nunca** pegues la clave en variables `VITE_*` ni la subas al repositorio.

#### Prioridad BYOK vs proxy (importante)

Si guardaste una **clave Gemini válida en Ajustes**, Deep Research y Spy usan **BYOK** (llamadas directas a Google), **aunque** tengas sesión iniciada y el sitio tenga `VITE_GEMINI_PROXY=true`. La terminal mostrará *Usando BYOK — clave Gemini personal (llamadas directas a Google)*.

Si **no** hay clave guardada pero sí sesión + proxy activo, se usa el **proxy** (cuota diaria). La terminal mostrará *Usando proxy seguro Supabase (clave Gemini en servidor)*.

| Situación | Qué usa la API automática |
|-----------|---------------------------|
| BYOK guardada en Ajustes (con o sin sesión) | **BYOK** (tu cuota Gemini) |
| Sesión + proxy activo, **sin** clave guardada | **Proxy** (cuota diaria de investigaciones) |
| Sin sesión + BYOK en Ajustes | **BYOK** |
| Sin sesión + proxy configurado | Mensaje: requiere login o BYOK |
| Sin sesión + sin clave | Redirige a Modo Copiloto |

En **Ajustes**, el hint resume la regla: *Con clave personal se usa BYOK; sin clave y con cuenta se usa el proxy (cuota diaria).*

### 5.2 Proxy con cuenta y cuota diaria

Si el sitio tiene `VITE_GEMINI_PROXY=true` y la Edge Function `gemini-proxy` desplegada en Supabase:

1. **Inicia sesión** (**Entrar** / **Crear cuenta** / **Continuar con Google**).
2. Las llamadas usan la clave del servidor (secreto `GEMINI_API_KEY` en Supabase).
3. Cuota starter: **2 investigaciones por día** por usuario — **no** 2 llamadas Gemini sueltas. Una sesión Completo (5 pasos internos) o Rápido (2 pasos) consume **1** investigación. Configurable con `GEMINI_PROXY_DAILY_LIMIT` en el servidor; la UI refleja `VITE_FREE_TIER_PROXY_DAILY` (default **2**). El contador se renueva cada **día UTC**.
4. **Anti-abuso (T20):** máx. **10 peticiones / 10 s** por usuario; cooldown de **~30 s** entre investigaciones *nuevas*; prompts &gt; ~100 000 caracteres se rechazan (413). Los logs del proxy no incluyen el texto del prompt. Aplica `supabase/migrations/005_proxy_abuse.sql` y redespliega `gemini-proxy`.

**Dónde ver la cuota restante (logueado + proxy, sin BYOK guardada):**

| Ubicación | Qué muestra |
|-----------|-------------|
| **Menú usuario** (cabecera) | Badge persistente, p. ej. `Proxy: 1/2 hoy · 1 restante` o `Proxy agotado` |
| Desplegable del menú | Detalle: investigaciones restantes hoy (día UTC) |
| Hint de profundidad (Inicio) | Tras usar proxy: `Proxy: N/M investigaciones hoy` |

Si guardaste **BYOK** en Ajustes, el menú muestra **Usando BYOK** — no implica consumo de cuota proxy. Sin sesión o con proxy desactivado en el sitio, **no** se muestra cuota falsa.

Sin sesión con proxy configurado, verás:

> *El proxy Gemini requiere iniciar sesión. Entra con tu cuenta, usa Modo Copiloto gratis, o configura BYOK en Ajustes.*

### 5.3 Modo Express, Rápido y Completo

Toggle **Profundidad** junto al buscador:

| Modo | Pasos Copiloto | Pasos API automática | Qué obtienes |
|------|----------------|---------------------|--------------|
| **Express** | 1 | — (API usa **Completo** si eliges Con API) | Reporte base + copys en un pegado; secciones avanzadas omitidas con mensaje honesto |
| **Rápido** | 2 | 2 | Reporte base + copys básicos; secciones omitidas: *No generado en modo rápido — corre Completo para obtener esta sección.* |
| **Completo** | 5 | 5 | Informe máximo: avatar, offer, UGC, landing, emails, ads, Shopify |

> **Express es solo para Copiloto.** Con **Con API (Automático)** y profundidad Express seleccionada, la app ejecuta el flujo **Completo** (5 pasos Gemini). Cambia a **Rápido** o **Completo** explícitamente si usas API.

Si un paso API falla al parsear, las secciones afectadas muestran *No generado — reintenta o usa Completo/Copiloto* y un banner **Secciones incompletas** en el informe (sin datos inventados).

La preferencia se guarda en `localStorage`. En el informe aparece badge **Modo Rápido** o **Modo Express** cuando aplica.

### 5.4 Qué cambia respecto al Copiloto

| Aspecto | Copiloto | API automática |
|---------|----------|----------------|
| Coste | Chatbot gratis que elijas | Tu cuota Gemini o proxy (**2 investigaciones/día** starter) |
| Esfuerzo | Copiar/pegar cada paso | Automático en terminal de investigación |
| Resultado | Mismo esquema JSON | Mismo esquema JSON |
| Badge | **Generado en modo copiloto** | Sin badge de copiloto |
| Cancelación | Cerrar modal | **Cancelar investigación** en terminal |
| Errores | JSON inválido en modal | Mensajes en español + **Abrir Ajustes** / **Reintentar** |
| Caché | Sí (24 h) | Sí (24 h) |

Si eliges **Con API (Automático)** sin clave ni proxy activo, la app te redirige al Copiloto con:

> *Sin API configurada — usa Modo Copiloto (gratis) o pega tu clave en Ajustes.*

---

## 6. Tu primer producto en ~15 minutos

Flujo recomendado para principiantes:

| Min | Acción |
|-----|--------|
| 0–2 | Abre [DropDeep](https://oscarkleinkopf.github.io/Dropdeep/). Si aparece, pulsa **Continuar gratis** en el banner de tier operativo. |
| 2–4 | Pulsa **¿Primera vez? Configura tu primer producto (~60 s)** (wizard). Elige vertical, nombre opcional. En el paso final: **Copiar pack** es la acción primaria (sin nombre); Copiloto/API piden nombre. Un borrador aparece en Portafolio con etiqueta **Borrador**. |
| 4–10 | En Inicio: **Gratis (Copiloto)** + **Express** (default). Nombre del producto → **Iniciar Modo Copiloto**. Un solo copy/pega en tu chatbot gratis. |
| 10–12 | *(Opcional)* Repite con **Rápido** (2 pasos) o **Completo** (5 pasos) si quieres avatar, UGC y emails. |
| 12–14 | Revisa el informe. Ajusta costo/precio en la barra de snapshot si tienes datos reales del proveedor. |
| 14–15 | **Guardar en Portafolio** → **Descargar kit de campaña**. |

**Complemento opcional (5 min):** **Evaluación manual (sin IA)** con tus criterios reales de margen y proveedores.

**Acelerador opcional:** configura BYOK en **Ajustes** y cambia a **Con API (Automático)** para la próxima investigación.

---

## 7. Cómo leer un informe de investigación

### Barra superior (snapshot)

Métricas editables: **Costo Proveedor**, **Precio Retail**, **Margen Neto**, **ROI Est.**, **Envío Promedio**, **Saturación**, **Tendencia**.

### Panel Precios Audisio (Chile / CLP)

Bajo la calculadora de ads aparece **Precios Audisio**: reglas offline del **método Audisio & Domingo** (no son cotizaciones ni datos de Meta en vivo).

| Control / dato | Qué hace |
|----------------|----------|
| **CLP por 1 USD** | Tipo de cambio **editable** (se guarda en tu navegador). Por defecto 950 — ajústalo a tu realidad. |
| **PVP sugerido (costo × 2.5)** | Si el costo es 10 USD, sugiere ~25 USD. Botón **Aplicar PVP sugerido al retail**. |
| **Tu PVP en CLP** | Equivalente del retail actual. Alerta roja si estás bajo el **piso 20.000 CLP**. |
| **Banda recomendada** | 40.000–100.000 CLP. |
| **Margen bruto (USD)** | Retail − costo. El método pide **más de 15 USD** por unidad. |
| **Contribución %** | (Retail − costo) / retail. Objetivo orientativo ~**35%** (aproxima el margen neto del método; no incluye IVA Chile, pasarela ni ads). |
| **Budget test ads** | Referencia **300 USD** el primer mes / mes y medio; después autofinanciar. |

Si el margen va corto, verás una pista de **oferta/regalo** de alto valor percibido sin bajar el PVP bajo el piso CLP.

Al cambiar costo/precio se recalcula margen, ROI y **Product Score**.

### Product Score (informe)

Puntuación 0–100 calculada automáticamente con estos pesos:

| Factor | Peso en Product Score |
|--------|----------------------|
| Margen | 25% |
| Saturación (invertida: menos saturación = mejor) | 20% |
| Tendencia | 20% |
| Envío (días) | 15% |
| ROI | 20% |

**Etiquetas del badge:**

| Score | Etiqueta |
|-------|----------|
| ≥ 75 | **Excelente** |
| 50–74 | **Viable** |
| < 50 | **Riesgoso** |

En el informe, pasa el cursor sobre el badge **Product Score** para ver la fórmula en español. Junto al badge hay el enlace **Completar evaluación manual** (criterios tuyos, distintos del score automático).

> **Importante:** El **Product Score** del informe y el score de **Evaluación manual** usan criterios distintos. En el **comparador**, si **todos** los productos seleccionados tienen evaluación manual, la fila **Cuál lanzar primero** usa la evaluación manual; si no, usa Product Score (sin mezclar criterios ni inventar scores).

### Próxima decisión (panel en el informe)

Debajo de la barra del reporte verás el bloque **Próxima decisión** con:

| Elemento | Descripción |
|----------|-------------|
| **Veredicto** | **Lanzar**, **Validar más** o **Descartar** (mismos umbrales que evaluación manual: ≥70 / 45–69 / &lt;45) |
| **Fuente** | Si completaste **Evaluación manual**, usa ese veredicto y explicación. Si no, muestra sugerencia orientativa desde **Product Score** con aviso de que no sustituye la evaluación manual |
| **Acciones** | **Guardar en portafolio**, **Evaluación manual** (si falta), **Exportar kit**, **Ir a comparar** / **Comparar seleccionados**, y **Completar secciones** si el informe es Rápido/Express o tiene secciones incompletas |

En informes **Modo Rápido** o **Express**, el panel recuerda que faltan secciones y ofrece activar **Modo Completo** para reinvestigar.

### Feedback dogfooding (local)

Debajo de **Próxima decisión** hay un panel **¿Te ayudó a decidir?** (Sí / No / Aún no sé + nota opcional). Se guarda **solo en este navegador** (`dropdeep_report_feedback_{slug}`); no se envía a Supabase ni se incluye al exportar el portafolio JSON. En Portafolio verás un badge **FB** si ya dejaste feedback.

### Secciones del sidebar (24 pestañas)

| # | Sección | Para qué sirve | Decisión que ayuda |
|---|---------|----------------|-------------------|
| 01 | Demografía y Psicografía | Quién compra, qué cree, qué frustra | ¿Existe un avatar claro para tus ads? |
| 02 | Soluciones y Reseñas | Qué probó antes el cliente | ¿Tu producto mejora algo concreto vs alternativas? |
| 03 | Curiosidades y Mecanismos | UMP/UMS narrativos; gráfico de tendencia **ilustrativo** (no Google Trends en vivo) | ¿Tienes historia para el copy? |
| 04 | La Caída del Edén | Contraste antes/después emocional | ¿Qué transformación vendes? |
| 05 | Swipe File (Textuales) | Frases literales de compradores | Copia directa para anuncios |
| 06 | Ángulos y Ganchos de Copy | 5 ángulos con hook y titular | Elige 1–2 ángulos para testear |
| 07 | Avatar Brief | Ficha psicográfica profunda | Brief para creativos UGC |
| 08 | Offer Brief | Oferta, objeciones, big idea | Estructura de landing y precio |
| 09 | Scripts de Video (UGC) | Guiones 30–60 s | Graba o encarga creativos |
| 10 | Generador de Landing | Outline + HTML | Base de página de producto |
| 11 | Comparador heurístico de titulares | Variantes de titular | Puntuación offline — **no predice CTR** |
| 12 | Análisis de Competencia | Ganchos vs competidor | Diferenciación |
| 13 | Proveedores Dropshipping | AliExpress, CJ, etc. | Sourcing y margen real |
| 14 | Secuencias de Email | 5 emails | Automatización post-compra |
| 15 | Anuncios Meta & TikTok | Copys listos | Lanza campañas |
| 16 | Ficha de Shopify | Título, meta, FAQ | Publicación en tienda |
| 17 | Customer Journey Map | Etapas del comprador | Retargeting y secuencias |
| 18 | Prompts para Mockups | Imágenes de producto | Creativos visuales |
| 19 | Prompts para Chatbot | Secuencia enriquecida | Iterar con IA externa |
| 20 | Simulador Montecarlo | Escenarios P10/P50/P90 + plan de test Audisio ($300, ritmo $10–20/día, aviso CPA/aprendizaje) | ¿Cuánto riesgo asumes antes de gastar en ads? |
| 21 | Bundles & Upsells Engine | Packs 1x/2x/3x + guion one-click upsell generados desde el **retail del informe** (mix heurístico 35/50/15); el % AOV estimado no es predicción de ventas reales | Subir AOV en checkout |
| 22 | Bloques HTML de Conversión | Tabla comparativa, grilla de beneficios y FAQ listos para copiar | Acelerar la página de producto |
| 23 | Guiones WhatsApp & Soporte | Mensajes de cierre y objeciones | Venta manual por chat |
| 24 | VSL & Lanzamiento Audisio | 3 guiones Hook→Body→CTA + specs CapCut/Canva/ElevenLabs + checklist de lanzamiento | ¿Tienes creativos y presupuesto listos antes de gastar? |

**Simulador Montecarlo:** proyección **orientativa** con 1000 ensayos; no predice resultados reales de Meta/Google Ads. Defaults del método: presupuesto **$10/día** (o preset **$20**), CPC ~$0.15 (banda Chile), pool de test **$300 USD** el primer mes / mes y medio y luego **autofinanciar**. Si el CPA proyectado (CPC ÷ conversión) deja pocos pedidos en esos $300, verás un aviso de riesgo de quemar el budget sin aprendizaje.

### Kit VSL & checklist de lanzamiento (sección 24)

Plantillas **offline** del método Audisio & Domingo (no predicen CTR ni ventas):

| Bloque | Qué incluye |
|--------|-------------|
| Specs | Videos 20–60 s; hook 3–7 s; CapCut Montserrat 13; Canva Poppins; hook visual MAYÚSCULAS negro/blanco; locución ~1.15× |
| Guiones | 3 ángulos (dolor, testimonio, oferta) con botones de copiar; se rellenan con dolor/beneficio del informe si existen |
| Checklist | Mín. 5 videos, 5–10 imágenes, calentamiento 1–2 días a $5/día, lanzamiento principiante $10/día ≥ 4 días (o $20 si ya tienes experiencia), sin audiencia manual | 

El estado de la checklist se guarda en `localStorage` por nombre de producto. El **kit de campaña** (export `.md`) incluye esta sección.

**Bundles & Upsells (sección 21):** los precios de packs y el incremento de AOV se calculan offline con `generateBundleStructure` a partir del precio retail del informe (2x ≈ 1.60× retail con “20% OFF”, 3x ≈ 1.95× con “35% OFF”, upsell post-compra al 50%). El boost de AOV asume un mix de compra 35% / 50% / 15% entre packs — úsalo como plantilla de oferta, no como forecast.

**Regla práctica:** si Product Score es **Riesgoso** (< 50) pero Evaluación manual dice **Lanzar**, confía más en tus números reales de margen y proveedor (manual). Si ambos coinciden en descartar, pivotea.

**Gráfico de tendencia (sección 03):** muestra una curva **offline** derivada del campo *Tendencia* del informe (ej. `+120%`). **No son datos verificados de Google Trends.** Si falta el dato, verás *Sin datos de tendencia verificados para mostrar el gráfico.*

### Spy — Análisis de URL (Gemini)

En **Spy → Análisis de URL (Gemini)** pegas la URL de una tienda o producto. Con BYOK o proxy, Gemini **infiere** CMS, precios y ganchos. DropDeep:

| Qué verás | Qué significa |
|-----------|----------------|
| Banner + badge **Inferido por IA** | No es un scraper HTML ni una fuente verificada |
| Pixel / TikTok Pixel / GA4 = **No verificado** | No leemos el HTML de la tienda; se ignora cualquier Sí/No inventado por el modelo |
| Checklist manual | Sin API: copia URL → visita la tienda → anota PVP/gancho → Copiloto o Evaluación manual |

### Spy — Intereses Meta (referencia)

En **Spy → Meta Hidden Interests** el disclaimer está **visible de entrada**: lista **curada offline** para inspiración — **no** son audiencias Meta en vivo. Verifica siempre en Meta Ads Manager antes de gastar presupuesto.

### Auditoría Meta Ads Chile (pestaña Spy)

En **Spy → Auditoría Meta Ads (Chile)** pegas métricas de tu Ads Manager. DropDeep **no** se conecta a Meta.

| Entrada | Uso |
|---------|-----|
| PVP y costo producto (CLP) | Calcula **CPA máximo** = margen final tras IVA AliExpress 19%, pasarela, Shopify e IVA venta (editables en “avanzado”) |
| CPA campaña | Si supera el CPA máx → alerta *estás perdiendo plata* |
| CTR / CPC / ATC / CPM | Semáforo con umbrales Audisio Chile (CTR mín. 2%; CPC ideal 100–200 CLP; ATC 1k–3k o 1/5–1/3 del CPA máx; CPM típico 3k–6k, 10k–15k OK en nicho competitivo) |

Botón **Prefill desde informe abierto** convierte retail/costo USD del informe a CLP con el FX guardado en Precios Audisio.

## 8. Comparar productos y decidir cuál lanzar primero

1. Guarda al menos **2 productos** en **Portafolio**.
2. Marca las casillas de comparación en la lista.
3. Pulsa **Comparar (N)**.

Límites:

| Estado | Máximo a comparar |
|--------|-------------------|
| Sin sesión | **2** nichos |
| Con sesión | **3** nichos |

Sin sesión, al intentar más de 2:

> *Plan gratis: compara hasta 2 nichos. Inicia sesión para comparar 3 (Pro próximamente).*

La fila **Cuál lanzar primero** marca **🚀 Lanza primero** según esta regla:

| Situación | Señal para recomendar |
|-----------|------------------------|
| **Todos** tienen evaluación manual | Mayor puntuación manual (desempate por veredicto Lanzar > Validar más > Descartar) |
| Solo algunos o ninguno con evaluación manual | Mayor **Product Score** |

El texto superior del comparador indica explícitamente qué señal usó la recomendación, p. ej.:

> *Recomendación basada en Evaluación manual — todos los productos tienen checklist completado.*

o

> *Recomendación basada en Product Score — completa evaluación manual en todos para comparar con tus criterios.*

Filas dedicadas: **Evaluación manual (puntuación)**, **Evaluación manual (veredicto)** — muestran *Sin evaluación* si falta. También verás origen del reporte: **Copiloto**, **API** o **Manual**.

---

## 9. Cuenta, privacidad y datos

### Qué se guarda dónde

| Dato | Local (`localStorage`) | Supabase (nube) |
|------|------------------------|-----------------|
| Portafolio | Sí, siempre | Sí, si hay sesión (`research_reports`); borrar local también borra remoto (T19) |
| Caché de reportes (24 h) | Sí | No |
| Clave Gemini BYOK | Sí, por dispositivo/usuario | **Nunca** |
| Preferencias Gemini (modelo, idioma) | Sí | Perfil (`profiles`) si hay sesión |
| Evaluación manual | Dentro del reporte en portafolio | Igual que reportes |
| Feedback dogfooding por informe | Sí (`dropdeep_report_feedback_*`) | **Nunca** |

### Cuenta opcional

- **Entrar** / **Crear cuenta** / **Continuar con Google**
- Beneficios: sync de portafolio, comparar 3 productos, créditos proxy diarios.
- Sin Supabase configurado: banner *Las cuentas de usuario están desactivadas en este despliegue. La app funciona en modo local.*

### Límites honestos (v1)

| Límite | Valor |
|--------|-------|
| Portafolio local | 10 productos |
| Comparar sin sesión | 2 productos |
| Comparar con sesión | 3 productos |
| Proxy Gemini (starter) | 2 **investigaciones**/día/usuario (no llamadas sueltas) |
| Caché de investigación | 24 horas |

### Exportaciones y seguridad

- Los JSON exportados **eliminan** campos sensibles (`apiKey`, `geminiKey`, `secret`, etc.).
- Contenido de IA en Spy se escapa para reducir riesgo XSS.

---

## 10. Solución de problemas

Mensajes **reales** de la app y qué hacer:

### Clave API de Gemini

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Clave API de Gemini no válida** — *La clave guardada fue rechazada por Google...* | Clave incorrecta o revocada | **Abrir Ajustes** → nueva clave desde AI Studio → **Reintentar** |
| **Sin clave API de Gemini** (banner) | No hay BYOK y no usas proxy | **Modo Copiloto**, evaluación manual y packs funcionan gratis; configura clave solo para Deep Research automático o Spy con IA |
| *Sin clave API — abriendo Modo Copiloto gratis.* | API seleccionada sin clave | Normal; continúa en copiloto o añade clave |

### Cuota y proxy

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Cuota diaria de proxy agotada** — *Cuota diaria agotada (N investigaciones/día)...* | 2 investigaciones/día consumidas vía proxy | Guarda tu clave BYOK en Ajustes (prioriza BYOK aunque tengas sesión), espera al día siguiente, o usa Modo Copiloto gratis. |
| **Demasiadas peticiones al proxy** | Burst &gt; 10 req / 10 s (anti-abuso) | Espera unos segundos → **Reintentar**, o BYOK / Copiloto |
| **Espera antes de otra investigación** | Cooldown ~30 s entre sesiones proxy nuevas | Espera e inténtalo de nuevo |
| **Prompt demasiado grande para el proxy** | Contents &gt; ~100k caracteres | Acorta contexto o BYOK |
| **Cuota o límite de peticiones alcanzado** — *Has superado el límite de tu plan Gemini...* | Límite de Google (HTTP 429 / quota) en BYOK | Espera minutos; revisa cuota en AI Studio → **Reintentar** |
| **Sesión requerida para el proxy** — *Inicia sesión para usar el proxy Gemini o configura tu propia clave en Ajustes.* | Proxy activo sin login | **Entrar** o BYOK |

> **Sobre el código 429:** puede significar cuota diaria del **proxy** (investigaciones/día) o rate limit de **Gemini BYOK**. Lee el título del error: *Cuota diaria de proxy agotada* vs *Cuota o límite de peticiones alcanzado*.

### Red y proxy caído

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Error de conexión o servicio temporal** — *No se pudo contactar con Gemini...* | Internet o saturación | Revisa conexión → **Reintentar** |
| **Proxy Gemini no disponible** — *El proxy seguro de Supabase no respondió...* | Edge Function no desplegada | BYOK temporalmente o contacta al admin del sitio |

### Modo Copiloto / JSON

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| *Pega la respuesta del chatbot antes de procesar.* | Textarea vacío | Pega la respuesta completa |
| *JSON inválido o truncado…* (+ tip markdown/comillas + **Reintentar**) | Pegado incompleto o con \`\`\`json | Quita markdown, copia hasta el `}` final, **Reintentar**; opcional **Ver ejemplo de JSON** |
| *Falta el reporte base… "name" o "demographics"* (u otro campo del paso) | JSON parseable pero incompleto | Abre **Ver ejemplo de JSON** y pide al chatbot ese esquema |
| *Avatar Brief inválido: falta el objeto "general".* (u otros de validación) | Paso incompleto | Regenera ese paso en el chatbot con el prompt exacto |
| *No hay sesión de copiloto activa.* | Modal cerrado sin retomar | Usa **Retomar copiloto** en Inicio o reinicia **Iniciar Modo Copiloto** |

### Investigación API

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Investigación cancelada** — *Detuviste la investigación...* | Pulsaste **Cancelar investigación** o la sesión se abortó (cuota/cancel) | Relanza cuando quieras; si cancelaste a mitad, no se guarda informe parcial |
| **Respuesta de Gemini ilegible** — *El modelo devolvió un formato que no pudimos interpretar...* | Modelo devolvió texto no JSON | Cambia modelo en **Ajustes** → **Reintentar** |
| **Error en Deep Research** | Error genérico | **Abrir Ajustes** / **Reintentar**; revisa consola si persiste |

### Portafolio

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| *Portafolio limitado a 10 productos. Exporta JSON o elimina uno.* | Cap alcanzado | Modal: exportar o eliminar; o **Exportar Portafolio** desde el menú |

### Precios Audisio / Meta Ads Chile

| Situación | Causa | Qué hacer |
|-----------|-------|-----------|
| CLP “raro” vs tu banco | FX por defecto (950) **no** es feed en vivo | Edita **CLP por 1 USD** en Precios Audisio; se guarda en el navegador |
| Auditoría pide PVP/costo y no trae datos de Meta | **No hay sync Meta** | Pega métricas desde Ads Manager o usa **Prefill desde informe** |
| Score alto pero veredicto **Validar más** | Falló un **gate Winner** | Revisa pilares / tamaño / margen &gt; \$15 / CPA en el modal de evaluación manual |
| Montecarlo avisa pocos pedidos con \$300 | CPA proyectado (CPC ÷ conv.) alto | Baja CPC asumido, sube conversión, o no gastes el pool hasta mejorar oferta |

---

## 11. Glosario

| Término | Significado |
|---------|-------------|
| **Nicho** | Segmento de mercado (ej. mascotas, belleza). |
| **Ángulo** | Enfoque narrativo de un anuncio (dolor, curiosidad, prueba social…). |
| **UGC** | *User Generated Content* — videos estilo usuario real (TikTok/Reels). |
| **AOV** | *Average Order Value* — ticket medio por pedido; upsells lo aumentan. |
| **Saturación** | Qué tan competido está el producto (0% = vacío, 100% = muy competido). |
| **UMP** | *Unique Mechanism of Problem* — explicación del problema que vendes. |
| **UMS** | *Unique Mechanism of Solution* — por qué tu producto funciona. |
| **BYOK** | *Bring Your Own Key* — usas tu clave Gemini en el navegador. |
| **Proxy** | Servidor Supabase que llama a Gemini por ti (requiere cuenta). |
| **Product Score** | Puntuación automática del informe (margen, saturación, tendencia, envío, ROI). |
| **Modo Copiloto** | Flujo gratis copy/pega con chatbot externo. |
| **Modo Express** | Copiloto en 1 pegado (investigación + copys); default sin API. |
| **Deep Research** | Investigación automática vía API Gemini (BYOK o proxy). |
| **Investigación (cuota proxy)** | Una ejecución Completo o Rápido vía proxy = 1 unidad diaria (varios pasos Gemini internos). |
| **Kit de campaña** | Export `.md` con resumen listo para lanzar ads, emails y kit VSL/checklist Audisio. |
| **Verbatim** | Frase textual de un comprador real (foros, reseñas). |
| **Dropshipping** | Vender sin stock propio; el proveedor envía al cliente final. |
| **Método Audisio & Domingo** | Reglas de negocio DropDeep para Chile (×2.5, banda CLP, margen, test \$300, Winner, auditoría Meta, VSL). Offline — ver [§12](#12-metodología-audisio-y-domingo-chile). |
| **VSL** | *Video Sales Letter* corto (20–60 s) con Hook → Body → CTA; plantillas en sección 24 del informe. |
| **PVP** | Precio de venta al público (retail en el snapshot). |
| **FX (CLP/USD)** | Tipo de cambio editable en el panel Audisio; no es feed en vivo. |
| **CPA máximo** | Margen final por venta tras costo+IVA, pasarela, Shopify e IVA venta — techo del CPA de campaña (auditor Spy). |
| **ATC** | Costo por Add to Cart en Meta Ads (CLP). |
| **Gates Winner** | Condiciones que bloquean el veredicto **Lanzar** en evaluación manual: ≥1 pilar Winner, empaque ≤ caja de zapatos, margen bruto &gt; \$15, CPA proyectado en banda de test. |
| **CPA proyectado (Montecarlo)** | Estimación offline ≈ CPC ÷ (conversión %). No es el CPA de Ads Manager. |

---

## 12. Metodología Audisio y Domingo (Chile)

DropDeep incorpora reglas de negocio del **método Audisio y Domingo** orientadas a dropshipping en **Chile (precios y umbrales en CLP / USD)**. Sirven para decidir precio, validar un “winner”, auditar métricas de Meta que **tú pegas**, planificar un test de ads de **\$300** y preparar creativos VSL — no para predecir ventas.

### Disclaimers (léelos antes de confiar en un número)

| Qué sí | Qué no |
|--------|-------|
| Cálculos **offline** en tu navegador con las constantes del método | Cotizaciones bancarias, FX en vivo ni scrapers |
| FX **editable** (CLP por 1 USD) guardado en `localStorage` | Feed oficial de tipo de cambio |
| Auditoría Meta con métricas que **pegas** desde Ads Manager | Conexión a **Meta Ads API**, sync de campañas ni datos inventados |
| Umbrales Chile (CTR, CPC, ATC, CPM, CPA máx.) como **referencia** | Garantía de resultados en tu cuenta publicitaria |
| Montecarlo / VSL / checklist como **plantillas orientativas** | Predicción de CTR, ROAS o learning phase de Meta |

Si operas fuera de Chile, usa el FX editable y trata las bandas CLP como punto de partida, no como ley local.

### Dónde aparece en la app

| Pieza del método | Dónde |
|------------------|-------|
| Precios (×2.5, piso/banda CLP, margen &gt; \$15, ~35%, test \$300) | Informe → panel **Precios Audisio** (bajo la calculadora) |
| Gates Winner + rúbrica | **Evaluación manual (sin IA)** — ver [§4.3](#43-evaluación-manual--gates-winner-audisio) |
| CPA máximo + semáforo CTR/CPC/ATC/CPM | **Spy → Auditoría Meta Ads (Chile)** |
| Pool \$300, ritmo \$10–\$20/día, autofinanciar | Informe → sección **20 Montecarlo** |
| Guiones VSL + checklist de lanzamiento | Informe → sección **24** |

### Reglas de precio (resumen)

| Regla | Valor de referencia |
|-------|---------------------|
| Multiplicador costo → PVP | × **2.5** |
| Piso de venta en tienda | **20.000 CLP** |
| Banda recomendada de PVP | **40.000–100.000 CLP** |
| Margen bruto mínimo | **&gt; 15 USD** por unidad |
| Contribución orientativa | ~**35%** (retail − costo) / retail — sin IVA/pasarela/ads |
| Presupuesto de test ads | **300 USD** el primer mes / mes y medio → luego **autofinanciar** |
| Ritmo diario típico | **\$10/día** principiante · **\$20/día** si ya tienes experiencia |

Detalle de controles en el informe: [Panel Precios Audisio](#panel-precios-audisio-chile--clp).

### Cuándo usar la Auditoría Meta Ads (Chile)

Úsala **después** de tener una campaña real (o al menos gastos y métricas en Ads Manager):

1. Abre **Spy → Auditoría Meta Ads (Chile)**.
2. Pega **PVP y costo en CLP** (o **Prefill desde informe abierto**, que usa el FX guardado en Precios Audisio).
3. Revisa el **CPA máximo**: si el CPA de campaña lo supera, el método interpreta que **estás perdiendo plata** por venta pagada.
4. Completa CTR / CPC / ATC / CPM para el semáforo (umbrales Chile: CTR mín. ~2%; CPC ideal 100–200 CLP; etc.).

No hace falta API key de Meta. Sin métricas reales, el panel no inventa resultados — solo calcula con lo que ingresas.

Detalle: [Auditoría Meta Ads Chile](#auditoría-meta-ads-chile-pestaña-spy).

### Winner gates (decisión Lanzar)

En evaluación manual, aunque el score sea ≥ 70, **no** obtienes **Lanzar** si falla un gate (pilares, tamaño/envío, margen bruto o CPA proyectado). Completa los campos de margen/CPA/ticket del modal para ver el estado de cada gate.

### Orden práctico sugerido

1. Ajusta costo/retail + FX en **Precios Audisio**.
2. Corre **Evaluación manual** (gates Winner).
3. Simula el test de **\$300** en **Montecarlo** (sección 20).
4. Prepara creativos con **VSL & Lanzamiento** (sección 24).
5. Cuando tengas métricas reales → **Auditoría Meta Ads** en Spy.

---

## Documentación relacionada

- [CHANGELOG.md](../CHANGELOG.md) — historial de cambios visibles para el usuario.
- [README.md](../README.md) — instalación, despliegue y configuración técnica.
- [PLAN-MEJORAS.md](PLAN-MEJORAS.md) — *para desarrolladores*: roadmap interno y tareas técnicas (no es guía de usuario).

*¿Encontraste un error en este manual? Abre un issue en [GitHub](https://github.com/oscarkleinkopf/Dropdeep/issues) o corrige el código y actualiza este archivo en el mismo commit (ver regla `.cursor/rules/docs-manual.mdc`).*
