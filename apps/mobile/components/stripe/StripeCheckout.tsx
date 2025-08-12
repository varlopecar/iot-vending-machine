import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useStripeCheckout } from "../../hooks/useStripeCheckout";
import { NativePaymentButton } from "./NativePaymentButton";
import { CreatePaymentIntentParams, PaymentResult } from "../../types/stripe";

interface StripeCheckoutProps {
  orderData: {
    amount: number;
    currency?: string;
    orderId: string;
    userId: string;
    machineId: string;
  };
  onPaymentSuccess: (result: PaymentResult) => void;
  onPaymentError: (error: string) => void;
  onCancel?: () => void;
}

export const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  orderData,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const {
    processPayment,
    createPaymentIntent,
    initializePaymentSheet,
    presentPayment,
    isLoading,
  } = useStripeCheckout();

  

  const handleInitializePayment = async () => {
    try {
      setIsInitializing(true);

      const paymentIntent = await createPaymentIntent({
        amount: orderData.amount,
        currency: orderData.currency || "eur",
        orderId: orderData.orderId,
        userId: orderData.userId,
        machineId: orderData.machineId,
      });

      setClientSecret(paymentIntent.client_secret);
    } catch (error) {
      console.error("Erreur initialisation:", error);
      onPaymentError("Impossible de préparer le paiement");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleClassicPayment = async () => {
    if (!clientSecret) {
      onPaymentError("Paiement non initialisé");
      return;
    }

    try {
      // Initialiser le Payment Sheet standard
      await initializePaymentSheet(clientSecret);

      // Présenter le Payment Sheet
      const result = await presentPayment();

      if (result.success) {
        onPaymentSuccess(result);
      } else {
        onPaymentError(result.error || "Paiement échoué");
      }
    } catch (error) {
      console.error("Erreur paiement classique:", error);
      onPaymentError(
        error instanceof Error ? error.message : "Erreur inattendue"
      );
    }
  };

  const formatAmount = (cents: number, currency: string = "EUR") => {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  };

  return (
    <View className="flex-1 p-6 bg-white">
      {/* En-tête */}
      <View className="mb-8">
        <Text className="text-2xl font-bold text-gray-900 mb-2">
          Finaliser le paiement
        </Text>
        <Text className="text-lg text-gray-600">
          Montant : {formatAmount(orderData.amount, orderData.currency)}
        </Text>
        <Text className="text-sm text-gray-500">
          Commande #{orderData.orderId.slice(0, 8)}
        </Text>
      </View>

      {/* Contenu principal */}
      {!clientSecret ? (
        <View className="flex-1 justify-center items-center">
          <TouchableOpacity
            className={`
              bg-blue-600 rounded-xl px-8 py-4 mb-4
              ${isInitializing ? "opacity-50" : "opacity-100"}
            `}
            onPress={handleInitializePayment}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">
                Préparer le paiement
              </Text>
            )}
          </TouchableOpacity>



          <Text className="text-sm text-gray-500 text-center">
            Appuyez pour configurer les options de paiement
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-6">
            Choisissez votre méthode de paiement :
          </Text>

          {/* Bouton de paiement natif */}
          <NativePaymentButton
            clientSecret={clientSecret}
            amount={orderData.amount}
            onSuccess={onPaymentSuccess}
            onError={onPaymentError}
            disabled={isLoading}
          />

          {/* Séparateur */}
          <View className="flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">ou</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Bouton de paiement classique */}
          <TouchableOpacity
            className={`
              bg-green-600 rounded-xl px-6 py-4 mb-6
              ${isLoading ? "opacity-50" : "opacity-100"}
              flex-row items-center justify-center
            `}
            onPress={handleClassicPayment}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white text-lg mr-2">💳</Text>
                <Text className="text-white font-semibold text-base">
                  Payer avec une carte
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Informations de sécurité */}
          <View className="bg-gray-50 rounded-xl p-4 mb-4">
            <Text className="text-sm text-gray-700 text-center">
              🔒 Paiement sécurisé par Stripe
            </Text>
          </View>
        </View>
      )}

      {/* Bouton d'annulation */}
      {onCancel && (
        <TouchableOpacity
          className="py-3"
          onPress={onCancel}
          disabled={isLoading || isInitializing}
        >
          <Text className="text-center text-gray-500 font-medium">Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
