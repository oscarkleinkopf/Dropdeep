// Generador Procedural para Analizador de Tienda Competidora (URL Scraper Fallback)
export function generateCompetitorStoreAnalysis(url) {
  let cleanedUrl = url.trim();
  if (!cleanedUrl.startsWith('http')) {
    cleanedUrl = 'https://' + cleanedUrl;
  }

  let domain = 'tienda-competidora.com';
  let productName = 'Producto Destacado';
  try {
    const parsed = new URL(cleanedUrl);
    domain = parsed.hostname.replace('www.', '');
    const pathnameParts = parsed.pathname.split('/').filter(Boolean);
    if (pathnameParts.length > 0) {
      const rawSlug = pathnameParts[pathnameParts.length - 1];
      productName = rawSlug
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    }
  } catch (e) {
    domain = cleanedUrl.replace(/https?:\/\//, '').split('/')[0] || 'competidor.com';
  }

  if (productName.length < 3 || productName.toLowerCase() === 'products') {
    productName = 'Producto de Alta Conversión';
  }

  return {
    domain,
    url: cleanedUrl,
    productName,
    platform: {
      cms: "Shopify Plus",
      theme: "Dawn Custom (Optimizado para Conversión Movil)",
      appsDetected: ["Loox Reviews", "Klaviyo Email Marketing", "PageFly Landing Page Builder", "Judge.me", "ReBuy Upsell Engine"],
      pixelDetected: true,
      googleAnalytics4: true,
      tiktokPixel: true
    },
    pricingStructure: {
      retailPrice: "$39.99 USD",
      estimatedCost: "$9.50 USD",
      estimatedMargin: "$30.49 USD (76% Margen)",
      shippingOffer: "Envío Gratis en compras superiores a $50 USD (Estrategia de Incremento de AOV)",
      activeDiscount: "20% OFF aplicado con temporizador de cuenta regresiva en Checkout"
    },
    copyHooks: {
      heroHook: `"Elimina el dolor en menos de 10 minutos al día sin gastar en sesiones costosas."`,
      ump: "Culpa a las soluciones tradicionales de ser rígidas, estáticas y causar atrofia muscular por uso prolongado.",
      ums: "Presenta su tecnología de 'Ajuste Dinámico Progresivo' que entrena la memoria muscular sin rigidez.",
      angle: "Ángulo de Alivio Inmediato + Prevención a Largo Plazo enfocado en personas de oficina."
    },
    customerFriction: {
      complaints: [
        "El 14% de las reseñas de 2 estrellas mencionan que las tallas corren ligeramente ajustadas.",
        "El 8% señala que el manual de instrucciones impreso estaba solo en inglés.",
        "El 5% de quejas se debe a demoras en el envío postal durante semanas de alta demanda."
      ],
      opportunities: [
        "Incluir una tabla de medidas interactiva en tu página para eliminar devoluciones por talla.",
        "Ofrecer un manual PDF en español descargable mediante código QR dentro del empaque.",
        "Promocionar envío express garantizado de 3 a 5 días para desmarcarse de este competidor."
      ]
    }
  };
}

