// Types pour l'intégration Stripe
export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripeCustomer {
  id: string;
  email?: string;
}

export interface StripeEphemeralKey {
  secret: string;
}

// Types pour les réponses tRPC checkout
export interface CheckoutCreateIntentResponse {
  publishableKey: string;
  paymentIntentClientSecret: string;
  customerId: string;
  ephemeralKey: string;
}

export interface CheckoutGetStatusResponse {
  orderStatus: string;
  paymentStatus: string | null;
  paidAt: string | null;
  receiptUrl: string | null;
  amountTotalCents: number;
  currency: string;
  qrCodeToken: string | null;
  stripePaymentIntentId: string | null;
}

// Types pour les états du checkout
export type CheckoutStatus = 
  | 'loading'
  | 'ready'
  | 'processing'
  | 'confirming'
  | 'paid'
  | 'error';

export interface CheckoutState {
  status: CheckoutStatus;
  error?: string;
  paymentData?: CheckoutCreateIntentResponse;
  orderStatus?: CheckoutGetStatusResponse;
  isPolling: boolean;
}

// Types pour PaymentSheet
export interface PaymentSheetConfig {
  merchantDisplayName: string;
  paymentIntentClientSecret: string;
  customerId: string;
  customerEphemeralKeySecret: string;
  allowsDelayedPaymentMethods: boolean;
  defaultBillingDetails?: {
    email?: string;
  };
  returnURL?: string;
}
