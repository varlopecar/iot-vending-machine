import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';
import { SuccessBanner, PageSkeleton, ProductListSkeleton } from '../../components';
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types/product';
import { useCart } from '../../contexts/CartContext';

// Lazy loading des composants lourds
const ProductCard = React.lazy(() => import('../../components/ProductCard'));
const ProductDetailModal = React.lazy(() => import('../../components/ProductDetailModal'));
const CartBanner = React.lazy(() => import('../../components/CartBanner'));

export default function IndexScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const { addToCart, getTotalPrice, getTotalItems } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product);
    if (success) {
      setSuccessMessage(`${product.name} ajouté au panier !`);
      setShowSuccessBanner(true);
    } else {
      Alert.alert(
        'Limite atteinte',
        'Vous ne pouvez ajouter que 2 produits maximum au panier.',
        [{ text: 'OK' }]
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
    router.push('/panier' as any);
  };

  if (isLoading) {
    return (
      <SafeAreaView className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}>
        <PageSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}>
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

      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 mb-6">
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-4xl font-bold text-left mb-2`}
          >
            Réserver
          </Text>
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-lg text-left mt-6`}
          >
            Selectionnez votre produit
          </Text>
        </View>

        {/* Products List */}
        <View className="mb-4">
          <React.Suspense fallback={<ProductListSkeleton />}>
            {mockProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onPressDetail={openProductDetail}
              />
            ))}
          </React.Suspense>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}
