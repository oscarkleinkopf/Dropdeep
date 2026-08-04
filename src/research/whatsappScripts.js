// WhatsApp & Support Chat Conversational Sales Scripts Engine

export function generateWhatsAppSalesScripts(report) {
  const name = report.name || "Producto Destacado";
  const retail = typeof report.retail === 'number' ? report.retail : (parseFloat(report.retail) || 39.99);
  const cost = typeof report.cost === 'number' ? report.cost : (parseFloat(report.cost) || 10.00);

  const script1 = {
    title: "1. Saludo Inicial & Diagnóstico Inmediato",
    tag: "Contacto Inicial",
    copy: `¡Hola! 👋 Gracias por escribirnos a la tienda oficial de *${name}*.\n\nMi nombre es Alex y con gusto te ayudo. ¿Estás buscando este producto para ti o para regalar a un familiar?`
  };

  const script2 = {
    title: "2. Manejo de Objeción de Precio ('Está muy caro')",
    tag: "Objeción de Precio",
    copy: `Te entiendo perfectamente 🙌. Al principio muchos de nuestros clientes pensaban lo mismo, pero cuando comparan el costo de *${name}* ($${retail.toFixed(2)}) frente a gastar continuamente en terapias o productos tradicionales que duran pocas semanas, se dan cuenta de que ahorran dinero desde el primer mes.\n\nAdemás, hoy incluye garantía de 30 días. ¿Te gustaría que te reserve una unidad antes de que expire la promoción?`
  };

  const script3 = {
    title: "3. Manejo de Objeción de Envío ('¿Cuándo me llega?')",
    tag: "Objeción de Envío",
    copy: `¡Excelente pregunta! 📦 Todos los pedidos salen despachados en menos de 24 horas y te enviamos tu número de seguimiento por correo y WhatsApp.\n\nNormalmente entrega en *3 a 5 días hábiles* directamente en tu puerta. ¿A qué ciudad o código postal sería el envío?`
  };

  const script4 = {
    title: "4. Cierre de Emergencia (Descuento de 15 Minutos)",
    tag: "Cierre Conversacional",
    copy: `¡Mira! Para ayudarte a tomar la decisión hoy mismo, acabo de activar un cupón exclusivo de *$5 USD adicionales de descuento* + *Envío Gratis* para tu pedido de *${name}* 🎁.\n\nEste código solo estará activo durante los próximos 15 minutos. ¿Te envío el enlace directo para confirmar tu compra ahora?`
  };

  return [script1, script2, script3, script4];
}
