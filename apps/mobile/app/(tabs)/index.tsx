import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';
import ProductCard from '../../components/ProductCard';
import ProductDetailModal from '../../components/ProductDetailModal';
import CartBanner from '../../components/CartBanner';
import { mockProducts } from '../../data/mockProducts';
import { Product } from '../../types/product';
import { useCart } from '../../contexts/CartContext';

export default function IndexScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const { addToCart, getTotalPrice, getTotalItems } = useCart();
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const handleAddToCart = (product: Product) => {
    const success = addToCart(product);
    if (!success) {
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

  return (
    <SafeAreaView className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}>
      <ScrollView className="flex-1 p-4">
        {/* Header */}
        <View className="mb-6">
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-6xl font-bold text-left mb-2`}
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
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onPressDetail={openProductDetail}
            />
          ))}
        </View>
      </ScrollView>

      {/* Cart Banner */}
      <CartBanner
        itemCount={getTotalItems()}
        totalPrice={getTotalPrice()}
        onPress={navigateToCart}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={isDetailModalVisible}
        onClose={closeProductDetail}
      />
    </SafeAreaView>
  );
}
