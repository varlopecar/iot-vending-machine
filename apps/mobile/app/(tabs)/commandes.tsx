import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { HeaderSkeleton, OrderListSkeleton } from "../../components";
import { mockOrders } from "../../data/mockProducts";
import { Order } from "../../types/product";
import { SafeContainer } from "../../components/ui";

// Lazy loading des composants
const OrderCard = React.lazy(() => import('../../components/OrderCard'));

export default function CommandesScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrders(prevOrders =>
        prevOrders.map(order => ({
          ...order,
          expiresAt: new Date(order.expiresAt.getTime() - 60000), // Décrémente d'1 minute
        }))
      );
    }, 60000); // Met à jour toutes les minutes

    return () => clearInterval(interval);
  }, []);

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: '/qr-code',
      params: { orderId: order.id }
    } as any);
  };

  if (isLoading) {
    return (
      <SafeContainer>
        <View className="flex-1">
          <HeaderSkeleton />
          <OrderListSkeleton />
        </View>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 mb-6">
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text'} text-4xl font-bold text-left mb-2`}
          >
            Commandes
          </Text>
          <Text
            className={`${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'} text-lg text-left mt-6`}
          >
            Vos QR codes
          </Text>
        </View>

        {/* Orders List */}
        <ScrollView className="flex-1 px-4">
          <React.Suspense fallback={<OrderListSkeleton />}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={handleOrderPress}
              />
            ))}
          </React.Suspense>
        </ScrollView>
      </View>
    </SafeContainer>
  );
}
