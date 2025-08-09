import { ValidationResult } from "../../types/offer";

export function validateSingleSelection(
  selections: Record<string, Record<string, number>>
): ValidationResult {
  const mainSlot = selections.main || {};
  const selectedItems = Object.values(mainSlot).filter(qty => qty > 0);
  
  if (selectedItems.length === 0) {
    return { isValid: false, error: "Sélectionnez un produit" };
  }
  
  if (selectedItems.length > 1) {
    return { isValid: false, error: "Sélectionnez un seul produit" };
  }
  
  return { isValid: true };
}

export function validateDuoSelection(
  selections: Record<string, Record<string, number>>
): ValidationResult {
  const mainSlot = selections.main || {};
  const totalSelected = Object.values(mainSlot).reduce((sum, qty) => sum + qty, 0);
  
  if (totalSelected === 0) {
    return { isValid: false, error: "Sélectionnez des produits" };
  }
  
  if (totalSelected !== 2) {
    return { isValid: false, error: "Sélectionnez exactement 2 produits" };
  }
  
  return { isValid: true };
}

export function validateMixSelection(
  selections: Record<string, Record<string, number>>
): ValidationResult {
  const smallSlot = selections.small || {};
  const bigSlot = selections.big || {};
  
  const totalSmall = Object.values(smallSlot).reduce((sum, qty) => sum + qty, 0);
  const totalBig = Object.values(bigSlot).reduce((sum, qty) => sum + qty, 0);
  
  if (totalSmall === 0 || totalBig === 0) {
    return { 
      isValid: false, 
      error: "Choisissez 1 petit snack et 1 gros snack" 
    };
  }
  
  if (totalSmall !== 1 || totalBig !== 1) {
    return { 
      isValid: false, 
      error: "Choisissez exactement 1 petit snack et 1 gros snack" 
    };
  }
  
  return { isValid: true };
}

export function validateGourmandSelection(
  selections: Record<string, Record<string, number>>
): ValidationResult {
  const mainSlot = selections.main || {};
  const totalSelected = Object.values(mainSlot).reduce((sum, qty) => sum + qty, 0);
  
  if (totalSelected === 0) {
    return { isValid: false, error: "Sélectionnez des produits" };
  }
  
  if (totalSelected !== 2) {
    return { isValid: false, error: "Sélectionnez exactement 2 gros snacks" };
  }
  
  return { isValid: true };
}
