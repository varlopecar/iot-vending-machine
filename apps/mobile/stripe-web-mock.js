// Mock implementation for Stripe React Native on web
// This file provides empty implementations to prevent build errors on web

// Mock CardField component
export const CardField = () => null;
CardField.displayName = 'CardField';

// Mock useStripe hook
export const useStripe = () => ({
    initPaymentSheet: () => Promise.resolve({ error: null }),
    presentPaymentSheet: () => Promise.resolve({ error: null }),
    confirmPayment: () => Promise.resolve({ error: null }),
    createToken: () => Promise.resolve({ error: null }),
    createPaymentMethod: () => Promise.resolve({ error: null }),
    handleCardAction: () => Promise.resolve({ error: null }),
    confirmSetupIntent: () => Promise.resolve({ error: null }),
    retrievePaymentIntent: () => Promise.resolve({ error: null }),
    retrieveSetupIntent: () => Promise.resolve({ error: null }),
    isCardValid: () => false,
    createCvcUpdateToken: () => Promise.resolve({ error: null }),
    handleURLCallback: () => Promise.resolve({ error: null }),
    verifyPaymentIntentWithMicrodeposits: () => Promise.resolve({ error: null }),
    collectBankAccountToken: () => Promise.resolve({ error: null }),
    collectFinancialConnectionsAccounts: () => Promise.resolve({ error: null }),
    isInitialized: false,
});

// Mock StripeProvider
export const StripeProvider = ({ children }) => children;
StripeProvider.displayName = 'StripeProvider';

// Mock other components
export const ApplePayButton = () => null;
ApplePayButton.displayName = 'ApplePayButton';

export const GooglePayButton = () => null;
GooglePayButton.displayName = 'GooglePayButton';

export const AuBECSDebitForm = () => null;
AuBECSDebitForm.displayName = 'AuBECSDebitForm';

export const CardFieldInput = () => null;
CardFieldInput.displayName = 'CardFieldInput';

export const AddressSheet = () => null;
AddressSheet.displayName = 'AddressSheet';

export const PaymentSheet = () => null;
PaymentSheet.displayName = 'PaymentSheet';

export const AddToWalletButton = () => null;
AddToWalletButton.displayName = 'AddToWalletButton';

// Mock constants
export const initStripe = () => Promise.resolve({ error: null });
export const setReturnUrl = () => { };
export const handleURLCallback = () => Promise.resolve({ error: null });

// Default export
export default {
    CardField,
    useStripe,
    StripeProvider,
    ApplePayButton,
    GooglePayButton,
    AuBECSDebitForm,
    CardFieldInput,
    AddressSheet,
    PaymentSheet,
    AddToWalletButton,
    initStripe,
    setReturnUrl,
    handleURLCallback,
};
