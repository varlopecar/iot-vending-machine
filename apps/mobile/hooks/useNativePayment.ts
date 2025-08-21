import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useStripe, isGooglePaySupportedAsync } from '@stripe/stripe-react-native';

export const useNativePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [supportsApplePay, setSupportsApplePay] = useState<boolean | null>(null);
  const [supportsGooglePay, setSupportsGooglePay] = useState<boolean | null>(null);

  // Vérifier la disponibilité des paiements natifs
  useEffect(() => {
    checkNativePayAvailability();
  }, []);

  const checkNativePayAvailability = async () => {
    try {
      if (Platform.OS === 'ios') {
        // Pour iOS, on vérifie dynamiquement avec le backend
    
        try {
          const response = await fetch('https://ab13e2c66694.ngrok-free.app/trpc/stripe.checkNativePayAvailability', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              domain: 'ab13e2c66694.ngrok-free.app' // URL ngrok mise à jour
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            setSupportsApplePay(data.result.data.applePay);
          } else {
            setSupportsApplePay(false);
          }
        } catch {
          // En cas d'erreur, on assume qu'Apple Pay est disponible sur iOS
          setSupportsApplePay(true);
        }
      } else {
        setSupportsApplePay(false);
      }

      if (Platform.OS === 'android') {
        try {
          const googlePaySupported = await isGooglePaySupportedAsync();
          setSupportsGooglePay(googlePaySupported);
        } catch (error) {
  
          setSupportsGooglePay(false);
        }
      } else {
        setSupportsGooglePay(false);
      }
    } catch (error) {
      
      setSupportsApplePay(false);
      setSupportsGooglePay(false);
    }
  };

  const getNativePaySupport = () => {
    if (Platform.OS === 'ios') {
      return {
        available: supportsApplePay === true,
        type: 'apple_pay' as const,
        displayName: 'Apple Pay',
        loading: supportsApplePay === null
      };
    } else if (Platform.OS === 'android') {
      return {
        available: supportsGooglePay === true,
        type: 'google_pay' as const,
        displayName: 'Google Pay',
        loading: supportsGooglePay === null
      };
    } else {
      return {
        available: false,
        type: null,
        displayName: null,
        loading: false
      };
    }
  };

  const initializeNativePayment = async (clientSecret: string, amount: number) => {
    try {
      const nativeSupport = getNativePaySupport();
      
      if (!nativeSupport.available) {
        throw new Error('Paiement natif non disponible sur cet appareil');
      }

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: "Distributeur Automatique",
        applePay: Platform.OS === 'ios' && supportsApplePay ? {
          merchantCountryCode: 'FR',
          cartItems: [{
            label: 'Total',
            amount: (amount / 100).toFixed(2),
            paymentType: 'Immediate',
          }],
        } : undefined,
        googlePay: Platform.OS === 'android' && supportsGooglePay ? {
          merchantCountryCode: 'FR',
          testEnv: __DEV__,
          currencyCode: 'eur',
        } : undefined,
        style: 'automatic',
        appearance: {
          colors: {
            primary: Platform.OS === 'ios' ? '#000000' : '#4285F4',
            background: '#FFFFFF',
            componentBackground: '#F8F9FA',
            componentBorder: '#E1E5E9',
            text: '#1D1D1F',
            componentText: '#1D1D1F',
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

  const presentNativePayment = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await presentPaymentSheet();
      
      if (error) {

        return {
          success: false,
          error: error.message || 'Erreur lors du paiement natif'
        };
      }

      return { success: true };
    } catch (error) {
      
      return {
        success: false,
        error: 'Erreur inattendue lors du paiement natif'
      };
    }
  };

  return {
    getNativePaySupport,
    checkNativePayAvailability,
    initializeNativePayment,
    presentNativePayment,
    supportsApplePay,
    supportsGooglePay,
  };
};
