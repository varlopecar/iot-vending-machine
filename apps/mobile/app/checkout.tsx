import React, { useState } from "react";
import { View, Text, Alert, ScrollView, SafeAreaView } from "react-native";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { StripeCheckout } from "../components/stripe/StripeCheckout";
import { PaymentResult } from "../types/stripe";
import { useTailwindTheme } from "../hooks/useTailwindTheme";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDark } = useTailwindTheme();



  // Données de commande simulées - en production, récupérez ces données depuis votre état global ou API
  const rawAmount = Number(params.amount as string);
  const [orderData] = useState({
    amount: Number.isFinite(rawAmount) ? rawAmount : 2500, // Respecte 0 si passé en paramètre
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
    <>
      <Stack.Screen
        options={{
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
      <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <StripeCheckout
            orderData={orderData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onCancel={handleCancel}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
