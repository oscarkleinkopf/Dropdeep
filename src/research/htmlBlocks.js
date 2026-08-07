import { escapeHtml } from '../utils/sanitize.js';

// High-Converting HTML Page Builder Blocks Generator for Shopify & WooCommerce

export function generateHTMLConversionBlocks(report) {
  const name = escapeHtml(report.name || "Producto Destacado");
  const retail = typeof report.retail === 'number' ? report.retail : (parseFloat(report.retail) || 39.99);

  // 1. Comparison Table HTML (Our Solution vs Traditional Solutions)
  const comparisonTableHtml = `
<div style="max-width: 800px; margin: 2rem auto; font-family: system-ui, -apple-system, sans-serif;">
  <h3 style="text-align: center; font-size: 1.4rem; font-weight: 700; margin-bottom: 1.5rem; color: #111827;">
    ¿Por qué escoger <span style="color: #06b6d4;">${name}</span> frente a las soluciones tradicionales?
  </h3>
  <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem;">
      <thead>
        <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
          <th style="padding: 1rem; color: #374151;">Criterio de Evaluación</th>
          <th style="padding: 1rem; color: #059669; font-weight: 700; background-color: #ecfdf5;">✓ ${name}</th>
          <th style="padding: 1rem; color: #dc2626; opacity: 0.8;">✕ Soluciones Tradicionales</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 1rem; font-weight: 600; color: #1f2937;">Mecanismo de Alivio</td>
          <td style="padding: 1rem; background-color: #f0fdf4; color: #065f46;">Diseño Ergonómico Adaptativo de Acción Rápida</td>
          <td style="padding: 1rem; color: #9ca3af;">Estático, rígido o requiere sesiones costosas</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 1rem; font-weight: 600; color: #1f2937;">Facilidad de Uso</td>
          <td style="padding: 1rem; background-color: #f0fdf4; color: #065f46;">100% Portátil y listo en menos de 30 segundos</td>
          <td style="padding: 1rem; color: #9ca3af;">Complejo, pesado o requiere instalación técnica</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 1rem; font-weight: 600; color: #1f2937;">Durabilidad & Calidad</td>
          <td style="padding: 1rem; background-color: #f0fdf4; color: #065f46;">Materiales Grado Premium Resistentes al Uso Diario</td>
          <td style="padding: 1rem; color: #9ca3af;">Plásticos frágiles que se desgastan rápidamente</td>
        </tr>
        <tr>
          <td style="padding: 1rem; font-weight: 600; color: #1f2937;">Garantía de Satisfacción</td>
          <td style="padding: 1rem; background-color: #f0fdf4; color: #065f46;">30 Días de Prueba Libre de Riesgo</td>
          <td style="padding: 1rem; color: #9ca3af;">Sin devoluciones ni soporte al comprador</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
  `.trim();

  // 2. Benefits Grid HTML (4 Cards)
  const benefitsGridHtml = `
<div style="max-width: 900px; margin: 2rem auto; font-family: system-ui, -apple-system, sans-serif;">
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem;">
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⚡</div>
      <h4 style="font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem 0;">Resultados Inmediatos</h4>
      <p style="font-size: 0.85rem; color: #6b7280; margin: 0; line-height: 1.4;">Siente la diferencia desde el primer día de uso sin complicaciones.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🌿</div>
      <h4 style="font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem 0;">100% Seguro y Ergonómico</h4>
      <p style="font-size: 0.85rem; color: #6b7280; margin: 0; line-height: 1.4;">Diseñado pensando en tu bienestar y comodidad diaria.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📦</div>
      <h4 style="font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem 0;">Envío Rápido y Seguido</h4>
      <p style="font-size: 0.85rem; color: #6b7280; margin: 0; line-height: 1.4;">Despacho directo con código de seguimiento en tiempo real.</p>
    </div>
    <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.25rem; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🛡️</div>
      <h4 style="font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem 0;">Garantía Total de 30 Días</h4>
      <p style="font-size: 0.85rem; color: #6b7280; margin: 0; line-height: 1.4;">Si no te satisface el producto, te devolvemos tu dinero.</p>
    </div>
  </div>
</div>
  `.trim();

  // 3. Interactive FAQ Accordion HTML (<details> / <summary>)
  const faqAccordionHtml = `
<div style="max-width: 750px; margin: 2rem auto; font-family: system-ui, -apple-system, sans-serif;">
  <h3 style="text-align: center; font-size: 1.3rem; font-weight: 700; margin-bottom: 1.25rem; color: #111827;">Preguntas Frecuentes</h3>
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.85rem 1.1rem; background: #ffffff; cursor: pointer;">
      <summary style="font-weight: 600; font-size: 0.95rem; color: #1f2937; outline: none;">¿Es adecuado para usar todos los días?</summary>
      <p style="margin-top: 0.5rem; font-size: 0.88rem; color: #4b5563; line-height: 1.5;">Sí, ${name} está diseñado con materiales ultra-cómodos y transpirables para uso diario prolongado sin causar irritación.</p>
    </details>
    <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.85rem 1.1rem; background: #ffffff; cursor: pointer;">
      <summary style="font-weight: 600; font-size: 0.95rem; color: #1f2937; outline: none;">¿Cuánto tiempo tarda en llegar mi pedido?</summary>
      <p style="margin-top: 0.5rem; font-size: 0.88rem; color: #4b5563; line-height: 1.5;">Los envíos se procesan en 24 horas hábiles y el tiempo de entrega promedio es de 3 a 7 días hábiles según tu ubicación.</p>
    </details>
    <details style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.85rem 1.1rem; background: #ffffff; cursor: pointer;">
      <summary style="font-weight: 600; font-size: 0.95rem; color: #1f2937; outline: none;">¿Qué pasa si el producto no cumple mis expectativas?</summary>
      <p style="margin-top: 0.5rem; font-size: 0.88rem; color: #4b5563; line-height: 1.5;">Contamos con una política de reembolso de 30 días. Simplemente contacta a nuestro equipo de soporte y procesaremos tu devolución sin complicaciones.</p>
    </details>
  </div>
</div>
  `.trim();

  return {
    comparisonTableHtml,
    benefitsGridHtml,
    faqAccordionHtml
  };
}
