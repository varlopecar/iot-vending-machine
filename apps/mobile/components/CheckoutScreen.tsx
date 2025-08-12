import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  useStripe,
  PaymentSheet,
  PaymentSheetError,
} from '@stripe/stripe-react-native';
import { PaymentQRView } from './PaymentQRView';
import {
  CheckoutStatus,
  CheckoutState,
  CheckoutCreateIntentResponse,
  CheckoutGetStatusResponse,
  PaymentSheetConfig,
} from '../types/stripe';

interface CheckoutScreenProps {
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Mock des appels tRPC - à remplacer par la vraie implémentation
const mockCheckoutAPI = {
  createIntent: async (orderId: string): Promise<CheckoutCreateIntentResponse> => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      publishableKey: 'pk_test_...', // Sera récupéré depuis le serveur
      paymentIntentClientSecret: 'pi_test_secret_...',
      customerId: 'cus_test_...',
      ephemeralKey: 'ek_test_...',
    };
  },
  
  getStatus: async (orderId: string): Promise<CheckoutGetStatusResponse> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      orderStatus: 'REQUIRES_PAYMENT',
      paymentStatus: 'requires_payment_method',
      paidAt: null,
      receiptUrl: null,
      amountTotalCents: 2500,
      currency: 'EUR',
      qrCodeToken: null,
      stripePaymentIntentId: null,
    };
  },
};

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({
  orderId,
  onSuccess,
  onError,
}) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  
  const [state, setState] = useState<CheckoutState>({
    status: 'loading',
    isPolling: false,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Initialiser le checkout
  const initializeCheckout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading' }));
      
      // 1. Créer l'intention de paiement
      const paymentData = await mockCheckoutAPI.createIntent(orderId);
      
      // 2. Configurer PaymentSheet
      const config: PaymentSheetConfig = {
        merchantDisplayName: 'Vending Machine',
        paymentIntentClientSecret: paymentData.paymentIntentClientSecret,
        customerId: paymentData.customerId,
        customerEphemeralKeySecret: paymentData.ephemeralKey,
        allowsDelayedPaymentMethods: false,
        returnURL: 'mobile://stripe-redirect',
      };

      const { error } = await initPaymentSheet(config);
      
      if (error) {
        throw new Error(`Erreur d'initialisation: ${error.message}`);
      }

      setState(prev => ({
        ...prev,
        status: 'ready',
        paymentData,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [orderId, initPaymentSheet, onError]);

  // Présenter PaymentSheet
  const handlePayment = async () => {
    try {
      setState(prev => ({ ...prev, status: 'processing' }));
      
      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code === 'Canceled') {
          setState(prev => ({ ...prev, status: 'ready' }));
          return;
        }
        throw new Error(`Erreur de paiement: ${error.message}`);
      }

      // Paiement réussi, commencer le polling
      setState(prev => ({ ...prev, status: 'confirming' }));
      startPolling();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  };

  // Polling pour vérifier le statut
  const startPolling = useCallback(() => {
    setState(prev => ({ ...prev, isPolling: true }));
    
    const interval = setInterval(async () => {
      try {
        const status = await mockCheckoutAPI.getStatus(orderId);
        
        if (status.orderStatus === 'PAID' && status.qrCodeToken) {
          // Paiement confirmé, arrêter le polling
          clearInterval(interval);
          setState(prev => ({
            ...prev,
            status: 'paid',
            orderStatus: status,
            isPolling: false,
          }));
          onSuccess?.();
          return;
        }
        
        setState(prev => ({ ...prev, orderStatus: status }));
        
      } catch (error) {
        console.error('Erreur lors du polling:', error);
      }
    }, 2000); // Polling toutes les 2 secondes

    setPollingInterval(interval);
    
    // Timeout après 60 secondes
    setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        setState(prev => ({
          ...prev,
          isPolling: false,
          status: 'error',
          error: 'Délai d\'attente dépassé. Vérifiez le statut manuellement.',
        }));
      }
    }, 60000);
  }, [orderId, onSuccess]);

  // Nettoyer le polling
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Initialiser au montage
  useEffect(() => {
    initializeCheckout();
  }, [initializeCheckout]);

  // Gérer les erreurs
  const handleRetry = () => {
    setState(prev => ({ ...prev, status: 'loading', error: undefined }));
    initializeCheckout();
  };

  // Rendu des différents états
  if (state.status === 'loading') {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Initialisation du paiement...</Text>
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-white">
        <Text className="text-2xl font-bold text-red-600 mb-4">
          Erreur de paiement
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {state.error}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          className="bg-blue-500 px-6 py-3 rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-white font-semibold text-base">
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state.status === 'paid' && state.orderStatus?.qrCodeToken) {
    return (
      <PaymentQRView
        qrCodeToken={state.orderStatus.qrCodeToken}
        orderId={orderId}
        orderStatus={state.orderStatus}
        onRefreshStatus={() => {
          // Réinitialiser le polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
          }
          startPolling();
        }}
      />
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        {/* En-tête */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            Finaliser votre commande
          </Text>
          <Text className="text-gray-600">
            Commande #{orderId.slice(0, 8)}
          </Text>
        </View>

        {/* Informations de la commande */}
        {state.orderStatus && (
          <View className="mb-8 p-4 bg-gray-50 rounded-xl">
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              Récapitulatif
            </Text>
            <Text className="text-gray-600">
              Montant : {(state.orderStatus.amountTotalCents / 100).toFixed(2)} {state.orderStatus.currency}
            </Text>
          </View>
        )}

        {/* Bouton de paiement */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={state.status !== 'ready'}
          className={`px-6 py-4 rounded-xl ${
            state.status === 'ready' 
              ? 'bg-blue-500' 
              : 'bg-gray-300'
          }`}
          activeOpacity={0.8}
        >
          {state.status === 'processing' ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Traitement...
              </Text>
            </View>
          ) : state.status === 'confirming' ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Confirmation en cours...
              </Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-base text-center">
              Payer maintenant
            </Text>
          )}
        </TouchableOpacity>

        {/* Message d'aide */}
        <View className="mt-6 p-4 bg-blue-50 rounded-xl">
          <Text className="text-sm text-blue-800 text-center">
            🔒 Vos informations de paiement sont sécurisées par Stripe
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};
