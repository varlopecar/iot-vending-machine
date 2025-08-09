import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { mockProducts } from "../../data/mockProducts";
import { Product } from "../../types/product";
import { useCart } from "../../contexts/CartContext";

type OfferKey =
  | "petit_snack"
  | "gros_snack"
  | "ptit_duo"
  | "mix_parfait"
  | "gourmand";

const OFFER_POINTS: Record<OfferKey, number> = {
  petit_snack: 20,
  gros_snack: 40,
  ptit_duo: 35,
  mix_parfait: 55,
  gourmand: 70,
};

// Lignes de produit - composants à part pour éviter les remounts et flickers
type ProductRowSingleProps = {
  product: Product;
  isDark: boolean;
  onAdd: () => void;
};
const ProductRowSingle = ({
  product,
  isDark,
  onAdd,
}: ProductRowSingleProps) => (
  <View>
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-row items-center flex-1">
        <Image
          source={product.image}
          style={{ width: 64, height: 64, borderRadius: 12, marginRight: 16 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={100}
        />
        <View className="flex-1">
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
          >
            {product.name}
          </Text>
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
          >
            {product.price}€
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={onAdd}
        className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-10 h-10 rounded-full items-center justify-center`}
      >
        <Text
          className={`${isDark ? "text-dark-buttonText" : "text-white"} text-xl font-bold`}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
    <View
      className="w-full h-px"
      style={{ backgroundColor: isDark ? "#493837" : "#F3E9D8" }}
    />
  </View>
);

type ProductRowCounterProps = {
  product: Product;
  isDark: boolean;
  current: number;
  onDecrement: () => void;
  onIncrement: () => void;
};
const ProductRowCounter = ({
  product,
  isDark,
  current,
  onDecrement,
  onIncrement,
}: ProductRowCounterProps) => (
  <View>
    <View className="flex-row items-center justify-between px-4 py-4">
      <View className="flex-row items-center flex-1">
        <Image
          source={product.image}
          style={{ width: 64, height: 64, borderRadius: 12, marginRight: 16 }}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={100}
        />
        <View className="flex-1">
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
          >
            {product.name}
          </Text>
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-base`}
          >
            {product.price}€
          </Text>
        </View>
      </View>
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onDecrement}
          className={`${isDark ? "bg-dark-border" : "bg-light-border"} w-10 h-10 rounded-full items-center justify-center`}
        >
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-xl font-bold`}
          >
            -
          </Text>
        </TouchableOpacity>
        <View style={{ width: 28, alignItems: "center" }}>
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
          >
            {current}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onIncrement}
          className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-10 h-10 rounded-full items-center justify-center`}
        >
          <Text
            className={`${isDark ? "text-dark-buttonText" : "text-white"} text-xl font-bold`}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    <View
      className="w-full h-px"
      style={{ backgroundColor: isDark ? "#493837" : "#F3E9D8" }}
    />
  </View>
);

export default function OfferDetailScreen() {
  const params = useLocalSearchParams();
  const offerKey = (params.offer as OfferKey) ?? "petit_snack";
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { addOffer, getTotalItems, getCurrentPoints } = useCart();

  const smallSnacks = mockProducts.filter((p) => p.price < 1.5);
  const bigSnacks = mockProducts.filter(
    (p) => p.price >= 1.5 && p.price <= 2.49
  );

  // Etats pour sélection multi (quantités par produit)
  const [qtySmall, setQtySmall] = useState<Record<string, number>>({});
  const [qtyBig, setQtyBig] = useState<Record<string, number>>({});

  const title = useMemo(() => {
    switch (offerKey) {
      case "petit_snack":
        return "Petit snack";
      case "gros_snack":
        return "Gros snack";
      case "ptit_duo":
        return "Le p'tit duo";
      case "mix_parfait":
        return "Le Mix Parfait";
      case "gourmand":
        return "Le gourmand";
      default:
        return "Offre";
    }
  }, [offerKey]);
  // Helpers
  const totalSelectedSmall = useMemo(
    () => Object.values(qtySmall).reduce((a, b) => a + b, 0),
    [qtySmall]
  );
  const totalSelectedBig = useMemo(
    () => Object.values(qtyBig).reduce((a, b) => a + b, 0),
    [qtyBig]
  );
  const totalSelected = totalSelectedSmall + totalSelectedBig;

  const incrementQty = (
    scope: "small" | "big",
    product: Product,
    maxPerItem: number,
    maxTotal: number
  ) => {
    if (scope === "small") {
      const current = qtySmall[product.id] ?? 0;
      if (offerKey === "mix_parfait" && totalSelectedSmall >= 1) return; // max 1 petit au total
      if (current >= maxPerItem) return;
      if (totalSelected >= maxTotal) return;
      setQtySmall({ ...qtySmall, [product.id]: current + 1 });
    } else {
      const current = qtyBig[product.id] ?? 0;
      if (offerKey === "mix_parfait" && totalSelectedBig >= 1) return; // max 1 gros au total
      if (current >= maxPerItem) return;
      if (totalSelected >= maxTotal) return;
      setQtyBig({ ...qtyBig, [product.id]: current + 1 });
    }
  };

  const decrementQty = (scope: "small" | "big", product: Product) => {
    if (scope === "small") {
      const current = qtySmall[product.id] ?? 0;
      const next = Math.max(0, current - 1);
      setQtySmall({ ...qtySmall, [product.id]: next });
    } else {
      const current = qtyBig[product.id] ?? 0;
      const next = Math.max(0, current - 1);
      setQtyBig({ ...qtyBig, [product.id]: next });
    }
  };

  const handleAddSingle = (product: Product) => {
    // Vérifier limite et points
    if (getTotalItems() + 1 > 2) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez pas dépasser 2 produits au total."
      );
      return;
    }
    const pointsCost = OFFER_POINTS[offerKey];
    if (getCurrentPoints() < pointsCost) {
      Alert.alert(
        "Points insuffisants",
        "Vous n'avez pas assez de points pour cette offre."
      );
      return;
    }
    const offer = {
      id: `${offerKey}-${Date.now()}`,
      key: offerKey,
      name: title,
      description: undefined,
      points: pointsCost,
      items: [{ id: product.id, name: product.name, quantity: 1 }],
    };
    const res = addOffer(offer);
    if ("ok" in res && res.ok) router.back();
  };

  const handleValidateMulti = () => {
    const pointsCost = OFFER_POINTS[offerKey];
    const items: { id: string; name: string; quantity: number }[] = [];

    if (offerKey === "ptit_duo") {
      const total = totalSelectedSmall;
      if (total !== 2) {
        Alert.alert(
          "Sélection incomplète",
          "Choisissez exactement 2 petits snacks."
        );
        return;
      }
      for (const p of smallSnacks) {
        const q = qtySmall[p.id] ?? 0;
        if (q > 0) items.push({ id: p.id, name: p.name, quantity: q });
      }
    } else if (offerKey === "gourmand") {
      const total = totalSelectedBig;
      if (total !== 2) {
        Alert.alert(
          "Sélection incomplète",
          "Choisissez exactement 2 gros snacks."
        );
        return;
      }
      for (const p of bigSnacks) {
        const q = qtyBig[p.id] ?? 0;
        if (q > 0) items.push({ id: p.id, name: p.name, quantity: q });
      }
    } else if (offerKey === "mix_parfait") {
      if (totalSelectedSmall !== 1 || totalSelectedBig !== 1) {
        Alert.alert(
          "Sélection incomplète",
          "Choisissez 1 petit snack et 1 gros snack."
        );
        return;
      }
      for (const p of smallSnacks) {
        const q = qtySmall[p.id] ?? 0;
        if (q > 0) items.push({ id: p.id, name: p.name, quantity: q });
      }
      for (const p of bigSnacks) {
        const q = qtyBig[p.id] ?? 0;
        if (q > 0) items.push({ id: p.id, name: p.name, quantity: q });
      }
    }

    const selectedCount = items.reduce((s, it) => s + it.quantity, 0);
    if (getTotalItems() + selectedCount > 2) {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez pas dépasser 2 produits au total."
      );
      return;
    }
    if (getCurrentPoints() < pointsCost) {
      Alert.alert(
        "Points insuffisants",
        "Vous n'avez pas assez de points pour cette offre."
      );
      return;
    }

    const offer = {
      id: `${offerKey}-${Date.now()}`,
      key: offerKey,
      name: title,
      description: undefined,
      points: pointsCost,
      items,
    };
    const res = addOffer(offer);
    if ("ok" in res && res.ok) router.back();
  };

  return (
    <View
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
    >
      <Stack.Screen
        options={{
          title,
          headerShown: true,
          headerTintColor: isDark ? "#FEFCFA" : "#3A2E2C",
          headerStyle: { backgroundColor: isDark ? "#493837" : "#E3E8E4" },
        }}
      />
      <ScrollView className="flex-1">
        {/* Listes produits (style Réserver) */}
        {offerKey === "petit_snack" && (
          <View className="mb-4">
            {smallSnacks.map((p) => (
              <ProductRowSingle
                key={p.id}
                product={p}
                isDark={isDark}
                onAdd={() => handleAddSingle(p)}
              />
            ))}
          </View>
        )}
        {offerKey === "gros_snack" && (
          <View className="mb-4">
            {bigSnacks.map((p) => (
              <ProductRowSingle
                key={p.id}
                product={p}
                isDark={isDark}
                onAdd={() => handleAddSingle(p)}
              />
            ))}
          </View>
        )}

        {offerKey === "ptit_duo" && (
          <View className="mb-4">
            {smallSnacks.map((p) => {
              const current = qtySmall[p.id] ?? 0;
              return (
                <ProductRowCounter
                  key={p.id}
                  product={p}
                  isDark={isDark}
                  current={current}
                  onDecrement={() => decrementQty("small", p)}
                  onIncrement={() => incrementQty("small", p, 2, 2)}
                />
              );
            })}
          </View>
        )}

        {offerKey === "mix_parfait" && (
          <>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-xl font-bold px-4 pt-4`}
            >
              Petit snack
            </Text>
            <View className="mb-4">
              {smallSnacks.map((p) => {
                const current = qtySmall[p.id] ?? 0;
                return (
                  <ProductRowCounter
                    key={p.id}
                    product={p}
                    isDark={isDark}
                    current={current}
                    onDecrement={() => decrementQty("small", p)}
                    onIncrement={() => incrementQty("small", p, 1, 2)}
                  />
                );
              })}
            </View>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-xl font-bold px-4 pt-2`}
            >
              Gros snack
            </Text>
            <View className="mb-4">
              {bigSnacks.map((p) => {
                const current = qtyBig[p.id] ?? 0;
                return (
                  <ProductRowCounter
                    key={p.id}
                    product={p}
                    isDark={isDark}
                    current={current}
                    onDecrement={() => decrementQty("big", p)}
                    onIncrement={() => incrementQty("big", p, 1, 2)}
                  />
                );
              })}
            </View>
          </>
        )}

        {offerKey === "gourmand" && (
          <View className="mb-4">
            {bigSnacks.map((p) => {
              const current = qtyBig[p.id] ?? 0;
              return (
                <ProductRowCounter
                  key={p.id}
                  product={p}
                  isDark={isDark}
                  current={current}
                  onDecrement={() => decrementQty("big", p)}
                  onIncrement={() => incrementQty("big", p, 2, 2)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {(offerKey === "ptit_duo" ||
        offerKey === "mix_parfait" ||
        offerKey === "gourmand") && (
        <View
          className={`${isDark ? "bg-dark-surface" : "bg-light-surface"} p-4`}
        >
          {/* Résumé dynamique */}
          {offerKey === "ptit_duo" && (
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-sm mb-2`}
            >
              {totalSelectedSmall}/2 petits snacks sélectionnés
            </Text>
          )}
          {offerKey === "gourmand" && (
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-sm mb-2`}
            >
              {totalSelectedBig}/2 gros snacks sélectionnés
            </Text>
          )}
          {offerKey === "mix_parfait" && (
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-sm mb-2`}
            >
              {totalSelectedSmall}/1 petit snack • {totalSelectedBig}/1 gros
              snack
            </Text>
          )}
          <View className="flex-row justify-between mb-3">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base`}
            >
              Coût en points
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-bold`}
            >
              {OFFER_POINTS[offerKey]} pts
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base`}
            >
              Points restants
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-base font-bold`}
            >
              {getCurrentPoints()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleValidateMulti}
            className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4 rounded-lg`}
          >
            <Text
              className={`${isDark ? "text-dark-buttonText" : "text-white"} text-lg font-bold text-center`}
            >
              Ajouter l&apos;offre
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
