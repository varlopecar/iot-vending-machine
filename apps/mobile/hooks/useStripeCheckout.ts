import { useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import { Platform, Alert } from "react-native";
import { API_BASE_URL } from "../lib/api";

interface CreatePaymentIntentParams {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
  machineId: string;
}

interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntentId?: string;
}

export const useStripeCheckout = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);

  const createPaymentIntent = async (params: CreatePaymentIntentParams) => {
    try {
      setIsLoading(true);

      // Utilisateur de test en dur pour le développement
      const TEST_USER_ID = "test-user-123";

      // Format simple pour l'endpoint tRPC Stripe (sans authentification)
      const requestBody = {
        amount: params.amount,
        currency: params.currency || "eur",
        metadata: {
          order_id: params.orderId,
          user_id: TEST_USER_ID, // Utilise l'ID de test
          machine_id: params.machineId,
        },
        supportsNativePay: false, // Désactivé temporairement pour les tests
        platform: Platform.OS,
      };

      // Use API_BASE_URL instead of hardcoded ngrok URL
      const endpoint = `${API_BASE_URL}/trpc/stripe.createPaymentIntent`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true", // Évite la page d'avertissement ngrok
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Format de réponse tRPC : {"result": {"data": ...}}
      if (data.result?.data) {
        return data.result.data;
      } else {
        throw new Error("Format de réponse invalide du serveur");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const initializePaymentSheet = async (
    clientSecret: string,
    customerId?: string
  ) => {
    try {
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        customerId,
        returnURL: "mobile://stripe-redirect",
        merchantDisplayName: "Distributeur Automatique",
        applePay: {
          merchantCountryCode: "FR",
        },
        googlePay: {
          merchantCountryCode: "FR",
          testEnv: __DEV__, // Mode test en développement
        },
        style: "automatic",
        appearance: {
          colors: {
            primary: "#007AFF",
            background: "#FFFFFF",
            componentBackground: "#F8F9FA",
            componentBorder: "#E1E5E9",
            componentDivider: "#E1E5E9",
            componentText: "#1D1D1F",
            placeholderText: "#86868B",
          },
          shapes: {
            borderRadius: 8,
          },
        },
      });

      if (error) {
        throw new Error(`Erreur initialisation: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  const presentPayment = async (): Promise<PaymentResult> => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        // Gestion spécifique des erreurs utilisateur
        if (error.code === "Canceled") {
          return {
            success: false,
            error: undefined, // Pas d'erreur pour les annulations utilisateur
          };
        }

        return {
          success: false,
          error: error.message || "Erreur lors du paiement",
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: "Erreur inattendue lors du paiement",
      };
    }
  };

  const processPayment = async (
    params: CreatePaymentIntentParams
  ): Promise<PaymentResult> => {
    try {
      setIsLoading(true);

      // 1. Créer l'intention de paiement
      const paymentIntent = await createPaymentIntent(params);

      // 2. Initialiser le Payment Sheet
      await initializePaymentSheet(
        paymentIntent.client_secret,
        paymentIntent.customer_id
      );

      // 3. Présenter le Payment Sheet
      const result = await presentPayment();

      if (result.success) {
        return {
          success: true,
          paymentIntentId: paymentIntent.id,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const showPaymentResult = (
    result: PaymentResult,
    onSuccess?: () => void,
    onError?: () => void
  ) => {
    if (result.success) {
      Alert.alert(
        "Paiement réussi !",
        "Votre commande a été confirmée. Vous allez recevoir votre QR code.",
        [
          {
            text: "OK",
            onPress: onSuccess,
          },
        ]
      );
    } else {
      Alert.alert(
        "Erreur de paiement",
        result.error || "Une erreur est survenue lors du paiement.",
        [
          {
            text: "Réessayer",
            onPress: onError,
          },
          {
            text: "Annuler",
            style: "cancel",
          },
        ]
      );
    }
  };

  return {
    processPayment,
    createPaymentIntent,
    initializePaymentSheet,
    presentPayment,
    showPaymentResult,
    isLoading,
  };
};
