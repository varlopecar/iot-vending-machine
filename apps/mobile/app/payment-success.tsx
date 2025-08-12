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

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [orderStatus, setOrderStatus] =
    useState<CheckoutGetStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulation des données de commande - en production, récupérez ces données depuis votre API
  useEffect(() => {
    const simulateOrderStatus = () => {
      // Simuler un appel API pour récupérer le statut de la commande
      setTimeout(() => {
        const mockOrderStatus: CheckoutGetStatusResponse = {
          orderStatus: "PAID",
          paymentStatus: "succeeded",
          paidAt: new Date().toISOString(),
          receiptUrl: null,
          amountTotalCents: parseInt(params.amount as string) || 2500,
          currency: (params.currency as string) || "eur",
          qrCodeToken: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          stripePaymentIntentId: params.paymentIntentId as string,
        };

        setOrderStatus(mockOrderStatus);
        setIsLoading(false);
      }, 1500); // Simule un délai de traitement
    };

    simulateOrderStatus();
  }, [params]);

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
    router.push("/(tabs)/");
  };

  if (isLoading || !orderStatus) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-16 h-16 bg-green-100 rounded-full justify-center items-center mb-4">
            <Text className="text-2xl">✅</Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Paiement confirmé !
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            Génération de votre QR code en cours...
          </Text>
          <View className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PaymentQRView
        qrCodeToken={orderStatus.qrCodeToken || ""}
        orderId={params.orderId as string}
        orderStatus={orderStatus}
        onRefreshStatus={handleRefreshStatus}
      />

      {/* Bouton retour à l'accueil */}
      <View className="p-6 border-t border-gray-200">
        <TouchableOpacity
          className="bg-blue-600 rounded-xl py-4 px-6"
          onPress={handleGoToHome}
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-center text-base">
            Retour à l'accueil
          </Text>
        </TouchableOpacity>

        <View className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <Text className="text-xs text-yellow-800 text-center">
            ⚠️ Gardez ce QR code jusqu'à la récupération de vos produits
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
