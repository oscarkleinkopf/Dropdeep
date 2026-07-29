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
2. **Profundidad:** `Completo` (5 pasos) vs `Rápido` (2 pasos).
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
5. Copia el prompt que necesites y pégalo en **ChatGPT, Gemini, Claude o DeepSeek** (versión web gratuita).

> **Nota:** Los packs son **plantillas de arranque**. Para un informe completo dentro de DropDeep, usa **Modo Copiloto** o la API.

Si ya tienes un reporte abierto, la **Secuencia maestra (5 fases)** se enriquece automáticamente con datos reales de ese reporte.

### 4.2 Modo Copiloto paso a paso

El **Modo Copiloto** genera el **mismo JSON estructurado** que Deep Research con API. La diferencia: tú copias cada prompt, lo ejecutas en un chatbot gratis y pegas la respuesta de vuelta en DropDeep.

#### Cómo iniciarlo

1. En **Inicio**, deja **Método → Gratis (Copiloto)**.
2. Elige **Profundidad** (Completo o Rápido).
3. Escribe el nombre del producto y pulsa **Iniciar Modo Copiloto**.

Se abre el modal **Modo Copiloto Gratis** con tres pasos visibles:

1. **Copiar prompt** → botón **Copiar prompt**
2. **Pegar en tu chatbot gratis** (ChatGPT, Gemini, Claude, DeepSeek web)
3. **Pegar aquí la respuesta** → **Procesar respuesta**

#### Pasos según profundidad

| Profundidad | Pasos del copiloto | Contenido |
|-------------|-------------------|-----------|
| **Completo** | 5 | Reporte base → Avatar Brief → Offer Brief → Creativos (UGC + landing) → Materiales de marketing |
| **Rápido** | 2 | Reporte base → Copys publicitarios básicos |

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

### 5.2 Proxy con cuenta y cuota diaria

Si el sitio tiene `VITE_GEMINI_PROXY=true` y la Edge Function `gemini-proxy` desplegada en Supabase:

1. **Inicia sesión** (**Entrar** / **Crear cuenta** / **Continuar con Google**).
2. Las llamadas usan la clave del servidor (secreto `GEMINI_API_KEY` en Supabase).
3. Cuota starter: **2 investigaciones por día** por usuario (configurable con `GEMINI_PROXY_DAILY_LIMIT` en el servidor; la UI muestra `VITE_FREE_TIER_PROXY_DAILY`, default 2).

Sin sesión con proxy configurado, verás:

> *El proxy Gemini requiere iniciar sesión. Entra con tu cuenta, usa Modo Copiloto gratis, o configura BYOK en Ajustes.*

### 5.3 Modo Rápido vs Completo

Toggle **Profundidad** junto al buscador:

| Modo | Pasos API / Copiloto | Qué obtienes |
|------|---------------------|--------------|
| **Completo** | 5 | Informe máximo: avatar, offer, UGC, landing, emails, ads, Shopify |
| **Rápido** | 2 | Reporte base + copys básicos; secciones omitidas muestran: *No generado en modo rápido — corre Completo para obtener esta sección.* |

La preferencia se guarda en `localStorage`. En el informe aparece badge **Modo Rápido** cuando aplica.

### 5.4 Qué cambia respecto al Copiloto

| Aspecto | Copiloto | API automática |
|---------|----------|----------------|
| Coste | Chatbot gratis que elijas | Tu cuota Gemini o proxy (2/día starter) |
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
| 4–12 | En Inicio: **Gratis (Copiloto)** + **Rápido** (o **Completo** si quieres todo). Nombre del producto → **Iniciar Modo Copiloto**. Completa los 2 o 5 pasos copy/pega. |
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
| 03 | Curiosidades y Mecanismos | UMP/UMS narrativos | ¿Tienes historia para el copy? |
| 04 | La Caída del Edén | Contraste antes/después emocional | ¿Qué transformación vendes? |
| 05 | Swipe File (Textuales) | Frases literales de compradores | Copia directa para anuncios |
| 06 | Ángulos y Ganchos de Copy | 5 ángulos con hook y titular | Elige 1–2 ángulos para testear |
| 07 | Avatar Brief | Ficha psicográfica profunda | Brief para creativos UGC |
| 08 | Offer Brief | Oferta, objeciones, big idea | Estructura de landing y precio |
| 09 | Scripts de Video (UGC) | Guiones 30–60 s | Graba o encarga creativos |
| 10 | Generador de Landing | Outline + HTML | Base de página de producto |
| 11 | Simulador A/B Testing | Variantes de titular | Prioriza tests de copy |
| 12 | Análisis de Competencia | Ganchos vs competidor | Diferenciación |
| 13 | Proveedores Dropshipping | AliExpress, CJ, etc. | Sourcing y margen real |
| 14 | Secuencias de Email | 5 emails | Automatización post-compra |
| 15 | Anuncios Meta & TikTok | Copys listos | Lanza campañas |
| 16 | Ficha de Shopify | Título, meta, FAQ | Publicación en tienda |
| 17 | Customer Journey Map | Etapas del comprador | Retargeting y secuencias |
| 18 | Prompts para Mockups | Imágenes de producto | Creativos visuales |
| 19 | Prompts para Chatbot | Secuencia enriquecida | Iterar con IA externa |

**Regla práctica:** si Product Score es **Riesgoso** (< 50) pero Evaluación manual dice **Lanzar**, confía más en tus números reales de margen y proveedor (manual). Si ambos coinciden en descartar, pivotea.

---

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
| Proxy Gemini (starter) | 2 llamadas/día/usuario |
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
| **Sin clave API de Gemini** (banner) | No hay BYOK y no usas proxy | Usa **Modo Copiloto** o configura clave en **Ajustes** |
| *Sin clave API — abriendo Modo Copiloto gratis.* | API seleccionada sin clave | Normal; continúa en copiloto o añade clave |

### Cuota y proxy

| Mensaje | Causa | Qué hacer |
|---------|-------|-----------|
| **Cuota diaria de proxy agotada** — *Cuota diaria agotada. Pega tu clave Gemini... o vuelve mañana.* | 2/día consumidas | BYOK en **Ajustes** o espera al día siguiente |
| **Cuota o límite de peticiones alcanzado** — *Has superado el límite de tu plan Gemini...* | Límite de Google | Espera minutos; revisa cuota en AI Studio → **Reintentar** |
| **Sesión requerida para el proxy** — *Inicia sesión para usar el proxy Gemini o configura tu propia clave en Ajustes.* | Proxy activo sin login | **Entrar** o BYOK |

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
| **Investigación cancelada** — *Detuviste la investigación...* | Pulsaste **Cancelar investigación** | Relanza cuando quieras |
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
| **Deep Research** | Investigación automática vía API Gemini (BYOK o proxy). |
| **Kit de campaña** | Export `.md` con resumen listo para lanzar ads y emails. |
| **Verbatim** | Frase textual de un comprador real (foros, reseñas). |
| **Dropshipping** | Vender sin stock propio; el proveedor envía al cliente final. |

---

## Documentación relacionada

- [CHANGELOG.md](../CHANGELOG.md) — historial de cambios visibles para el usuario.
- [README.md](../README.md) — instalación, despliegue y configuración técnica.

*¿Encontraste un error en este manual? Abre un issue en [GitHub](https://github.com/oscarkleinkopf/Dropdeep/issues) o corrige el código y actualiza este archivo en el mismo commit (ver regla `.cursor/rules/docs-manual.mdc`).*
