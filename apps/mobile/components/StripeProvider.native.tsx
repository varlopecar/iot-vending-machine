import React, { createContext, useContext, useEffect, useState, ReactElement } from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

interface StripeContextType {
  publishableKey: string | null;
  isLoading: boolean;
  error: string | null;
  refreshKey: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: ReactElement | ReactElement[];
}

const fetchPublishableKey = async (): Promise<string> => {
  try {
    // Récupérer la clé depuis le backend de manière sécurisée
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${API_BASE_URL}/trpc/stripe.getPublishableKey`);

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data?.result?.data?.publishableKey) {
      return data.result.data.publishableKey;
    }

    // Fallback pour le développement si l'API échoue
    const devKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (devKey) {
      console.warn('Utilisation de la clé Stripe de développement - fallback');
      return devKey;
    }

    throw new Error('Aucune clé Stripe disponible');
  } catch (error) {
    console.error('Erreur lors de la récupération de la clé Stripe:', error);

    // Fallback pour le développement uniquement
    const devKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (devKey) {
      console.warn('Utilisation de la clé Stripe de développement - fallback après erreur');
      return devKey;
    }

    throw new Error('Impossible de récupérer la clé publique Stripe');
  }
};

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshKey = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const key = await fetchPublishableKey();
      setPublishableKey(key);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération de la clé Stripe';
      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshKey();
  }, []);

  if (isLoading) {
    return (
      <StripeContext.Provider value={{
        publishableKey: null,
        isLoading: true,
        error: null,
        refreshKey,
      }}>
        {children}
      </StripeContext.Provider>
    );
  }

  if (error || !publishableKey) {
    return (
      <StripeContext.Provider value={{
        publishableKey: null,
        isLoading: false,
        error: error || 'Clé Stripe non disponible',
        refreshKey,
      }}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <StripeContext.Provider value={{
      publishableKey,
      isLoading: false,
      error: null,
      refreshKey,
    }}>
      <StripeProviderBase
        publishableKey={publishableKey}
        urlScheme="mobile" // Pour le deep linking 3DS
        merchantIdentifier="merchant.com.vendingmachine" // Pour Apple Pay (optionnel)
      >
        {children}
      </StripeProviderBase>
    </StripeContext.Provider>
  );
};

export const useStripeContext = () => {
  const ctx = useContext(StripeContext);
  if (!ctx) throw new Error('useStripeContext doit être utilisé dans un StripeProvider');
  return ctx;
};


