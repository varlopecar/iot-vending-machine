import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Product } from "../../types/product";

interface ProductSelectorSingleProps {
  product: Product;
  isDark: boolean;
  selected: boolean;
  onToggle: () => void;
  onProductPress?: () => void;
}

export function ProductSelectorSingle({
  product,
  isDark,
  selected,
  onToggle,
  onProductPress,
}: ProductSelectorSingleProps) {
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
          {/* Zone cliquable élargie pour radio (20% width) */}
          <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.7}
            style={{
              width: "20%",
              height: 60,
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isDark ? "#FEFCFA" : "#3A2E2C",
                backgroundColor: selected
                  ? isDark
                    ? "#FD9BD9"
                    : "#5B715F"
                  : "transparent",
              }}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
      <View
        className="w-full h-px"
        style={{ backgroundColor: isDark ? "#493837" : "#F3E9D8" }}
      />
    </View>
  );
}
