import type Stripe from 'stripe';

/**
 * Extrait l'URL du reçu depuis un PaymentIntent Stripe
 * @param paymentIntent - PaymentIntent Stripe
 * @returns URL du reçu ou null si non disponible
 */
export function extractReceiptUrlFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
): string | null {
  try {
    // Vérifier si latest_charge existe et a un receipt_url
    if (
      paymentIntent.latest_charge &&
      typeof paymentIntent.latest_charge === 'object'
    ) {
      const charge = paymentIntent.latest_charge;
      if (charge.receipt_url) {
        return charge.receipt_url;
      }
    }



    return null;
  } catch (error) {

    return null;
  }
}

/**
 * Extrait le code d'erreur depuis un PaymentIntent Stripe
 * @param paymentIntent - PaymentIntent Stripe
 * @returns Code d'erreur ou null si non disponible
 */
export function extractErrorCodeFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
): string | null {
  try {
    if (paymentIntent.last_payment_error?.code) {
      return paymentIntent.last_payment_error.code;
    }

    return null;
  } catch (error) {

    return null;
  }
}

/**
 * Extrait le message d'erreur depuis un PaymentIntent Stripe
 * @param paymentIntent - PaymentIntent Stripe
 * @returns Message d'erreur ou null si non disponible
 */
export function extractErrorMessageFromPaymentIntent(
  paymentIntent: Stripe.PaymentIntent,
): string | null {
  try {
    if (paymentIntent.last_payment_error?.message) {
      return paymentIntent.last_payment_error.message;
    }

    return null;
  } catch (error) {

    return null;
  }
}
