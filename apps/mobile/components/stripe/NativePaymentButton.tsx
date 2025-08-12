import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNativePayment } from "../../hooks/useNativePayment";
import { PaymentResult } from "../../types/stripe";

interface NativePaymentButtonProps {
  clientSecret: string;
  amount: number;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const NativePaymentButton: React.FC<NativePaymentButtonProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { getNativePaySupport, initializeNativePayment, presentNativePayment } =
    useNativePayment();

  const nativeSupport = getNativePaySupport();

  const handleNativePayment = async () => {
    if (!nativeSupport.available || disabled) {
      onError("Paiement natif non disponible sur cet appareil");
      return;
    }

    setIsProcessing(true);

    try {
      // Initialiser le paiement natif
      await initializeNativePayment(clientSecret, amount);

      // Présenter l'interface de paiement natif
      const result = await presentNativePayment();

      if (result.success) {
        onSuccess({
          success: true,
          paymentIntentId: clientSecret.split("_secret_")[0],
        });
      } else {
        onError(result.error || "Paiement échoué");
      }
    } catch (error) {
      console.error("Erreur paiement natif:", error);
      onError(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setIsProcessing(false);
    }
  };

  // Ne pas afficher le bouton si le paiement natif n'est pas supporté
  if (nativeSupport.loading) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#666" />
        <Text className="text-sm text-gray-500 mt-2">
          Vérification du support{" "}
          {Platform.OS === "ios" ? "Apple Pay" : "Google Pay"}...
        </Text>
      </View>
    );
  }

  if (!nativeSupport.available) {
    return null;
  }

  const isIOS = Platform.OS === "ios";
  const buttonColor = isIOS ? "#000000" : "#4285F4";
  const buttonText = isIOS ? "Payer avec Apple Pay" : "Payer avec Google Pay";
  const isButtonDisabled = disabled || isProcessing;

  return (
    <TouchableOpacity
      className={`
        ${isIOS ? "bg-black" : "bg-blue-600"} 
        rounded-xl px-6 py-4 mb-3
        ${isButtonDisabled ? "opacity-50" : "opacity-100"}
        flex-row items-center justify-center
      `}
      onPress={handleNativePayment}
      disabled={isButtonDisabled}
      activeOpacity={0.8}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <>
          {isIOS && <Text className="text-white text-lg mr-2">🍎</Text>}
          {!isIOS && <Text className="text-white text-lg mr-2">💳</Text>}
          <Text className="text-white font-semibold text-base">
            {isProcessing ? "Traitement..." : buttonText}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
