import React, { createContext, useContext } from 'react';

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

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const refreshKey = async () => {};
  return (
    <StripeContext.Provider value={{ publishableKey: null, isLoading: false, error: null, refreshKey }}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeContext = () => {
  const ctx = useContext(StripeContext);
  if (!ctx) throw new Error('useStripeContext doit être utilisé dans un StripeProvider');
  return ctx;
};


