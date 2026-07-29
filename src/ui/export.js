import { state } from '../state.js';
import { showToast } from '../utils/toast.js';
import { calculateProductScore } from '../research/scoring.js';

const SENSITIVE_KEY_PATTERN = /^(api[_-]?key|gemini[_-]?key|password|secret|token)$/i;

function stripSensitiveFields(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(stripSensitiveFields);
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) continue;
    out[key] = stripSensitiveFields(value);
  }
  return out;
}

export function exportPortfolioJSON() {
  if (state.portfolio.length === 0) {
    showToast("No hay productos en el portafolio para exportar.", "error");
    return;
  }

  const safePortfolio = stripSensitiveFields(state.portfolio);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(safePortfolio, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `dropdeep_portfolio_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Portafolio exportado exitosamente como JSON.", "success");
}

// EXPORT SINGLE REPORT TO CSV
export function exportReportToCSV(report) {
  const rows = [];
  
  // Helper to add sections
  const addHeader = (title) => {
    rows.push([`=== ${title.toUpperCase()} ===`, "", ""]);
  };
  
  const addRow = (key, value) => {
    rows.push([key, value]);
  };

  // 1. Snapshot
  addHeader("Métricas de Viabilidad");
  addRow("Producto", report.name);
  addRow("Categoría", report.categoryId);
  addRow("Costo Proveedor ($)", report.cost);
  addRow("Precio Sugerido ($)", report.retail);
  addRow("Margen Neto ($)", report.margin);
  addRow("ROI (%)", `${report.roi}%`);
  addRow("Envío Promedio (días)", report.shipping);
  addRow("Saturación (%)", `${report.saturation}%`);
  addRow("Tendencia", report.trend);
  rows.push([]);

  // 2. Demographics
  addHeader("Demografía y Psicografía");
  addRow("Quién es", report.demographics.who);
  addRow("Creencia Central", report.demographics.belief);
  addRow("Hopes & Dreams", report.demographics.dreams);
  addRow("Victories & Defeats", report.demographics.defeats);
  addRow("Outside Forces (Culpables)", report.demographics.outsideForces);
  addRow("Prejuicios", report.demographics.prejudices);
  rows.push([]);

  // 3. Solutions
  addHeader("Análisis de Soluciones Existentes");
  addRow("Soluciones Actuales", report.solutions.current);
  addRow("Experiencia del Usuario", report.solutions.experience);
  addRow("Lo que Aman", report.solutions.likes);
  addRow("Lo que Detestan", report.solutions.dislikes);
  addRow("Escepticismo", report.solutions.skepticism);
  report.solutions.horrorStories.forEach((story, idx) => {
    addRow(`Historia de Terror #${idx+1}`, story);
  });
  rows.push([]);

  // 4. Offer Brief
  addHeader("Ficha de Oferta (Offer Brief)");
  addRow("Nombres Sugeridos", report.offerBrief.names.join(", "));
  addRow("Nivel de Consciencia", report.offerBrief.awareness);
  addRow("Nivel de Sofisticación", report.offerBrief.sophistication);
  addRow("Gran Idea (Big Idea)", report.offerBrief.bigIdea);
  addRow("Metáfora", report.offerBrief.metaphor);
  addRow("Mecanismo del Problema (UMP)", report.offerBrief.ump);
  addRow("Mecanismo de la Solución (UMS)", report.offerBrief.ums);
  addRow("Guía / Gurú", report.offerBrief.guru);
  addRow("Historia de Descubrimiento", report.offerBrief.discovery);
  addRow("Producto / Oferta", report.offerBrief.product);
  addRow("Funnel Recomendado", report.offerBrief.funnel);
  addRow("Dominios Propuestos", report.offerBrief.domains.join(" | "));
  report.offerBrief.objections.forEach((obj, idx) => {
    addRow(`Manejo de Objeción #${idx+1}`, obj);
  });
  rows.push([]);

  // 5. Marketing Angles & Copy
  addHeader("Ángulos de Marketing y Ganchos");
  report.angles.forEach((angle, idx) => {
    addRow(`Ángulo #${idx+1} - Título`, angle.title);
    addRow(`Ángulo #${idx+1} - Narrativa`, angle.narrative);
    addRow(`Ángulo #${idx+1} - Hook`, angle.hook);
    addRow(`Ángulo #${idx+1} - Titular`, angle.headline);
  });
  rows.push([]);

  // 6. UGC Scripts
  addHeader("Scripts de Video UGC");
  report.ugcScripts.forEach((script, idx) => {
    addRow(`UGC Script #${idx+1} - Título`, script.title);
    addRow(`UGC Script #${idx+1} - Duración`, script.duration);
    script.scenes.forEach((scene, sIdx) => {
      addRow(`UGC Script #${idx+1} - Escena #${sIdx+1} [${scene.time}]`, `Visual: ${scene.visual} | Audio: ${scene.audio} | Pantalla: [${scene.text}]`);
    });
  });
  rows.push([]);

  // 7. Competitor
  addHeader("Análisis de Competencia");
  addRow("Ganchos del Competidor", report.competitorAnalysis.competitorsGanchos.join(" | "));
  addRow("Nuestros Ganchos de Desvío", report.competitorAnalysis.ourGanchos.join(" | "));
  addRow("Debilidades Competidor", report.competitorAnalysis.weaknesses);
  addRow("Nuestra Estrategia", report.competitorAnalysis.differentiation);
  rows.push([]);

  // 8. Suppliers
  addHeader("Proveedores Recomendados (Dropshipping)");
  if (report.suppliers && report.suppliers.length > 0) {
    report.suppliers.forEach((sup, idx) => {
      addRow(`Proveedor #${idx+1} - Plataforma`, sup.platform);
      addRow(`Proveedor #${idx+1} - Nombre`, sup.name);
      addRow(`Proveedor #${idx+1} - Costo Prod ($)`, sup.price);
      addRow(`Proveedor #${idx+1} - Costo Envío ($)`, sup.shippingCost);
      addRow(`Proveedor #${idx+1} - Tiempo de Envío (días)`, sup.shippingTime);
      addRow(`Proveedor #${idx+1} - Enlace`, sup.link);
    });
  } else {
    addRow("Proveedores", "No hay proveedores disponibles.");
  }
  rows.push([]);

  // 9. Email Sequence
  addHeader("Secuencia de Email Marketing");
  if (report.emailSequence && report.emailSequence.length > 0) {
    report.emailSequence.forEach((mail, idx) => {
      addRow(`Email #${idx+1} - Asunto`, mail.subject);
      addRow(`Email #${idx+1} - Previsualización`, mail.preview);
      addRow(`Email #${idx+1} - Cuerpo`, mail.body);
    });
  }
  rows.push([]);

  // 10. Ad Copies
  addHeader("Copys Publicitarios");
  if (report.adCopy) {
    if (report.adCopy.facebook) {
      report.adCopy.facebook.forEach((ad, idx) => {
        addRow(`Meta Ad #${idx+1} - Texto Principal`, ad.primaryText);
        addRow(`Meta Ad #${idx+1} - Titular`, ad.headline);
        addRow(`Meta Ad #${idx+1} - Descripción`, ad.description);
      });
    }
    if (report.adCopy.tiktok) {
      report.adCopy.tiktok.forEach((ad, idx) => {
        addRow(`TikTok Ad #${idx+1} - Gancho (Hook)`, ad.hook);
        addRow(`TikTok Ad #${idx+1} - Cuerpo`, ad.body);
        addRow(`TikTok Ad #${idx+1} - CTA`, ad.cta);
      });
    }
  }
  rows.push([]);

  // 11. Shopify Description
  addHeader("Ficha de Shopify");
  if (report.shopifyDescription) {
    addRow("Shopify - Título", report.shopifyDescription.title);
    addRow("Shopify - Meta Description", report.shopifyDescription.metaDescription);
    addRow("Shopify - Cuerpo HTML", report.shopifyDescription.body);
    if (report.shopifyDescription.faq) {
      report.shopifyDescription.faq.forEach((f, idx) => {
        addRow(`Shopify - FAQ #${idx+1} Pregunta`, f.q);
        addRow(`Shopify - FAQ #${idx+1} Respuesta`, f.a);
      });
    }
  }
  
  // Format CSV Content
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + rows.map(r => r.map(val => {
        const text = String(val === undefined || val === null ? "" : val);
        const escaped = text.replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")).join("\n");
      
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", encodeURI(csvContent));
  downloadAnchor.setAttribute("download", `dropdeep_report_${report.name.toLowerCase().replace(/ /g, '-')}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Reporte exportado exitosamente como CSV.", "success");
}

// EXPORT SINGLE REPORT TO MARKDOWN/NOTION COMPATIBLE
export function exportReportToMarkdown(report) {
  const score = report.productScore || calculateProductScore(report);
  let md = `# Deep Research: ${report.name}\n\n`;
  md += `* **Categoría:** ${report.categoryId.toUpperCase()}\n`;
  md += `* **Fecha de Generación:** ${new Date().toLocaleDateString()}\n`;
  md += `* **Product Score:** ${score}/100\n\n`;

  md += `## 📊 Métricas Financieras y de Viabilidad\n\n`;
  md += `| Métrica | Valor |\n`;
  md += `|---|---|\n`;
  md += `| Costo Proveedor | $${report.cost.toFixed(2)} |\n`;
  md += `| Precio de Venta Sugerido | $${report.retail.toFixed(2)} |\n`;
  md += `| Margen Neto | $${report.margin.toFixed(2)} |\n`;
  md += `| ROI Estimado | ${report.roi}% |\n`;
  md += `| Tiempo de Envío Medio | ${report.shipping} días |\n`;
  md += `| Saturación de Mercado | ${report.saturation}% |\n`;
  md += `| Tendencia de Búsqueda | ${report.trend} |\n\n`;

  md += `## 👥 Perfil Demográfico y Psicografía\n\n`;
  md += `* **Público Objetivo:** ${report.demographics.who}\n`;
  md += `* **Filosofía / Creencia:** "${report.demographics.belief}"\n`;
  md += `* **Esperanzas y Sueños (Dreams):** ${report.demographics.dreams}\n`;
  md += `* **Frustraciones y Dolores (Defeats):** ${report.demographics.defeats}\n`;
  md += `* **Culpables Externos (Scapegoats):** ${report.demographics.outsideForces}\n`;
  md += `* **Prejuicios:** ${report.demographics.prejudices}\n\n`;

  md += `## 🔍 Sentimiento de Mercado y Competidores\n\n`;
  md += `* **Solución Actual:** ${report.solutions.current}\n`;
  md += `* **Experiencia de Uso:** ${report.solutions.experience}\n`;
  md += `* **Lo que Valoran:** ${report.solutions.likes}\n`;
  md += `* **Lo que Detestan:** ${report.solutions.dislikes}\n`;
  md += `* **Escepticismo del Mercado:** ${report.solutions.skepticism}\n\n`;
  md += `### Historias de Terror de Clientes\n\n`;
  if (report.solutions.horrorStories) {
    report.solutions.horrorStories.forEach(h => {
      md += `> ${h}\n\n`;
    });
  }

  md += `## 💡 Curiosidades y Mecanismos de la Oferta\n\n`;
  md += `* **Curiosidad Histórica:** ${report.secrets.historical}\n`;
  md += `* **Ángulo de Conspiración:** ${report.secrets.conspiracy}\n`;
  md += `* **Mecanismo Único del Problema (UMP):** ${report.secrets.mechanismProblem}\n`;
  md += `* **Mecanismo Único de Solución (UMS):** ${report.secrets.mechanismSolution}\n\n`;

  md += `## 🏛️ La Caída del Edén\n\n`;
  md += `* **Edad de Oro (Golden Age):** ${report.eden.goldenAge}\n`;
  md += `* **El Corruptor:** ${report.eden.corruptor}\n`;
  md += `* **Contraste Vital:** ${report.eden.contrast}\n\n`;

  md += `## ✍️ Swipe File (Frases Textuales de Clientes)\n\n`;
  if (report.verbatims) {
    report.verbatims.forEach(v => {
      md += `* "${v}"\n`;
    });
  }
  md += `\n`;

  md += `## 🎯 Ángulos y Ganchos Publicitarios\n\n`;
  if (report.angles) {
    report.angles.forEach(a => {
      md += `### ${a.title}\n`;
      md += `* **Narrativa:** ${a.narrative}\n`;
      md += `* **Gancho (Hook):** *"${a.hook}"*\n`;
      md += `* **Titular de Anuncio (Headline):** **"${a.headline}"**\n\n`;
    });
  }

  md += `## 📹 Guiones para Videos Cortos (UGC)\n\n`;
  if (report.ugcScripts) {
    report.ugcScripts.forEach((s, idx) => {
      md += `### Guión #${idx+1}: ${s.title} (${s.duration})\n\n`;
      md += `| Tiempo | Visual | Audio | Texto en Pantalla |\n`;
      md += `|---|---|---|---|\n`;
      s.scenes.forEach(sc => {
        md += `| ${sc.time} | ${sc.visual} | "${sc.audio}" | [${sc.text}] |\n`;
      });
      md += `\n`;
    });
  }

  md += `## 🛡️ Estructuración de Oferta (Offer Brief)\n\n`;
  md += `* **Nombres Sugeridos:** ${report.offerBrief.names.join(', ')}\n`;
  md += `* **Nivel de Consciencia:** ${report.offerBrief.awareness}\n`;
  md += `* **Nivel de Sofisticación:** ${report.offerBrief.sophistication}\n`;
  md += `* **Gran Idea (Big Idea):** ${report.offerBrief.bigIdea}\n`;
  md += `* **Metáfora Emotiva:** "${report.offerBrief.metaphor}"\n`;
  md += `* **Guía / Gurú:** ${report.offerBrief.guru}\n`;
  md += `* **Embudo Recomendado:** ${report.offerBrief.funnel}\n`;
  md += `* **Dominios Sugeridos:** ${report.offerBrief.domains.join(' | ')}\n\n`;
  
  md += `### Derribo de Objeciones Críticas\n\n`;
  if (report.offerBrief.objections) {
    report.offerBrief.objections.forEach(o => {
      md += `* **Pregunta / Objeción:** ${o}\n`;
    });
  }
  md += `\n`;

  md += `## 📊 Análisis Competitivo\n\n`;
  md += `* **Ganchos Saturados de la Competencia:**\n`;
  report.competitorAnalysis.competitorsGanchos.forEach(g => md += `  - ${g}\n`);
  md += `* **Nuestros Ganchos de Desvío:**\n`;
  report.competitorAnalysis.ourGanchos.forEach(g => md += `  - ${g}\n`);
  md += `* **Debilidades Detectadas:** ${report.competitorAnalysis.weaknesses}\n`;
  md += `* **Estrategia de Diferenciación:** ${report.competitorAnalysis.differentiation}\n\n`;

  md += `## 📦 Proveedores Recomendados (Dropshipping)\n\n`;
  if (report.suppliers) {
    report.suppliers.forEach(s => {
      md += `### ${s.name} (${s.platform})\n`;
      md += `* **Costo de Compra:** $${s.price}\n`;
      md += `* **Costo de Envío:** $${s.shippingCost || 0}\n`;
      md += `* **Tiempo de Tránsito:** ${s.shippingTime} días\n`;
      md += `* **Enlace de Compra:** [Visitar Proveedor](${s.link})\n\n`;
    });
  }

  md += `## ✉️ Secuencias de Correo (Email Marketing)\n\n`;
  if (report.emailSequence) {
    report.emailSequence.forEach((e, idx) => {
      md += `### Correo #${idx+1}: ${e.subject}\n`;
      md += `* **Previsualización:** *${e.preview}*\n\n`;
      md += `${e.body}\n\n`;
      md += `***\n\n`;
    });
  }

  md += `## 📢 Copys Publicitarios Meta & TikTok\n\n`;
  if (report.adCopy) {
    md += `### Meta Ads (Facebook / Instagram)\n\n`;
    if (report.adCopy.facebook) {
      report.adCopy.facebook.forEach((ad, idx) => {
        md += `#### Variante #${idx+1}\n`;
        md += `* **Texto Principal:** ${ad.primaryText}\n`;
        md += `* **Titular (Headline):** **"${ad.headline}"**\n`;
        md += `* **Descripción:** *${ad.description}*\n\n`;
      });
    }
    md += `### TikTok Ads\n\n`;
    if (report.adCopy.tiktok) {
      report.adCopy.tiktok.forEach((ad, idx) => {
        md += `#### Variante #${idx+1}\n`;
        md += `* **Gancho (Hook 0-3s):** *"${ad.hook}"*\n`;
        md += `* **Desarrollo:** ${ad.body}\n`;
        md += `* **CTA en Pantalla:** ${ad.cta}\n\n`;
      });
    }
  }

  md += `## 🛍️ Ficha de Producto Shopify\n\n`;
  if (report.shopifyDescription) {
    md += `* **Título SEO:** ${report.shopifyDescription.title}\n`;
    md += `* **Meta Descripción:** ${report.shopifyDescription.metaDescription}\n\n`;
    md += `### Ficha HTML:\n\n`;
    md += `\`\`\`html\n`;
    md += `${report.shopifyDescription.body}\n`;
    md += `\`\`\`\n\n`;
    md += `### Preguntas Frecuentes (FAQ):\n\n`;
    if (report.shopifyDescription.faq) {
      report.shopifyDescription.faq.forEach(f => {
        md += `* **P:** ${f.q}\n`;
        md += `  **R:** ${f.a}\n\n`;
      });
    }
  }

  // Download logic
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dropdeep_report_${report.name.toLowerCase().replace(/\s+/g, '-')}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.remove();
  URL.revokeObjectURL(url);
  showToast("Reporte exportado exitosamente como Markdown.", "success");
}

// ==========================================
// MÓDULO DE INTELIGENCIA COMPETITIVA & ESPIONAJE
// ==========================================
