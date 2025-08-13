import React, { useState } from "react";
import { View, Text, Alert, ScrollView, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StripeCheckout } from "../components/stripe/StripeCheckout";
import { PaymentResult } from "../types/stripe";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Données de commande simulées - en production, récupérez ces données depuis votre état global ou API
  const [orderData] = useState({
    amount: parseInt(params.amount as string) || 2500, // 25.00 EUR par défaut
    currency: (params.currency as string) || "eur",
    orderId: (params.orderId as string) || `order_${Date.now()}`,
    userId: (params.userId as string) || `user_${Date.now()}`,
    machineId: (params.machineId as string) || `machine_${Date.now()}`,
  });

  const handlePaymentSuccess = (result: PaymentResult) => {
    console.log("Paiement réussi:", result);

    Alert.alert(
      "Paiement réussi ! 🎉",
      "Votre commande a été confirmée. Vous allez recevoir votre QR code.",
      [
        {
          text: "Voir mon QR code",
          onPress: () => {
            // Naviguer vers l'écran de QR code avec les données de la commande
            router.push({
              pathname: "/payment-success",
              params: {
                orderId: orderData.orderId,
                paymentIntentId: result.paymentIntentId,
                amount: orderData.amount.toString(),
                currency: orderData.currency,
              },
            });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handlePaymentError = (error: string) => {
    console.error("Erreur de paiement:", error);

    Alert.alert(
      "Erreur de paiement ❌",
      error || "Une erreur est survenue lors du paiement.",
      [
        {
          text: "Réessayer",
          style: "default",
        },
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      "Annuler le paiement ?",
      "Êtes-vous sûr de vouloir abandonner votre achat ?",
      [
        {
          text: "Continuer l'achat",
          style: "cancel",
        },
        {
          text: "Annuler",
          style: "destructive",
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <StripeCheckout
          orderData={orderData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onCancel={handleCancel}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
