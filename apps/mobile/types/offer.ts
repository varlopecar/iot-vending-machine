export type SnackSize = "small" | "big";
export type SelectionMode = "single" | "counter" | "radio";

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface SelectionSlot {
  id: string;
  label: string;
  allowed: SnackSize[];
  required: boolean;
  maxQuantity: number;
  maxTotalInSlot: number;
}

export interface OfferRule {
  id: string;
  title: string;
  description?: string;
  points: number;
  selectionMode: SelectionMode;
  slots: SelectionSlot[];
  validate: (selections: Record<string, Record<string, number>>) => ValidationResult;
  getTotalRequired: () => number;
}

export interface OfferSelectionState {
  selectedSingle: string | null;
  selectedSmall: string | null;
  selectedBig: string | null;
  quantitiesSmall: Record<string, number>;
  quantitiesBig: Record<string, number>;
}

export interface ProductSelectionProps {
  productId: string;
  quantity: number;
  isSelected: boolean;
  canIncrement: boolean;
  canDecrement: boolean;
}
