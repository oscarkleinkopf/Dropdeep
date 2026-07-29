// Category heuristics for product name classification (used by legacy report generator)

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
