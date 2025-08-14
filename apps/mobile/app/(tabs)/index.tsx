import React, { useState, useEffect, useRef } from "react";
import { View, Text, Alert, Animated, ScrollView, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
import { getAllMachines, Machine } from "../../lib/machines";
import { useMachine } from "../../contexts/MachineContext";
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
  const [machines, setMachines] = useState<Machine[]>([]);
  const { selectedMachineId, setSelectedMachineId } = useMachine();
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Charger la liste des machines et sélectionner la première en ligne
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await getAllMachines();
        if (cancelled) return;
        setMachines(list);
        const firstOnline = list.find(m => (m.status || '').toLowerCase() === 'online') || list[0];
        setSelectedMachineId(firstOnline?.id || null);
      } catch (e) {
        console.error('[Réserver] Erreur chargement machines:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Chargement des vrais produits depuis la machine sélectionnée
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        if (!selectedMachineId) { setProducts([]); setIsLoading(false); return; }
        const stocks = await getStocksByMachine(selectedMachineId);
        // Mapper les stocks -> Product[] pour la liste
        const mapped: Product[] = stocks.map((s: StockWithProduct) => ({
          id: s.id,
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
  }, [selectedMachineId]);

  const [errorModal, setErrorModal] = useState<{ visible: boolean; title: string; message: string }>({ visible: false, title: '', message: '' });

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product);
    if (success) {
      setSuccessMessage(`${product.name} ajouté au panier !`);
      setShowSuccessBanner(true);
    } else {
      setErrorModal({ visible: true, title: 'Limite atteinte', message: 'Vous ne pouvez ajouter que 2 produits maximum au panier.' });
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

        <Header
          scrollY={scrollY}
          customTitle={(
            <TouchableOpacity
              onPress={() => setIsPickerVisible(true)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="flex-row items-center"
            >
              <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-2xl font-extrabold`}>
                {machines.find(m => m.id === selectedMachineId)?.label || 'Sélectionner'}
              </Text>
              <Ionicons
                name="chevron-down"
                size={20}
                color={isDark ? '#FEFCFA' : '#3A2E2C'}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          )}
        />

        {/* Modal d'erreur */}
        <Modal transparent animationType="fade" visible={errorModal.visible} onRequestClose={() => setErrorModal({ visible: false, title: '', message: '' })}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full rounded-2xl p-5 ${isDark ? 'bg-dark-background' : 'bg-white'}`}>
              <Text className={`${isDark ? 'text-dark-text' : 'text-gray-900'} text-lg font-semibold mb-2`}>{errorModal.title || 'Erreur'}</Text>
              <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-gray-700'} mb-4`}>{errorModal.message}</Text>
              <View className="flex-row justify-end">
                <TouchableOpacity onPress={() => setErrorModal({ visible: false, title: '', message: '' })} className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} px-4 py-2 rounded-lg`}>
                  <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} font-semibold`}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Sélecteur de machine (menu déroulant) */}
        {/* Plus de champ sous le header - bouton intégré dans le header */}

        {/* Modal de sélection */}
        <Modal visible={isPickerVisible} transparent animationType="fade" onRequestClose={() => setIsPickerVisible(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={`w-full rounded-2xl p-4 ${isDark ? 'bg-dark-background' : 'bg-white'}`}>
              <Text className={`text-lg font-semibold mb-3 ${isDark ? 'text-dark-text' : 'text-gray-900'}`}>Choisir une machine</Text>
              <ScrollView className="max-h-80">
                {machines.map((m) => {
                  const isSelected = m.id === selectedMachineId;
                  const status = (m.status || '').toLowerCase();
                  const statusColor = status === 'online' ? '#10b981' : status === 'maintenance' ? '#f59e0b' : '#ef4444';
                  return (
                    <TouchableOpacity
                      key={m.id}
                      className={`flex-row items-center justify-between px-3 py-3 rounded-xl mb-2 ${isSelected ? (isDark ? 'bg-dark-secondary/30' : 'bg-gray-100') : ''}`}
                      onPress={() => { setSelectedMachineId(m.id); setIsPickerVisible(false); }}
                      activeOpacity={0.8}
                    >
                      <View className="flex-1">
                        <Text className={`${isDark ? 'text-dark-text' : 'text-gray-900'} text-base`}>{m.label}</Text>
                        <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-gray-600'} text-xs`}>{m.location}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor, marginRight: 8 }} />
                        {isSelected && <Text className={`${isDark ? 'text-dark-text' : 'text-gray-900'} text-sm`}>Sélectionnée</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {machines.length === 0 && (
                  <Text className={`${isDark ? 'text-dark-textSecondary' : 'text-gray-600'} text-sm`}>Aucune machine disponible</Text>
                )}
              </ScrollView>
              <View className="flex-row justify-end mt-3">
                <TouchableOpacity onPress={() => setIsPickerVisible(false)} className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} px-4 py-2 rounded-lg`}>
                  <Text className={`${isDark ? 'text-dark-buttonText' : 'text-white'} font-semibold`}>Fermer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
