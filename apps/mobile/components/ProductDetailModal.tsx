import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { Product } from '../types/product';
import { SafeModal } from './ui';

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}

function ExpandableSection({ title, children, isDark }: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row items-center justify-between py-3"
      >
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}
        >
          {title}
        </Text>
        <Ionicons 
          name={isExpanded ? "chevron-down" : "chevron-forward"} 
          size={20} 
          color={isDark ? '#FEFCFA' : '#3A2E2C'} 
        />
      </TouchableOpacity>
      {isExpanded && (
        <View className="pl-4">
          {children}
        </View>
      )}
    </View>
  );
}

export default function ProductDetailModal({ product, visible, onClose }: ProductDetailModalProps) {
  const { isDark } = useTailwindTheme();

  // Reset expanded sections when modal closes
  React.useEffect(() => {
    if (!visible) {
      // Reset any internal state if needed
    }
  }, [visible]);

  if (!product) return null;

  return (
    <SafeModal
      visible={visible}
      onRequestClose={onClose}
      className={`${isDark ? 'bg-dark-surface' : 'bg-light-surface'} rounded-t-3xl h-[90%]`}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-300">
        <TouchableOpacity onPress={onClose}>
          <Ionicons 
            name="close" 
            size={24} 
            color={isDark ? '#FEFCFA' : '#3A2E2C'} 
          />
        </TouchableOpacity>
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-lg font-semibold`}
        >
          Informations produit
        </Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView className="p-4">
        {/* Product Image */}
        <View className="items-center mb-4">
          <Image
            source={product.image}
            className="w-32 h-32 rounded-lg"
            resizeMode="cover"
          />
        </View>

        {/* Product Title */}
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-2xl font-bold text-center mb-2`}
        >
          {product.name}
        </Text>

        {/* Slogan */}
        <Text
          className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-center mb-6 italic`}
        >
          Découvrez notre sélection premium
        </Text>

        {/* Ingredients Section */}
        <ExpandableSection title="Ingrédients" isDark={isDark}>
          <View className="mb-4">
            {product.ingredients.map((ingredient, index) => (
              <Text
                key={index}
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base mb-1`}
              >
                • {ingredient}
              </Text>
            ))}
          </View>
        </ExpandableSection>

        {/* Allergens Section */}
        <ExpandableSection title="Allergènes" isDark={isDark}>
          <View className="mb-4">
            {product.allergens.map((allergen, index) => (
              <View key={index} className="flex-row items-center mb-2">
                <Text className="text-lg mr-2">⚠️</Text>
                                    <Text
                      className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}
                    >
                      {allergen}
                    </Text>
              </View>
            ))}
          </View>
        </ExpandableSection>

        {/* Nutritional Values Section */}
        <ExpandableSection title="Valeurs nutritionnelles et Nutri-score" isDark={isDark}>
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}
              >
                Calories
              </Text>
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-semibold`}
              >
                {product.nutritionalValues.calories} kcal
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}
              >
                Protéines
              </Text>
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-semibold`}
              >
                {product.nutritionalValues.protein}g
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}
              >
                Glucides
              </Text>
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-semibold`}
              >
                {product.nutritionalValues.carbs}g
              </Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-base`}
              >
                Lipides
              </Text>
              <Text
                className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-base font-semibold`}
              >
                {product.nutritionalValues.fat}g
              </Text>
            </View>
          </View>
        </ExpandableSection>
      </ScrollView>
    </SafeModal>
  );
}
