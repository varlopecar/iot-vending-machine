import { useState, useCallback, useRef } from 'react';
import {
  CheckoutStatus,
  CheckoutState,
  CheckoutCreateIntentResponse,
  CheckoutGetStatusResponse,
} from '../types/stripe';

interface UseStripeCheckoutOptions {
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseStripeCheckoutReturn {
  state: CheckoutState;
  initializeCheckout: () => Promise<void>;
  handlePayment: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  reset: () => void;
}

// Mock des appels tRPC - à remplacer par la vraie implémentation
const mockCheckoutAPI = {
  createIntent: async (orderId: string): Promise<CheckoutCreateIntentResponse> => {
    // Simulation d'un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      publishableKey: 'pk_test_...',
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

export const useStripeCheckout = ({
  orderId,
  onSuccess,
  onError,
}: UseStripeCheckoutOptions): UseStripeCheckoutReturn => {
  const [state, setState] = useState<CheckoutState>({
    status: 'loading',
    isPolling: false,
  });

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyer les timers
  const cleanupTimers = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Initialiser le checkout
  const initializeCheckout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading' }));
      
      const paymentData = await mockCheckoutAPI.createIntent(orderId);
      
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
  }, [orderId, onError]);

  // Démarrer le polling
  const startPolling = useCallback(() => {
    setState(prev => ({ ...prev, isPolling: true }));
    
    const interval = setInterval(async () => {
      try {
        const status = await mockCheckoutAPI.getStatus(orderId);
        
        if (status.orderStatus === 'PAID' && status.qrCodeToken) {
          // Paiement confirmé, arrêter le polling
          cleanupTimers();
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

    pollingIntervalRef.current = interval;
    
    // Timeout après 60 secondes
    timeoutRef.current = setTimeout(() => {
      if (interval) {
        cleanupTimers();
        setState(prev => ({
          ...prev,
          isPolling: false,
          status: 'error',
          error: 'Délai d\'attente dépassé. Vérifiez le statut manuellement.',
        }));
      }
    }, 60000);
  }, [orderId, onSuccess, cleanupTimers]);

  // Gérer le paiement
  const handlePayment = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, status: 'processing' }));
      
      // Simulation du processus de paiement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
  }, [startPolling, onError]);

  // Rafraîchir le statut manuellement
  const refreshStatus = useCallback(async () => {
    try {
      const status = await mockCheckoutAPI.getStatus(orderId);
      setState(prev => ({ ...prev, orderStatus: status }));
      
      if (status.orderStatus === 'PAID' && status.qrCodeToken) {
        cleanupTimers();
        setState(prev => ({
          ...prev,
          status: 'paid',
          orderStatus: status,
          isPolling: false,
        }));
        onSuccess?.();
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    }
  }, [orderId, onSuccess, cleanupTimers]);

  // Réinitialiser l'état
  const reset = useCallback(() => {
    cleanupTimers();
    setState({
      status: 'loading',
      isPolling: false,
    });
  }, [cleanupTimers]);

  // Nettoyer au démontage
  const cleanup = useCallback(() => {
    cleanupTimers();
  }, [cleanupTimers]);

  // Nettoyer les timers au démontage
  useState(() => {
    return () => cleanup();
  });

  return {
    state,
    initializeCheckout,
    handlePayment,
    refreshStatus,
    reset,
  };
};
