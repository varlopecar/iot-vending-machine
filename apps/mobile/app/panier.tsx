import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { useCart } from "../contexts/CartContext";

export default function CartScreen() {
  const { isDark } = useTailwindTheme();
  const [isGiftChecked, setIsGiftChecked] = useState(false);
  const {
    cartItems,
    appliedOffers,
    removeFromCart,
    // updateQuantity,
    getTotalPrice,
    removeOffer,
  } = useCart();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Panier",
          headerBackTitle: "",
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
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        <ScrollView className="flex-1 p-4">
          {/* Order Title */}
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-2xl font-bold mb-8`}
          >
            Votre commande
          </Text>

          {/* Applied Offers */}
          {appliedOffers.length > 0 && (
            <View
              className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4 mb-8 mx-[-16px]`}
            >
              {appliedOffers.map((offer) => (
                <View key={offer.id} className="flex-row items-center mb-3">
                  <Ionicons
                    name="pricetag-outline"
                    size={24}
                    color={isDark ? "#320120" : "#FFFFFF"}
                    style={{ marginRight: 12 }}
                  />
                  <View className="flex-1">
                    <Text
                      className={`${isDark ? "text-dark-buttonText" : "text-white"} font-bold text-lg`}
                    >
                      {offer.name} • {offer.points} pts
                    </Text>
                    <Text
                      className={`${isDark ? "text-dark-buttonText" : "text-white"} text-base`}
                    >
                      {offer.items
                        .map((i) => `${i.name} x${i.quantity}`)
                        .join(", ")}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeOffer(offer.id)}>
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={isDark ? "#320120" : "#FFFFFF"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Cart Items */}
          <View className="mb-6">
            {cartItems.map((item) => (
              <View
                key={
                  item.fromOfferId ? `${item.id}-${item.fromOfferId}` : item.id
                }
                className="p-2"
              >
                <View className="flex-row items-center">
                  {/* Secondary color line indicator */}
                  <View
                    className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} w-1 h-8 mr-3`}
                  />

                  {/* Product Info */}
                  <View className="flex-1">
                    <Text
                      className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
                    >
                      {item.name}
                      {item.quantity > 1 ? ` x${item.quantity}` : ""}
                    </Text>
                  </View>

                  {/* Price/Offer and Remove */}
                  <View className="flex-row items-center">
                    {item.fromOfferId ? (
                      <Text
                        className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold mr-3`}
                      >
                        Offert
                      </Text>
                    ) : (
                      <Text
                        className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold mr-3`}
                      >
                        {item.price * item.quantity === 0
                          ? "0€"
                          : `${(item.price * item.quantity).toFixed(2)}€`}
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() =>
                        !item.fromOfferId && removeFromCart(item.id)
                      }
                      disabled={!!item.fromOfferId}
                      className="p-2"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={
                          item.fromOfferId
                            ? isDark
                              ? "#6A5553"
                              : "#CBD5C1"
                            : isDark
                              ? "#FD9BD9"
                              : "#5B715F"
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer */}
        <View
          className={`${isDark ? "bg-dark-surface" : "bg-light-surface"} p-4 pb-8 border-t border-gray-300`}
        >
          {/* Subtotal */}
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-semibold`}
            >
              Sous-Total
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-lg font-bold`}
            >
              {getTotalPrice() === 0 ? "0€" : `${getTotalPrice().toFixed(2)}€`}
            </Text>
          </View>

          {/* Gift Option */}
          <TouchableOpacity
            className={`${isDark ? "bg-dark-textSecondary" : "bg-light-background"} p-4 rounded-lg border border-gray-300 mb-4`}
            onPress={() => setIsGiftChecked(!isGiftChecked)}
          >
            <View className="flex-row items-center">
              <View
                className={`w-5 h-5 border-2 ${isDark ? "border-gray-600" : "border-gray-400"} rounded mr-3 items-center justify-center`}
              >
                {isGiftChecked && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={isDark ? "#2C2221" : "#3A2E2C"}
                  />
                )}
              </View>
              <Text
                className={`${isDark ? "text-dark-background" : "text-light-text"} text-base`}
              >
                Offrir à un ami
              </Text>
            </View>
          </TouchableOpacity>

          {/* Validate Button */}
          <TouchableOpacity
            className={`${isDark ? "bg-dark-secondary" : "bg-light-secondary"} p-4 rounded-lg`}
            onPress={() => {
              // Navigation vers la page de validation
              console.log("Valider le panier");
            }}
          >
            <Text
              className={`${isDark ? "text-dark-buttonText" : "text-white"} text-lg font-bold text-center`}
            >
              Valider mon panier
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}
