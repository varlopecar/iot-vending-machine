import React, { useMemo, useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { getAllProducts, ServerProduct } from "../../lib/products";
import { getLocalImageForProductName } from "../../lib/imageAssets";
import { Product } from "../../types/product";
import { getOfferRule } from "../../lib/offers/offerRules";
import {
  OfferSelector,
  OfferSummary,
  OfferActions,
  useOfferSelection,
} from "../../components/offer";
import { useCart } from "../../contexts/CartContext";

const ProductDetailModal = React.lazy(
  () => import("../../components/ProductDetailModal")
);

export default function OfferDetailScreen() {
  const params = useLocalSearchParams();
  const offerId = (params.offer as string) ?? "petit_snack";
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { getCurrentPoints } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Configuration de l'offre basée sur l'ID
  const offerRule = useMemo(() => {
    const rule = getOfferRule(offerId);
    if (!rule) {
      // Fallback vers petit_snack si l'offre n'existe pas
      return getOfferRule("petit_snack")!;
    }
    return rule;
  }, [offerId]);

  // Catégorisation des produits
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    getAllProducts()
      .then((ps: ServerProduct[]) => {
        const mapped: Product[] = ps.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: getLocalImageForProductName(p.name),
          ingredients: p.ingredients.split(',').map((s) => s.trim()),
          allergens: p.allergens.split(',').map((s) => s.trim()).filter(Boolean),
          nutritionalValues: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        }));
        setProducts(mapped);
      })
      .catch(() => setProducts([]));
  }, []);
  // Seuils simplifiés et inclusifs pour mieux couvrir le catalogue backend
  const smallSnacks = useMemo(
    () => products.filter((p) => p.price < 2.0),
    [products]
  );
  const bigSnacks = useMemo(
    () => products.filter((p) => p.price >= 2.0),
    [products]
  );

  // Fonction de gestion du succès - retour immédiat
  const handleOfferSuccess = (offerName?: string) => {
    // Retourner immédiatement à la page précédente
    // Le nom de l'offre est déjà enregistré dans le CartContext
    router.back();
  };

  // Hook pour la gestion de la sélection
  const selection = useOfferSelection({
    offerRule,
    smallSnacks,
    bigSnacks,
    onSuccess: handleOfferSuccess,
  });

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <View
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
    >
      <Stack.Screen
        options={{
          title: offerRule.title,
          headerShown: true,
          headerTintColor: isDark ? "#FEFCFA" : "#3A2E2C",
          headerStyle: { backgroundColor: isDark ? "#493837" : "#E3E8E4" },
        }}
      />

      <ScrollView className="flex-1">
        <OfferSelector
          offerRule={offerRule}
          isDark={isDark}
          state={selection.state}
          smallSnacks={smallSnacks}
          bigSnacks={bigSnacks}
          totalSelectedSmall={selection.totalSelectedSmall}
          totalSelectedBig={selection.totalSelectedBig}
          onSelectSingle={selection.selectSingle}
          onSelectSmall={selection.selectSmall}
          onSelectBig={selection.selectBig}
          onIncrementQuantity={selection.incrementQuantity}
          onDecrementQuantity={selection.decrementQuantity}
          onProductPress={handleProductPress}
        />
      </ScrollView>

      {/* Footer avec résumé et actions */}
      <View
        className={`${isDark ? "bg-dark-surface" : "bg-light-surface"} px-4 pb-8 pt-4`}
        style={{
          borderTopWidth: 0.2,
          borderTopColor: "#666666",
        }}
      >
        <OfferSummary
          isDark={isDark}
          summaryText={selection.summaryText}
          pointsCost={offerRule.points}
          currentPoints={getCurrentPoints()}
        />

        <OfferActions
          isDark={isDark}
          isValid={selection.validation.isValid}
          onSubmit={selection.submitOffer}
        />
      </View>

      {/* Product Detail Modal */}
      <React.Suspense fallback={null}>
        <ProductDetailModal
          product={selectedProduct}
          visible={isDetailModalVisible}
          onClose={handleCloseModal}
        />
      </React.Suspense>
    </View>
  );
}
