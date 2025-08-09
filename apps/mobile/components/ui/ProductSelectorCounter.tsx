import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Product } from "../../types/product";

interface ProductSelectorCounterProps {
  product: Product;
  isDark: boolean;
  current: number;
  onDecrement: () => void;
  onIncrement: () => void;
  isIncrementDisabled?: boolean;
  onProductPress?: () => void;
}

export function ProductSelectorCounter({
  product,
  isDark,
  current,
  onDecrement,
  onIncrement,
  isIncrementDisabled = false,
  onProductPress,
}: ProductSelectorCounterProps) {
  return (
    <View>
      <TouchableOpacity activeOpacity={0.7} onPress={onProductPress}>
        <View className="flex-row items-center justify-between px-4 py-4">
          <View className="flex-row items-center flex-1">
            <Image
              source={product.image}
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                marginRight: 16,
              }}
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
              disabled={isIncrementDisabled}
              className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-10 h-10 rounded-full items-center justify-center ${
                isIncrementDisabled ? "opacity-50" : ""
              }`}
            >
              <Text
                className={`${isDark ? "text-dark-buttonText" : "text-white"} text-xl font-bold`}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
      <View
        className="w-full h-px"
        style={{ backgroundColor: isDark ? "#493837" : "#F3E9D8" }}
      />
    </View>
  );
}
