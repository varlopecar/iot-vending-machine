import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { TabBarSpacer } from "./ui";

interface CartBannerProps {
  itemCount: number;
  totalPrice: number;
  onPress: () => void;
}

export default function CartBanner({
  itemCount,
  totalPrice,
  onPress,
}: CartBannerProps) {
  const { isDark } = useTailwindTheme();
  const router = useRouter();

  if (itemCount === 0) return null;

  const handlePayNow = () => {
    // Naviguer directement vers l'écran de checkout Stripe
    router.push({
      pathname: "/checkout",
      params: {
        amount: Math.round(totalPrice * 100).toString(), // Convertir en centimes
        currency: "eur",
        orderId: `order_${Date.now()}`,
        userId: `test_user_${Date.now()}`,
        machineId: `machine_01`,
      },
    });
  };

  return (
    <TabBarSpacer>
      <View
        className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4`}
      >
        {/* Ligne du panier */}
        <TouchableOpacity onPress={onPress} className="mb-3">
          <View className="flex-row items-center justify-between">
            <View className="relative">
              <Image
                source={require("../assets/images/panier.png")}
                className="w-10 h-10"
                resizeMode="contain"
              />
              {itemCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {itemCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              className={`${isDark ? "text-dark-buttonText" : "text-white"} text-lg font-semibold flex-1 text-center`}
            >
              Afficher le panier
            </Text>
            <Text
              className={`${isDark ? "text-dark-buttonText" : "text-white"} text-lg font-bold`}
            >
              {totalPrice === 0 ? "0€" : `${totalPrice.toFixed(2)}€`}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Bouton de paiement Stripe */}
        <TouchableOpacity
          onPress={handlePayNow}
          className="bg-green-600 rounded-lg py-3 px-4"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white font-semibold text-base mr-2">
              💳 Payer maintenant
            </Text>
            <Text className="text-white font-bold text-base">
              {totalPrice.toFixed(2)}€
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </TabBarSpacer>
  );
}
