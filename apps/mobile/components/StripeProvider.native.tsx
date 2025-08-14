import React, { createContext, useContext, useState, useEffect } from 'react';
import { StripeProvider as StripeProviderBase } from '@stripe/stripe-react-native';

interface StripeContextType {
  publishableKey: string | null;
  isLoading: boolean;
  error: string | null;
  refreshKey: () => Promise<void>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

interface StripeProviderProps {
  children: React.ReactNode;
}

const fetchPublishableKey = async (): Promise<string> => {
  await new Promise((r) => setTimeout(r, 100));
  return 'pk_test_51RvIdAHfSJ4cJF2RtcO2KwkhkyQ4igfsDhLiD1aaLEcC0TPOgUoCkXiH727zgTcDabsgqoTCMSbHWeaSGRULWrT200l1OkHj5X';
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
      const msg = err instanceof Error ? err.message : 'Erreur Stripe';
      setError(msg);
      console.error('Erreur Stripe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshKey();
  }, []);

  if (!publishableKey) {
    return (
      <StripeContext.Provider value={{ publishableKey: null, isLoading, error, refreshKey }}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <StripeContext.Provider value={{ publishableKey, isLoading: false, error: null, refreshKey }}>
      <StripeProviderBase publishableKey={publishableKey} urlScheme="mobile" merchantIdentifier="merchant.com.vendingmachine">
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


