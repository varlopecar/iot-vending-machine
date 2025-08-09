import { OfferRule } from "../../types/offer";
import {
  validateSingleSelection,
  validateDuoSelection,
  validateMixSelection,
  validateGourmandSelection,
} from "./validation";

export const OFFER_RULES: Record<string, OfferRule> = {
  petit_snack: {
    id: "petit_snack",
    title: "Petit snack",
    points: 20,
    selectionMode: "single",
    slots: [
      {
        id: "main",
        label: "",
        allowed: ["small"],
        required: true,
        maxQuantity: 1,
        maxTotalInSlot: 1,
      },
    ],
    validate: validateSingleSelection,
    getTotalRequired: () => 1,
  },
  
  gros_snack: {
    id: "gros_snack",
    title: "Gros snack",
    points: 40,
    selectionMode: "single",
    slots: [
      {
        id: "main",
        label: "",
        allowed: ["big"],
        required: true,
        maxQuantity: 1,
        maxTotalInSlot: 1,
      },
    ],
    validate: validateSingleSelection,
    getTotalRequired: () => 1,
  },
  
  ptit_duo: {
    id: "ptit_duo",
    title: "Le p'tit duo",
    description: "Choisissez deux petits snacks",
    points: 35,
    selectionMode: "counter",
    slots: [
      {
        id: "main",
        label: "",
        allowed: ["small"],
        required: true,
        maxQuantity: 2,
        maxTotalInSlot: 2,
      },
    ],
    validate: validateDuoSelection,
    getTotalRequired: () => 2,
  },
  
  mix_parfait: {
    id: "mix_parfait",
    title: "Le Mix Parfait",
    description: "Choisissez un petit snack et un gros snack",
    points: 55,
    selectionMode: "radio",
    slots: [
      {
        id: "small",
        label: "Petit snack",
        allowed: ["small"],
        required: true,
        maxQuantity: 1,
        maxTotalInSlot: 1,
      },
      {
        id: "big",
        label: "Gros snack",
        allowed: ["big"],
        required: true,
        maxQuantity: 1,
        maxTotalInSlot: 1,
      },
    ],
    validate: validateMixSelection,
    getTotalRequired: () => 2,
  },
  
  gourmand: {
    id: "gourmand",
    title: "Le gourmand",
    description: "Choisissez deux gros snacks",
    points: 70,
    selectionMode: "counter",
    slots: [
      {
        id: "main",
        label: "",
        allowed: ["big"],
        required: true,
        maxQuantity: 2,
        maxTotalInSlot: 2,
      },
    ],
    validate: validateGourmandSelection,
    getTotalRequired: () => 2,
  },
};

export function getOfferRule(offerId: string): OfferRule | null {
  return OFFER_RULES[offerId] || null;
}

export function isValidOfferId(offerId: string): boolean {
  return offerId in OFFER_RULES;
}
