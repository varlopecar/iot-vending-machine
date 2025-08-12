import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { useCart } from "../contexts/CartContext";
import { CheckoutScreen } from "../components/CheckoutScreen";

export default function CheckoutScreenPage() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { cartItems, appliedOffers, getTotalPrice, clearCart } = useCart();
  const [orderId] = useState("order-" + Date.now()); // Générer un ID unique

  const handleCheckoutSuccess = () => {
    Alert.alert(
      "Paiement réussi !",
      "Votre commande a été confirmée. Vous pouvez maintenant récupérer vos produits.",
      [
        {
          text: "OK",
          onPress: () => {
            clearCart();
            router.push("/");
          },
        },
      ]
    );
  };

  const handleCheckoutError = (error: string) => {
    Alert.alert("Erreur de paiement", error, [
      {
        text: "Réessayer",
        onPress: () => {
          // Le composant CheckoutScreen gère déjà la réinitialisation
        },
      },
      {
        text: "Retour au panier",
        onPress: () => router.back(),
      },
    ]);
  };

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-6">
        <Ionicons name="cart-outline" size={64} color="#6B7280" />
        <Text className="text-xl font-semibold text-gray-600 mt-4 mb-2">
          Votre panier est vide
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Ajoutez des produits à votre panier avant de procéder au paiement.
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/")}
          className="bg-blue-500 px-6 py-3 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            Parcourir les produits
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Finaliser la commande",
          headerBackTitle: "Retour",
          headerStyle: {
            backgroundColor: isDark ? "#493837" : "#E3E8E4",
          },
          headerTintColor: isDark ? "#FEFCFA" : "#3A2E2C",
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
          },
        }}
      />

      <View className="flex-1 bg-white">
        {/* Récapitulatif de la commande */}
        <View className="p-4 bg-gray-50 border-b border-gray-200">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Récapitulatif de votre commande
          </Text>

          {/* Produits */}
          <View className="mb-3">
            {cartItems.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-1"
              >
                <Text className="text-gray-600">
                  {item.name} x{item.quantity}
                </Text>
                <Text className="text-gray-900 font-medium">
                  {item.price * item.quantity === 0
                    ? "0€"
                    : `${(item.price * item.quantity).toFixed(2)}€`}
                </Text>
              </View>
            ))}
          </View>

          {/* Offres appliquées */}
          {appliedOffers.length > 0 && (
            <View className="mb-3 p-3 bg-blue-50 rounded-lg">
              <Text className="text-sm font-medium text-blue-800 mb-2">
                Offres appliquées :
              </Text>
              {appliedOffers.map((offer) => (
                <Text key={offer.id} className="text-sm text-blue-700">
                  • {offer.name} ({offer.points} pts)
                </Text>
              ))}
            </View>
          )}

          {/* Total */}
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-900">
              Total à payer
            </Text>
            <Text className="text-xl font-bold text-blue-600">
              {getTotalPrice() === 0 ? "0€" : `${getTotalPrice().toFixed(2)}€`}
            </Text>
          </View>
        </View>

        {/* Checkout Stripe */}
        <View className="flex-1">
          <CheckoutScreen
            orderId={orderId}
            onSuccess={handleCheckoutSuccess}
            onError={handleCheckoutError}
          />
        </View>
      </View>
    </>
  );
}
