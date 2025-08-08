import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { OrderCard } from "../../components";
import { mockOrders } from "../../data/mockProducts";
import { Order } from "../../types/product";
import { SafeContainer } from "../../components/ui";

export default function CommandesScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  // Mise à jour du temps restant toutes les minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders => [...prevOrders]);
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleOrderPress = (order: Order) => {
    router.push(`/qr-code?orderId=${order.id}`);
  };

  return (
    <SafeContainer>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="p-4 mb-6">
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text"} text-4xl font-bold text-left mb-2`}
          >
            Commandes
          </Text>
          <Text
            className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-lg text-left mt-6`}
          >
            Vos QR Codes :
          </Text>
        </View>

        {/* Liste des commandes */}
        {orders.length > 0 ? (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={handleOrderPress}
            />
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-8 px-4">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-lg text-center`}
            >
              Aucune commande active
            </Text>
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-sm text-center mt-2`}
            >
              Réservez des produits pour voir vos commandes ici
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeContainer>
  );
}
