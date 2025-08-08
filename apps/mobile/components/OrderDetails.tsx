import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { CartItem } from '../types/product';

interface OrderDetailsProps {
  items: CartItem[];
  totalPrice: number;
  showTitle?: boolean;
}

export default function OrderDetails({ items, totalPrice, showTitle = true }: OrderDetailsProps) {
  const { isDark } = useTailwindTheme();

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <View className="mb-6">
      {showTitle && (
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold mb-4`}
        >
          Contenu de la commande
        </Text>
      )}
      
      <ScrollView className="max-h-48">
        {items.map((item, index) => (
          <View key={item.id} className="flex-row items-center mb-3">
            {/* Ligne décorative */}
            <View 
              className={`w-1 h-8 rounded-full mr-3 ${
                isDark ? 'bg-dark-secondary' : 'bg-light-secondary'
              }`}
            />
            
            {/* Image du produit */}
            <Image
              source={item.image}
              className="w-10 h-10 rounded-lg mr-3"
              resizeMode="cover"
            />
            
            {/* Détails du produit */}
            <View className="flex-1">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-medium`}
              >
                {item.name}
              </Text>
            </View>
            
            {/* Quantité et prix */}
            <View className="items-end">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-medium`}
              >
                x{item.quantity}
              </Text>
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-sm`}
              >
                {formatPrice(item.price)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      {/* Total */}
      <View className="border-t border-gray-300 pt-3 mt-3">
        <View className="flex-row justify-between items-center">
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}
          >
            Total
          </Text>
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-bold`}
          >
            {formatPrice(totalPrice)}
          </Text>
        </View>
      </View>
    </View>
  );
}
