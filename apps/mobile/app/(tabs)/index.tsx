import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import {
  SuccessBanner,
  PageSkeleton,
  ProductListSkeleton,
} from "../../components";
import { Header } from "../../components/Header";
import { SectionTitle, SafeContainer } from "../../components/ui";
import { Product } from "../../types/product";
import { getStocksByMachine, StockWithProduct } from "../../lib/stocks";
import { displayNameFromServerName } from "../../lib/productMapping";
import { useCart } from "../../contexts/CartContext";

// Lazy loading des composants lourds
const ProductCard = React.lazy(() => import("../../components/ProductCard"));
const ProductDetailModal = React.lazy(
  () => import("../../components/ProductDetailModal")
);
const CartBanner = React.lazy(() => import("../../components/CartBanner"));

export default function IndexScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const { addToCart, getTotalPrice, getTotalItems } = useCart();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Chargement des vrais produits depuis la machine forcée
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        const MACHINE_ID = 'cmeazo40a00050clyrz1a4iin';
        const stocks = await getStocksByMachine(MACHINE_ID);
        // Mapper les stocks -> Product[] pour la liste
        const mapped: Product[] = stocks.map((s: StockWithProduct) => ({
          id: s.product_id,
          name: displayNameFromServerName(s.product_name),
          price: s.product_price,
          image: s.product_image_url ? { uri: s.product_image_url } : null,
          stockQty: s.quantity,
          ingredients: s.product_ingredients_list || [],
          allergens: s.product_allergens_list || [],
          nutritionalValues: {
            calories: s.product_nutritional?.calories ?? 0,
            protein: s.product_nutritional?.protein ?? 0,
            carbs: s.product_nutritional?.carbs ?? 0,
            fat: s.product_nutritional?.fat ?? 0,
          },
        }));
        if (!cancelled) setProducts(mapped);
      } catch (e) {
        console.error('[Réserver] Erreur chargement produits machine:', e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product);
    if (success) {
      setSuccessMessage(`${product.name} ajouté au panier !`);
      setShowSuccessBanner(true);
    } else {
      Alert.alert(
        "Limite atteinte",
        "Vous ne pouvez ajouter que 2 produits maximum au panier.",
        [{ text: "OK" }]
      );
    }
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalVisible(true);
  };

  const closeProductDetail = () => {
    setIsDetailModalVisible(false);
    setSelectedProduct(null);
  };

  const navigateToCart = () => {
    router.push("/panier" as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        <PageSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeContainer>
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        {/* Bandeau de succès */}
        <SuccessBanner
          visible={showSuccessBanner}
          message={successMessage}
          onClose={() => setShowSuccessBanner(false)}
          onPress={() => {
            setShowSuccessBanner(false);
            navigateToCart();
          }}
          autoHide={true}
          duration={2000}
        />

        <Header title="Réserver" scrollY={scrollY} />

        <Animated.ScrollView
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <SectionTitle isDark={isDark}>Réserver</SectionTitle>

          <View className="px-4 mb-6">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-xl text-left`}
            >
              Selectionnez votre produit
            </Text>
          </View>

          {/* Products List */}
          <View className="mb-4">
            <React.Suspense fallback={<ProductListSkeleton />}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onPressDetail={openProductDetail}
                />
              ))}
            </React.Suspense>
          </View>
        </Animated.ScrollView>

        {/* Cart Banner */}
        <React.Suspense fallback={<View className="h-20" />}>
          <CartBanner
            itemCount={getTotalItems()}
            totalPrice={getTotalPrice()}
            onPress={navigateToCart}
          />
        </React.Suspense>

        {/* Product Detail Modal */}
        <React.Suspense fallback={null}>
          <ProductDetailModal
            product={selectedProduct}
            visible={isDetailModalVisible}
            onClose={closeProductDetail}
          />
        </React.Suspense>
      </View>
    </SafeContainer>
  );
}
