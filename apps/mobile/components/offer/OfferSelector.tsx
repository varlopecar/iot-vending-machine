import React from "react";
import { View } from "react-native";
import { OfferRule, OfferSelectionState } from "../../types/offer";
import { Product } from "../../types/product";
import { FormSection } from "../ui/FormSection";
import { ProductSelectorSingle } from "../ui/ProductSelectorSingle";
import { ProductSelectorCounter } from "../ui/ProductSelectorCounter";

interface OfferSelectorProps {
  offerRule: OfferRule;
  isDark: boolean;
  state: OfferSelectionState;
  smallSnacks: Product[];
  bigSnacks: Product[];
  totalSelectedSmall: number;
  totalSelectedBig: number;
  onSelectSingle: (productId: string) => void;
  onSelectSmall: (productId: string) => void;
  onSelectBig: (productId: string) => void;
  onIncrementQuantity: (
    scope: "small" | "big",
    product: Product,
    maxPerItem: number,
    maxTotal: number
  ) => void;
  onDecrementQuantity: (scope: "small" | "big", product: Product) => void;
  onProductPress?: (product: Product) => void;
}

export function OfferSelector({
  offerRule,
  isDark,
  state,
  smallSnacks,
  bigSnacks,
  totalSelectedSmall,
  totalSelectedBig,
  onSelectSingle,
  onSelectSmall,
  onSelectBig,
  onIncrementQuantity,
  onDecrementQuantity,
  onProductPress,
}: OfferSelectorProps) {
  // Sélection simple (petit_snack, gros_snack)
  if (offerRule.selectionMode === "single") {
    const slot = offerRule.slots[0];
    const products = slot.allowed.includes("small") ? smallSnacks : bigSnacks;

    return (
      <FormSection isDark={isDark}>
        {products.map((product) => (
          <ProductSelectorSingle
            key={product.id}
            product={product}
            isDark={isDark}
            selected={state.selectedSingle === product.id}
            onToggle={() => onSelectSingle(product.id)}
            onProductPress={() => onProductPress?.(product)}
          />
        ))}
      </FormSection>
    );
  }

  // Sélection par compteur (ptit_duo, gourmand)
  if (offerRule.selectionMode === "counter") {
    const slot = offerRule.slots[0];
    const products = slot.allowed.includes("small") ? smallSnacks : bigSnacks;
    const quantities = slot.allowed.includes("small")
      ? state.quantitiesSmall
      : state.quantitiesBig;
    const scope: "small" | "big" = slot.allowed.includes("small")
      ? "small"
      : "big";
    const totalSelected = slot.allowed.includes("small")
      ? totalSelectedSmall
      : totalSelectedBig;

    return (
      <FormSection isDark={isDark}>
        {products.map((product) => {
          const current = quantities[product.id] ?? 0;
          const isIncrementDisabled = totalSelected >= slot.maxTotalInSlot;

          return (
            <ProductSelectorCounter
              key={product.id}
              product={product}
              isDark={isDark}
              current={current}
              onDecrement={() => onDecrementQuantity(scope, product)}
              onIncrement={() =>
                onIncrementQuantity(
                  scope,
                  product,
                  slot.maxQuantity,
                  slot.maxTotalInSlot
                )
              }
              isIncrementDisabled={isIncrementDisabled}
              onProductPress={() => onProductPress?.(product)}
            />
          );
        })}
      </FormSection>
    );
  }

  // Sélection radio mixte (mix_parfait)
  if (offerRule.selectionMode === "radio") {
    return (
      <View>
        {offerRule.slots.map((slot) => {
          const products = slot.allowed.includes("small")
            ? smallSnacks
            : bigSnacks;
          const selectedId = slot.allowed.includes("small")
            ? state.selectedSmall
            : state.selectedBig;
          const onSelect = slot.allowed.includes("small")
            ? onSelectSmall
            : onSelectBig;

          return (
            <FormSection key={slot.id} title={slot.label} isDark={isDark}>
              {products.map((product) => (
                <ProductSelectorSingle
                  key={product.id}
                  product={product}
                  isDark={isDark}
                  selected={selectedId === product.id}
                  onToggle={() => onSelect(product.id)}
                  onProductPress={() => onProductPress?.(product)}
                />
              ))}
            </FormSection>
          );
        })}
      </View>
    );
  }

  return null;
}
