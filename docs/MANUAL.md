# Manual de usuario — DropDeep

> **Versión del manual:** alineada con el código en `master`.  
> **App en vivo:** [https://oscarkleinkopf.github.io/Dropdeep/](https://oscarkleinkopf.github.io/Dropdeep/)

---

## Tabla de contenidos

1. [¿Qué es DropDeep y qué problema resuelve?](#1-qué-es-dropdeep-y-qué-problema-resuelve)
2. [Qué NO hace DropDeep](#2-qué-no-hace-dropdeep)
3. [Conoce la interfaz](#3-conoce-la-interfaz)
4. [Ruta gratis (sin API de pago)](#4-ruta-gratis-sin-api-de-pago)
   - [4.1 Packs por vertical en Prompt Hub](#41-packs-por-vertical-en-prompt-hub)
   - [4.2 Modo Copiloto paso a paso](#42-modo-copiloto-paso-a-paso)
   - [4.3 Evaluación manual (10 criterios)](#43-evaluación-manual-10-criterios)
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

---

## 1. ¿Qué es DropDeep y qué problema resuelve?

**DropDeep** es una herramienta web (PWA) para emprendedores que empiezan en **dropshipping**. Te ayuda a investigar un producto antes de invertir en tienda, stock o anuncios.

El problema que resuelve: cuando ves un producto “viral” en TikTok o AliExpress, no sabes si vale la pena. DropDeep te guía para obtener un **informe estructurado** con:

- Datos de viabilidad (costo, precio, margen, ROI, saturación, envío).
- Perfil del comprador y frases reales que usaría en anuncios.
- Ángulos de marketing, scripts UGC, copys para Meta/TikTok, emails y ficha de producto.
- Un **Product Score** (0–100) para comparar opciones.

**Filosofía del producto:** el camino gratuito debe ser **realmente útil**. No necesitas pagar ni registrarte para investigar con **Modo Copiloto**, **Evaluación manual** o **Prompt Hub**. La API de Gemini (BYOK o proxy) es un **acelerador opcional** que automatiza el mismo flujo.

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
| Espía competidores sin IA | **Spy** (análisis de URL de tienda) requiere clave Gemini BYOK o proxy con sesión; sin API verás un mensaje claro, no datos inventados. |
| Sincroniza en la nube sin cuenta | El portafolio local funciona sin login; la nube (Supabase) es opcional. |

---

## 3. Conoce la interfaz

### Navegación principal

| Pestaña | Qué hace |
|---------|----------|
| **Inicio** | Buscador, métricas de tu actividad e investigaciones recientes. |
| **Portafolio** | Productos guardados, notas, comparación y exportación. |
| **Prompts** | Prompt Hub: secuencia maestra o packs por vertical (sin API). |
| **Spy** | Espionaje competitivo (URL de tienda + intereses Meta ocultos). |

### Buscador en Inicio

Tres controles importantes:

1. **Método:** `Gratis (Copiloto)` vs `Con API (Automático)`.
2. **Profundidad:** `Express` (1 pegado) · `Rápido` (2 pasos) · `Completo` (5 pasos). Por defecto: **Express** (ideal sin API).
3. **Campo de producto** + URL de competidor opcional.

Botones secundarios:

- **Evaluación manual (sin IA)** — checklist offline.
- **Generar prompts sin API** — abre Prompt Hub.

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
- Al terminar → toast **Reporte completo — generado en modo copiloto.** y badge **Generado en modo copiloto** en el informe.

#### Consejos para el Copiloto

- Pide al chatbot **solo JSON**, sin texto extra. Si devuelve markdown con \`\`\`json, quita los delimitadores antes de pegar.
- Si falla el parseo, usa **Reintentar** y pega de nuevo.
- **Cancelar** cierra la sesión de copiloto sin guardar el informe incompleto.

### 4.3 Evaluación manual (10 criterios)

La **Evaluación manual (sin IA)** es un checklist **100% offline** con puntuación determinística. Ideal para validar una idea antes de invertir tiempo en prompts o API.

**Cómo abrirla:** botón **Evaluación manual (sin IA)** en Inicio, o desde el panel **Primeros pasos**.

#### Los 10 criterios y sus pesos reales

| # | Criterio | Peso |
|---|----------|------|
| 1 | Margen neto (costo vs precio de venta) | **15%** |
| 2 | Problema que resuelve / factor wow | **12%** |
| 3 | Tamaño y peso de envío | **10%** |
| 4 | Saturación / competencia visible | **12%** |
| 5 | Disponibilidad de proveedores | **10%** |
| 6 | Estacionalidad | **8%** |
| 7 | Riesgo de políticas de anuncios (Meta/TikTok) | **10%** |
| 8 | Potencial de UGC / creativos | **8%** |
| 9 | Ticket promedio y potencial AOV/upsell | **10%** |
| 10 | Devoluciones / fragilidad del producto | **5%** |

**Total:** 100%.

Los criterios 1–4, 8–10 usan un **deslizador** de 0 a 100. Los criterios 5–7 usan **opciones predefinidas** con puntuación fija (ej. proveedores: “Varios proveedores confiables” = 100).

#### Veredictos automáticos

| Score | Veredicto |
|-------|-----------|
| ≥ 70 | **Lanzar** |
| 45–69 | **Validar más** |
| < 45 | **Descartar** |

La explicación incluye fortalezas, puntos débiles y alertas (margen bajo, riesgo en ads, sin proveedor).

**Guardar:** **Guardar en portafolio** o **Guardar y ver reporte**.

### 4.4 Guardar en portafolio y exportar

#### Guardar

Desde un informe: **Guardar en Portafolio** (corazón en la barra del reporte).

Límite del tier gratis: **10 productos** en portafolio local. Al llenarse verás:

> *Portafolio local limitado a 10 productos. Exporta JSON o elimina uno para liberar espacio.*

#### Exportaciones disponibles (sin API)

| Acción | Formato | Dónde |
|--------|---------|-------|
| **Exportar Portafolio** | JSON | Portafolio |
| **Exportar CSV** | CSV | Cabecera del reporte |
| **Exportar MD** | Markdown | Cabecera del reporte |
| **Descargar kit de campaña** | Markdown (.md) | Cabecera del reporte o detalle en portafolio |
| **Exportar PDF Reporte** | PDF vía impresión del navegador | Cabecera del reporte |

El **kit de campaña** incluye resumen, bullets, ángulos, copys Meta/TikTok/email y notas de CTA — listo para tu equipo o Notion.

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
3. Cuota starter: **2 investigaciones por día** por usuario — **no** 2 llamadas Gemini sueltas. Una sesión Completo (5 pasos internos) o Rápido (2 pasos) consume **1** investigación. Configurable con `GEMINI_PROXY_DAILY_LIMIT` en el servidor; la UI refleja `VITE_FREE_TIER_PROXY_DAILY` (default **2**). Tras investigar vía proxy, el hint de profundidad puede mostrar `Proxy: 1/2 investigaciones hoy`.

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
| 2–4 | Pulsa **¿Primera vez? Configura tu primer producto (~60 s)** (wizard). Elige vertical (ej. **Mascotas & Pets**), nombre opcional, copia un pack. |
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

> **Importante:** El **Product Score** del informe y el score de **Evaluación manual** usan criterios distintos. El comparador usa Product Score, no el checklist manual.

### Secciones del sidebar (19 pestañas)

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

**Regla práctica:** si Product Score es **Riesgoso** (< 50) pero Evaluación manual dice **Lanzar**, confía más en tus números reales de margen y proveedor (manual). Si ambos coinciden en descartar, pivotea.

**Gráfico de tendencia (sección 03):** muestra una curva **offline** derivada del campo *Tendencia* del informe (ej. `+120%`). **No son datos verificados de Google Trends.** Si falta el dato, verás *Sin datos de tendencia verificados para mostrar el gráfico.*

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

La fila **Cuál lanzar primero** marca **🚀 Lanza primero** al producto con mayor **Product Score** entre los seleccionados. El texto aclara:

> *Veredicto basado únicamente en Product Score y métricas del reporte — sin proyecciones de ventas inventadas.*

También verás evaluación manual (si existe) y origen del reporte: **Copiloto**, **API** o **Manual**.

---

## 9. Cuenta, privacidad y datos

### Qué se guarda dónde

| Dato | Local (`localStorage`) | Supabase (nube) |
|------|------------------------|-----------------|
| Portafolio | Sí, siempre | Sí, si hay sesión (`research_reports`) |
| Caché de reportes (24 h) | Sí | No |
| Clave Gemini BYOK | Sí, por dispositivo/usuario | **Nunca** |
| Preferencias Gemini (modelo, idioma) | Sí | Perfil (`profiles`) si hay sesión |
| Evaluación manual | Dentro del reporte en portafolio | Igual que reportes |
| Onboarding / wizard completado | Sí | No |

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
| *No se pudo interpretar la respuesta como JSON válido.* (+ **Reintentar**) | JSON mal formado o con markdown | Pide al chatbot solo JSON; quita \`\`\`; **Reintentar** |
| *Avatar Brief inválido: falta el objeto "general".* (u otros de validación) | Paso incompleto | Regenera ese paso en el chatbot con el prompt exacto |
| *No hay sesión de copiloto activa.* | Modal cerrado a medias | Reinicia **Iniciar Modo Copiloto** |

### Investigación API

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Investigación cancelada** — *Detuviste la investigación...* | Pulsaste **Cancelar investigación** o la sesión se abortó (cuota/cancel) | Relanza cuando quieras; si cancelaste a mitad, no se guarda informe parcial |
| **Respuesta de Gemini ilegible** — *El modelo devolvió un formato que no pudimos interpretar...* | Modelo devolvió texto no JSON | Cambia modelo en **Ajustes** → **Reintentar** |
| **Error en Deep Research** | Error genérico | **Abrir Ajustes** / **Reintentar**; revisa consola si persiste |

### Portafolio

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| *Portafolio limitado a 10 productos. Exporta JSON o elimina uno.* | Cap alcanzado | **Exportar Portafolio** y elimina entradas viejas |

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
| **Kit de campaña** | Export `.md` con resumen listo para lanzar ads y emails. |
| **Verbatim** | Frase textual de un comprador real (foros, reseñas). |
| **Dropshipping** | Vender sin stock propio; el proveedor envía al cliente final. |

---

## Documentación relacionada

- [CHANGELOG.md](../CHANGELOG.md) — historial de cambios visibles para el usuario.
- [README.md](../README.md) — instalación, despliegue y configuración técnica.
- [PLAN-MEJORAS.md](PLAN-MEJORAS.md) — *para desarrolladores*: roadmap interno y tareas técnicas (no es guía de usuario).

*¿Encontraste un error en este manual? Abre un issue en [GitHub](https://github.com/oscarkleinkopf/Dropdeep/issues) o corrige el código y actualiza este archivo en el mismo commit (ver regla `.cursor/rules/docs-manual.mdc`).*
