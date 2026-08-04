// Bundles & One-Click Upsells Engine for E-Commerce AOV Boost

export function generateBundleStructure(report) {
  const name = report.name || "Producto Destacado";
  const retail = typeof report.retail === 'number' ? report.retail : (parseFloat(report.retail) || 39.99);

  // 1x Pack (Base)
  const pack1 = {
    units: 1,
    title: "1x Unidad (Prueba Inicial)",
    unitPrice: retail,
    totalPrice: retail,
    badge: "Estándar",
    discount: "0%",
    shipping: "Envío Estándar ($4.99)"
  };

  // 2x Pack (Popular - 20% OFF)
  const price2x = Math.round(retail * 1.60 * 100) / 100;
  const pack2 = {
    units: 2,
    title: "2x Unidades (Paquete Pareja)",
    unitPrice: Math.round((price2x / 2) * 100) / 100,
    totalPrice: price2x,
    badge: "MÁS POPULAR",
    discount: "20% OFF",
    shipping: "Envío Gratis Garantizado"
  };

  // 3x Pack (Mejor Valor - 35% OFF + VIP Gift)
  const price3x = Math.round(retail * 1.95 * 100) / 100;
  const pack3 = {
    units: 3,
    title: "3x Unidades (Paquete Familiar)",
    unitPrice: Math.round((price3x / 3) * 100) / 100,
    totalPrice: price3x,
    badge: "MEJOR VALOR",
    discount: "35% OFF",
    shipping: "Envío VIP Exprés + Regalo Sorpresa"
  };

  // Post-purchase One-Click Upsell
  const upsellPrice = Math.round(retail * 0.50 * 100) / 100;
  const upsellScript = `¡ESPERA! Tu pedido de "${name}" ha sido confirmado con éxito.\n\nComo cliente de hoy, puedes agregar una SEGUNDA UNIDAD para un familiar o de repuesto por solo $${upsellPrice.toFixed(2)} adicionales (50% OFF de 1 sola vez).\n\nEsta oferta especial vencerá al cerrar esta página.`;

  // Estimated AOV Boost calculation
  const weightedAov = Math.round((retail * 0.35 + price2x * 0.50 + price3x * 0.15) * 100) / 100;
  const aovBoostPercent = Math.round(((weightedAov - retail) / retail) * 100);

  return {
    name,
    pack1,
    pack2,
    pack3,
    weightedAov,
    aovBoostPercent,
    upsellPrice,
    upsellScript
  };
}
