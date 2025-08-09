import { useState, useMemo, useCallback } from "react";
import { Alert } from "react-native";
import { OfferRule, OfferSelectionState, ValidationResult } from "../../types/offer";
import { Product, AppliedOffer } from "../../types/product";
import { useCart } from "../../contexts/CartContext";

interface UseOfferSelectionProps {
  offerRule: OfferRule;
  smallSnacks: Product[];
  bigSnacks: Product[];
  onSuccess: () => void;
}

export function useOfferSelection({
  offerRule,
  smallSnacks,
  bigSnacks,
  onSuccess,
}: UseOfferSelectionProps) {
  const { addOffer, getTotalItems, getCurrentPoints } = useCart();

  const [state, setState] = useState<OfferSelectionState>({
    selectedSingle: null,
    selectedSmall: null,
    selectedBig: null,
    quantitiesSmall: {},
    quantitiesBig: {},
  });

  // Helpers pour calculer les totaux
  const totalSelectedSmall = useMemo(
    () => Object.values(state.quantitiesSmall).reduce((a, b) => a + b, 0),
    [state.quantitiesSmall]
  );

  const totalSelectedBig = useMemo(
    () => Object.values(state.quantitiesBig).reduce((a, b) => a + b, 0),
    [state.quantitiesBig]
  );

  const totalSelected = totalSelectedSmall + totalSelectedBig;

  // Validation basée sur la configuration de l'offre
  const validation = useMemo((): ValidationResult => {
    const selections: Record<string, Record<string, number>> = {};

    if (offerRule.selectionMode === "single") {
      const slot = offerRule.slots[0];
      const selectedId = state.selectedSingle;
      selections[slot.id] = selectedId ? { [selectedId]: 1 } : {};
    } else if (offerRule.selectionMode === "radio" && offerRule.id === "mix_parfait") {
      selections.small = state.selectedSmall ? { [state.selectedSmall]: 1 } : {};
      selections.big = state.selectedBig ? { [state.selectedBig]: 1 } : {};
    } else if (offerRule.selectionMode === "counter") {
      const slot = offerRule.slots[0];
      if (slot.allowed.includes("small")) {
        selections[slot.id] = state.quantitiesSmall;
      } else {
        selections[slot.id] = state.quantitiesBig;
      }
    }

    return offerRule.validate(selections);
  }, [offerRule, state]);

  // Actions pour la sélection simple (radio)
  const selectSingle = useCallback((productId: string) => {
    setState(prev => ({ ...prev, selectedSingle: productId }));
  }, []);

  const selectSmall = useCallback((productId: string) => {
    setState(prev => ({ ...prev, selectedSmall: productId }));
  }, []);

  const selectBig = useCallback((productId: string) => {
    setState(prev => ({ ...prev, selectedBig: productId }));
  }, []);

  // Actions pour la sélection par quantité
  const incrementQuantity = useCallback((
    scope: "small" | "big",
    product: Product,
    maxPerItem: number,
    maxTotal: number
  ) => {
    setState(prev => {
      if (scope === "small") {
        const current = prev.quantitiesSmall[product.id] ?? 0;
        
        // Vérifications spécifiques pour mix_parfait
        if (offerRule.id === "mix_parfait" && totalSelectedSmall >= 1) return prev;
        if (current >= maxPerItem) return prev;
        if (totalSelected >= maxTotal) return prev;
        
        return {
          ...prev,
          quantitiesSmall: { ...prev.quantitiesSmall, [product.id]: current + 1 }
        };
      } else {
        const current = prev.quantitiesBig[product.id] ?? 0;
        
        // Vérifications spécifiques pour mix_parfait
        if (offerRule.id === "mix_parfait" && totalSelectedBig >= 1) return prev;
        if (current >= maxPerItem) return prev;
        if (totalSelected >= maxTotal) return prev;
        
        return {
          ...prev,
          quantitiesBig: { ...prev.quantitiesBig, [product.id]: current + 1 }
        };
      }
    });
  }, [offerRule.id, totalSelected, totalSelectedSmall, totalSelectedBig]);

  const decrementQuantity = useCallback((scope: "small" | "big", product: Product) => {
    setState(prev => {
      if (scope === "small") {
        const current = prev.quantitiesSmall[product.id] ?? 0;
        const next = Math.max(0, current - 1);
        return {
          ...prev,
          quantitiesSmall: { ...prev.quantitiesSmall, [product.id]: next }
        };
      } else {
        const current = prev.quantitiesBig[product.id] ?? 0;
        const next = Math.max(0, current - 1);
        return {
          ...prev,
          quantitiesBig: { ...prev.quantitiesBig, [product.id]: next }
        };
      }
    });
  }, []);

  // Texte de résumé dynamique
  const summaryText = useMemo(() => {
    switch (offerRule.id) {
      case "ptit_duo":
        return `${totalSelectedSmall}/2 petits snacks sélectionnés`;
      case "gourmand":
        return `${totalSelectedBig}/2 gros snacks sélectionnés`;
      case "mix_parfait":
        return `${state.selectedSmall ? 1 : 0}/1 petit snack • ${state.selectedBig ? 1 : 0}/1 gros snack`;
      default:
        return "";
    }
  }, [offerRule.id, totalSelectedSmall, totalSelectedBig, state.selectedSmall, state.selectedBig]);

  // Soumission de l'offre
  const submitOffer = useCallback(() => {
    if (!validation.isValid) {
      if (validation.error) {
        Alert.alert("Sélection incomplète", validation.error);
      }
      return;
    }

    const totalRequiredItems = offerRule.getTotalRequired();
    if (getTotalItems() + totalRequiredItems > 2) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez pas dépasser 2 produits au total."
      );
      return;
    }

    if (getCurrentPoints() < offerRule.points) {
      Alert.alert(
        "Points insuffisants",
        "Vous n'avez pas assez de points pour cette offre."
      );
      return;
    }

    // Construire les items de l'offre
    const items: { id: string; name: string; quantity: number }[] = [];

    if (offerRule.selectionMode === "single") {
      const selectedId = state.selectedSingle;
      if (!selectedId) return;
      
      const sourceList = offerRule.slots[0].allowed.includes("small") ? smallSnacks : bigSnacks;
      const found = sourceList.find(p => p.id === selectedId);
      if (!found) return;
      
      items.push({ id: found.id, name: found.name, quantity: 1 });
    } else if (offerRule.selectionMode === "radio" && offerRule.id === "mix_parfait") {
      if (!state.selectedSmall || !state.selectedBig) return;
      
      const smallProduct = smallSnacks.find(p => p.id === state.selectedSmall);
      const bigProduct = bigSnacks.find(p => p.id === state.selectedBig);
      
      if (!smallProduct || !bigProduct) return;
      
      items.push(
        { id: smallProduct.id, name: smallProduct.name, quantity: 1 },
        { id: bigProduct.id, name: bigProduct.name, quantity: 1 }
      );
    } else if (offerRule.selectionMode === "counter") {
      const slot = offerRule.slots[0];
      if (slot.allowed.includes("small")) {
        for (const product of smallSnacks) {
          const qty = state.quantitiesSmall[product.id] ?? 0;
          if (qty > 0) {
            items.push({ id: product.id, name: product.name, quantity: qty });
          }
        }
      } else {
        for (const product of bigSnacks) {
          const qty = state.quantitiesBig[product.id] ?? 0;
          if (qty > 0) {
            items.push({ id: product.id, name: product.name, quantity: qty });
          }
        }
      }
    }

    const offer: AppliedOffer = {
      id: `${offerRule.id}-${Date.now()}`,
      key: offerRule.id as any,
      name: offerRule.title,
      description: offerRule.description,
      points: offerRule.points,
      items,
    };

    const result = addOffer(offer);
    if ("ok" in result && result.ok) {
      onSuccess();
    }
  }, [validation, offerRule, state, getTotalItems, getCurrentPoints, addOffer, onSuccess, smallSnacks, bigSnacks]);

  return {
    state,
    validation,
    totalSelectedSmall,
    totalSelectedBig,
    totalSelected,
    summaryText,
    selectSingle,
    selectSmall,
    selectBig,
    incrementQuantity,
    decrementQuantity,
    submitOffer,
  };
}
