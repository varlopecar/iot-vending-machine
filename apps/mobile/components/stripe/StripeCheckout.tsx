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
import { useTailwindTheme } from "../../hooks/useTailwindTheme";

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
  const { isDark } = useTailwindTheme();
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
      } else if (result.error) {
        onPaymentError(result.error);
      }
      // Si result.error est undefined, c'est une annulation utilisateur, on ne fait rien
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
    <View className={`flex-1 p-6 ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
      {/* En-tête */}
      <View className="mb-8">
        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
          Finaliser le paiement
        </Text>
        <Text className={`text-lg ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
          Montant : {formatAmount(orderData.amount, orderData.currency)}
        </Text>
        <Text className={`text-sm ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
          Commande #{orderData.orderId.slice(0, 8)}
        </Text>
      </View>

      {/* Contenu principal */}
      {!clientSecret ? (
        <View className="flex-1 justify-center items-center">
          <TouchableOpacity
            className={`
              ${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} rounded-xl px-8 py-4 mb-4
              ${isInitializing ? "opacity-50" : "opacity-100"}
            `}
            onPress={handleInitializePayment}
            disabled={isInitializing}
          >
            {isInitializing ? (
              <ActivityIndicator size="small" color={isDark ? "#320120" : "#FFFFFF"} />
            ) : (
              <Text className={`font-semibold text-lg ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
                Préparer le paiement
              </Text>
            )}
          </TouchableOpacity>



          <Text className={`text-sm text-center ${isDark ? 'text-dark-textSecondary' : 'text-light-text-secondary'}`}>
            Appuyez pour configurer les options de paiement
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <Text className={`text-lg font-semibold mb-6 ${isDark ? 'text-dark-textSecondary' : 'text-light-text'}`}>
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
            <View className={`flex-1 h-px ${isDark ? 'bg-dark-textSecondary' : 'bg-gray-300'}`} />
            <Text className={`mx-4 text-sm ${isDark ? 'text-dark-textSecondary' : 'text-gray-500'}`}>ou</Text>
            <View className={`flex-1 h-px ${isDark ? 'bg-dark-textSecondary' : 'bg-gray-300'}`} />
          </View>

          {/* Bouton de paiement classique */}
          <TouchableOpacity
            className={`
              ${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'} rounded-xl px-6 py-4 mb-6
              ${isLoading ? "opacity-50" : "opacity-100"}
              flex-row items-center justify-center
            `}
            onPress={handleClassicPayment}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={isDark ? "#320120" : "#FFFFFF"} />
            ) : (
              <>
                <Text className={`text-lg mr-2 ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>💳</Text>
                <Text className={`font-semibold text-base ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
                  Payer avec une carte
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Informations de sécurité */}
          <View className={`rounded-xl p-4 mb-4 ${isDark ? 'bg-dark-secondary' : 'bg-light-secondary'}`}>
            <Text className={`text-sm text-center ${isDark ? 'text-dark-buttonText' : 'text-white'}`}>
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
          <Text className={`text-center font-medium ${isDark ? 'text-dark-textSecondary' : 'text-gray-500'}`}>Annuler</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
