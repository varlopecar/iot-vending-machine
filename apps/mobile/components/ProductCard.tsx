import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onPressDetail: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onPressDetail,
}: ProductCardProps) {
  const { isDark } = useTailwindTheme();

  return (
    <TouchableOpacity
      onPress={() => onPressDetail(product)}
      className="w-full"
      activeOpacity={0.7}
    >
      {/* Contenu avec padding et centrage vertical */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center flex-1">
          <Image
            source={product.image}
            className="w-16 h-16 rounded-lg mr-4"
            resizeMode="cover"
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
              {product.price.toFixed(2)}€
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => onAddToCart(product)}
          className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-10 h-10 rounded-full items-center justify-center`}
        >
          <Text
            className={`${isDark ? "text-dark-buttonText" : "text-white"} text-xl font-bold`}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ligne de séparation sur toute la largeur (sans padding) */}
      <View
        className="w-full h-px"
        style={{
          backgroundColor: isDark ? "#493837" : "#F3E9D8",
        }}
      />
    </TouchableOpacity>
  );
}
