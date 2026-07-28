// Mock Database of Automated Winning Products and Procedural Deep Research Generator
// Based on the copywriting research methodology

export const automatedProducts = [
  {
    id: "flame-diffuser",
    name: "Volcanic Flame Air Diffuser",
    category: "Home & Wellness",
    supplierPrice: 12.50,
    retailPrice: 39.99,
    shippingDays: 8,
    monthlySales: 4850,
    saturationScore: 32,
    trendVelocity: "+148%",
    description: "Humidificador de aire ultrasónico con luces LED que simulan una llama de fuego real o una erupción volcánica. Excelente efecto visual (Wow factor).",
    adSpendEst: "$12,400/mo",
    demographics: "Amas de casa, profesionales cansados, fanáticos de la decoración del hogar y el biohacking del sueño (25-45 años, mayormente femenino, ingresos medios/altos)."
  },
  {
    id: "posture-corrector",
    name: "Ergonomic Spine Posture Corrector",
    category: "Health & Fitness",
    supplierPrice: 4.20,
    retailPrice: 24.99,
    shippingDays: 6,
    monthlySales: 9200,
    saturationScore: 68,
    trendVelocity: "+82%",
    description: "Soporte ajustable para espalda y hombros diseñado para corregir la postura, reducir el dolor de cuello y hombros causado por sentarse frente al computador.",
    adSpendEst: "$28,000/mo",
    demographics: "Trabajadores de oficina, programadores, gamers y personas con dolor crónico de espalda (22-55 años, ambos géneros, ingresos medios)."
  },
  {
    id: "smart-feeder",
    name: "App-Controlled Smart Pet Feeder",
    category: "Pet Care",
    supplierPrice: 22.00,
    retailPrice: 89.99,
    shippingDays: 9,
    monthlySales: 2100,
    saturationScore: 18,
    trendVelocity: "+215%",
    description: "Comedero automático para mascotas controlado por Wi-Fi. Permite programar horarios, controlar porciones y grabar audio para llamar a la mascota.",
    adSpendEst: "$18,500/mo",
    demographics: "Dueños de mascotas solteros, millennials que trabajan largas jornadas o viajan los fines de semana (25-40 años, ingresos medio-altos)."
  },
  {
    id: "scalp-massager",
    name: "Cordless Electric Scalp Massager",
    category: "Beauty & Personal Care",
    supplierPrice: 8.90,
    retailPrice: 34.99,
    shippingDays: 7,
    monthlySales: 5400,
    saturationScore: 45,
    trendVelocity: "+110%",
    description: "Masajeador de cabeza resistente al agua con 4 cabezales giratorios de silicona y 84 puntos de contacto. Estimula el crecimiento capilar y alivia el estrés.",
    adSpendEst: "$15,200/mo",
    demographics: "Personas con caída del cabello, niveles altos de estrés, dolores de cabeza frecuentes o interesadas en el cuidado del cabello (25-60 años, mayormente femenino)."
  },
  {
    id: "galaxy-projector",
    name: "LED Aurora Galaxy Projector",
    category: "Electronics & Gadgets",
    supplierPrice: 14.10,
    retailPrice: 49.99,
    shippingDays: 8,
    monthlySales: 7300,
    saturationScore: 55,
    trendVelocity: "+95%",
    description: "Proyector de luces láser que simula un cielo estrellado y la aurora boreal en el techo. Incluye altavoz Bluetooth integrado y control remoto.",
    adSpendEst: "$21,000/mo",
    demographics: "Padres con niños pequeños (para dormir), adolescentes y jóvenes universitarios para decorar habitaciones y crear contenido en TikTok (15-35 años)."
  }
];

export function getCategoryByProductName(productName) {
  const name = productName.toLowerCase();
  if (name.includes("masaje") || name.includes("pelo") || name.includes("skincare") || name.includes("cepillo") || name.includes("facial") || name.includes("arrugas") || name.includes("belleza") || name.includes("crema") || name.includes("uñas") || name.includes("acne")) {
    return "beauty";
  }
  if (name.includes("perro") || name.includes("gato") || name.includes("mascota") || name.includes("pet") || name.includes("collar") || name.includes("juguete perro") || name.includes("comedero")) {
    return "pet";
  }
  if (name.includes("espalda") || name.includes("postura") || name.includes("rodilla") || name.includes("dolor") || name.includes("fitness") || name.includes("gimnasio") || name.includes("ejercicio") || name.includes("yoga") || name.includes("pesa") || name.includes("salud") || name.includes("cuello") || name.includes("almohada")) {
    return "health";
  }
  if (name.includes("cocina") || name.includes("taza") || name.includes("licuadora") || name.includes("luces") || name.includes("lampara") || name.includes("difusor") || name.includes("humedecedor") || name.includes("cuchillo") || name.includes("organizador") || name.includes("almohada cama")) {
    return "home";
  }
  if (name.includes("audifonos") || name.includes("auriculares") || name.includes("cargador") || name.includes("reloj") || name.includes("proyector") || name.includes("teclado") || name.includes("gaming") || name.includes("smart") || name.includes("led") || name.includes("bateria")) {
    return "tech";
  }
  return "general";
}
