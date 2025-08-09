import { Advantage } from "../../types/types";
import { OFFER_RULES } from "./offerRules";

/**
 * Synchronise les avantages avec la configuration des offres
 * Utilise la configuration centralisée pour générer les données d'affichage
 */
export function getAdvantagesFromOffers(): Advantage[] {
  const offerImageMap: Record<string, string> = {
    petit_snack: "ptit_duo.png",
    gros_snack: "le_gourmand.png", 
    ptit_duo: "ptit_duo.png",
    mix_parfait: "le_mix_parfait.png",
    gourmand: "le_gourmand.png",
  };

  return Object.values(OFFER_RULES).map((rule, index) => ({
    id: (index + 1).toString(),
    title: rule.title,
    description: rule.description,
    points: rule.points,
    image: offerImageMap[rule.id] || "ptit_duo.png",
  }));
}

/**
 * Convertit un titre d'avantage en clé d'offre
 */
export function getOfferKeyFromTitle(title: string): string {
  return Object.values(OFFER_RULES).find(rule => rule.title === title)?.id || "petit_snack";
}
