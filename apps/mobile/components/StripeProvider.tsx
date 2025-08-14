import React, { createContext, useContext, useState, useEffect } from 'react';
// Attention: ce fichier sera scindé en .native et .web pour éviter l'import web du module natif

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

// Mock de l'API pour récupérer la clé publishable
const fetchPublishableKey = async (): Promise<string> => {
  // Simulation d'un appel API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En production, ceci viendra de votre API tRPC
  // return await trpc.stripe.getPublishableKey.query();
  
  // Pour les tests, utilisez une clé de test Stripe
  return 'pk_test_51Oq...'; // Remplacez par votre vraie clé de test
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
      console.error('Erreur Stripe:', err);
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
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripeContext doit être utilisé dans un StripeProvider');
  }
  return context;
};
