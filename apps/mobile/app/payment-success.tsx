import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { PaymentQRView } from "../components/PaymentQRView";
import { CheckoutGetStatusResponse } from "../types/stripe";
import { useOrders } from "../contexts/OrdersContext";
import { useCart } from "../contexts/CartContext";
import { useTailwindTheme } from "../hooks/useTailwindTheme";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTailwindTheme();
  const { addOrder } = useOrders();
  const { cartItems, getTotalPrice, clearCart } = useCart();

  const [orderStatus, setOrderStatus] =
    useState<CheckoutGetStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation des données de commande - en production, récupérez ces données depuis votre API
  useEffect(() => {
    let didCreate = false;
    const simulateOrderStatus = () => {
      // Simuler un appel API pour récupérer le statut de la commande
      setTimeout(() => {
        const rawAmount = Number(params.amount as string);
        const mockOrderStatus: CheckoutGetStatusResponse = {
          orderStatus: "PAID",
          paymentStatus: "succeeded",
          paidAt: new Date().toISOString(),
          receiptUrl: null,
          amountTotalCents: Number.isFinite(rawAmount) ? rawAmount : 0,
          currency: (params.currency as string) || "eur",
          qrCodeToken: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          stripePaymentIntentId: params.paymentIntentId as string,
        };

        setOrderStatus(mockOrderStatus);
        setIsLoading(false);

        // Créer une seule fois la commande pour cet orderId
        if (!didCreate) {
          didCreate = true;
          addOrder({
            id: (params.orderId as string) || `order_${Date.now()}`,
            items: cartItems,
            totalPrice: getTotalPrice(),
            qrCodeToken: mockOrderStatus.qrCodeToken || undefined,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),
            status: "active",
          });
          clearCart();
        }
      }, 1500); // Simule un délai de traitement
    };

    simulateOrderStatus();
  }, [params.orderId]);

  const handleRefreshStatus = async () => {
    try {
      setIsLoading(true);

      // TODO: Remplacer par un vrai appel à votre API tRPC
      // const updatedStatus = await trpc.checkout.getStatus.query({
      //   orderId: params.orderId as string
      // });

      // Simulation d'un rafraîchissement
      setTimeout(() => {
        Alert.alert(
          "Statut à jour",
          "Le statut de votre commande est à jour.",
          [{ text: "OK" }]
        );
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      Alert.alert(
        "Erreur",
        "Impossible de mettre à jour le statut de la commande.",
        [{ text: "OK" }]
      );
      setIsLoading(false);
    }
  };

  const handleGoToHome = () => {
    router.dismissAll();
    router.push("/(tabs)");
  };

  if (isLoading || !orderStatus) {
    return (
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
        <View className="flex-1 justify-center items-center p-6">
          <View className={`w-16 h-16 rounded-full justify-center items-center mb-4 ${isDark ? 'bg-dark-secondary' : 'bg-green-100'}`}>
            <Text className="text-2xl">✅</Text>
          </View>
          <Text className={`text-xl font-bold mb-2 ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
            Paiement confirmé !
          </Text>
          <Text className={`text-center mb-4 ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
            Génération de votre QR code en cours...
          </Text>
          <View className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin ${isDark ? 'border-dark-secondary' : 'border-green-500'}`} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      <PaymentQRView
        qrCodeToken={orderStatus.qrCodeToken || ""}
        orderId={params.orderId as string}
        orderStatus={orderStatus}
        onRefreshStatus={handleRefreshStatus}
      />

      {/* Bouton retour à l'accueil */}
      <View className={`p-6 border-t ${isDark ? 'border-dark-textSecondary' : 'border-gray-200'}`}>
        <TouchableOpacity
          className={`${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} rounded-xl py-4 px-6`}
          onPress={handleGoToHome}
          activeOpacity={0.8}
        >
          <Text className={`font-semibold text-center text-base ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
            Retour à l'accueil
          </Text>
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
}
