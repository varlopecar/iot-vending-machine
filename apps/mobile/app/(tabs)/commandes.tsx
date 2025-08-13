import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { HeaderSkeleton, OrderListSkeleton } from "../../components";
import { Order } from "../../types/product";
import { SafeContainer, SectionTitle } from "../../components/ui";
import { useCart } from "../../contexts/CartContext";
import { Header } from "../../components/Header";
import { useOrders } from "../../contexts/OrdersContext";

// Lazy loading des composants
const OrderCard = React.lazy(() => import("../../components/OrderCard"));
const CartBanner = React.lazy(() => import("../../components/CartBanner"));

export default function CommandesScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const { getTotalItems, getTotalPrice } = useCart();
  const { orders } = useOrders();
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [tick, setTick] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Simulation du chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Déclenche un re-render toutes les minutes pour rafraîchir le compte à rebours
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setLocalOrders((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const handleOrderPress = (order: Order) => {
    router.push({
      pathname: "/qr-code",
      params: { orderId: order.id },
    } as any);
  };

  const navigateToCart = () => {
    router.push("/panier");
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
      <View
        className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
      >
        <Header title="Commandes" scrollY={scrollY} />

        <Animated.ScrollView
          className="flex-1"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          <SectionTitle isDark={isDark}>Commandes</SectionTitle>

          <View className="px-4 mb-6">
            <Text
              className={`${isDark ? "text-dark-textSecondary" : "text-light-text-secondary"} text-xl text-left`}
            >
              Vos QR codes
            </Text>
          </View>

          {/* Orders List */}
          <View className="">
            <React.Suspense fallback={<OrderListSkeleton />}>
              {localOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onPress={handleOrderPress}
                />
              ))}
            </React.Suspense>
          </View>
        </Animated.ScrollView>

        {/* Cart Banner */}
        <React.Suspense fallback={<View className="h-20" />}>
          <CartBanner
            itemCount={getTotalItems()}
            totalPrice={getTotalPrice()}
            onPress={navigateToCart}
          />
        </React.Suspense>
      </View>
    </SafeContainer>
  );
}
