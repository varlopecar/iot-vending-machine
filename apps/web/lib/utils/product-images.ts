/**
 * Utilitaire pour obtenir l'image appropriée pour chaque produit
 * Utilisé dans les pages Produits et détails de machine
 */

export function getProductImage(productName: string, category: string): string {
  const name = productName.toLowerCase();

  if (name.includes("coca") || name.includes("cola")) {
    return "/assets/images/coca.png";
  }
  if (name.includes("fuze") || name.includes("tea")) {
    return "/assets/images/fuze-tea.png";
  }
  if (name.includes("orangina")) {
    return "/assets/images/orangina.png";
  }
  if (name.includes("pepsi")) {
    return "/assets/images/pepsi.png";
  }
  // Legacy products support
  if (name.includes("chips") || name.includes("energy")) {
    return "/assets/images/chips.png";
  }
  if (name.includes("kinder") || name.includes("bueno")) {
    return "/assets/images/kinder.png";
  }
  if (name.includes("water") || name.includes("eau")) {
    return "/assets/images/eau.png";
  }

  // Fallback based on category
  switch (category.toLowerCase()) {
    case "snacks":
      return "/assets/images/chips.png";
    case "boissons":
      return "/assets/images/coca.png";
    case "confiseries":
      return "/assets/images/kinder.png";
    default:
      return "/assets/images/coca.png";
  }
}
