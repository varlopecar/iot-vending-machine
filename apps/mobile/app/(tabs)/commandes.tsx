import React, { useState, useEffect, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import { HeaderSkeleton, OrderListSkeleton } from "../../components";
import { Order } from "../../types/product";
import { SafeContainer, SectionTitle } from "../../components/ui";
import { useCart } from "../../contexts/CartContext";
import { Header } from "../../components/Header";
// import { useOrders } from "../../contexts/OrdersContext";
import { useAuth } from "../../contexts/AuthContext";
import { getOrdersByUserId, OrderWithItems } from "../../lib/orders";

// Lazy loading des composants
const OrderCard = React.lazy(() => import("../../components/OrderCard"));
const CartBanner = React.lazy(() => import("../../components/CartBanner"));

export default function CommandesScreen() {
  const router = useRouter();
  const { isDark } = useTailwindTheme();
  const { getTotalItems, getTotalPrice } = useCart();
  const { user } = useAuth();
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  // const [tick, setTick] = useState(0); // Unused
  const [isLoading, setIsLoading] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Charger les commandes réelles pour l'utilisateur connecté
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setIsLoading(true);
        if (!user?.id) {
          setIsLoading(false);
          return;
        }
        const serverOrders = await getOrdersByUserId(user.id);
        const mapped: Order[] = serverOrders.map((o: OrderWithItems) => ({
          id: o.id,
          date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          items: o.items.map(it => ({ id: it.product_id, name: '', price: 0, image: null, quantity: it.quantity })),
          totalPrice: (o.total_price ?? 0),
          qrCodeToken: o.qr_code_token,
          expiresAt: new Date(o.expires_at),
          status: (o.status as any) || 'active',
        }));
        if (!cancelled) {
          setLocalOrders(mapped);
        }
      } catch {
        // Error silently handled
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id]);



  // Déclenche un re-render toutes les minutes pour rafraîchir le compte à rebours
  useEffect(() => {
    const id = setInterval(() => {
      // setTick supprimé: on force juste un re-render pour rafraîchir les expirations
      setLocalOrders((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Recharger à chaque focus de l'onglet
  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      const refetch = async () => {
        if (!user?.id) return;
        try {
          const serverOrders = await getOrdersByUserId(user.id);
          if (active) {
            const mapped: Order[] = serverOrders.map((o: OrderWithItems) => ({
              id: o.id,
              date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              items: o.items.map(it => ({ id: it.product_id, name: '', price: 0, image: null, quantity: it.quantity })),
              totalPrice: (o.total_price ?? 0),
              qrCodeToken: o.qr_code_token,
              expiresAt: new Date(o.expires_at),
              status: (o.status as any) || 'active',
            }));
            setLocalOrders(mapped);
          }
        } catch {
          // Error silently handled
        }
      };
      refetch();
      return () => { active = false; };
    }, [user?.id])
  );

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
