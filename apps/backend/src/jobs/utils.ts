/**
 * Utilitaires pour les jobs planifiés
 */

import { PrismaClient } from '@prisma/client';

/**
 * Exécute une fonction sur des éléments par lots
 * @param items Liste des éléments à traiter
 * @param size Taille de chaque lot
 * @param fn Fonction à exécuter sur chaque lot
 */
export async function runInBatches<T>(
  items: T[],
  size: number,
  fn: (batch: T[]) => Promise<void>,
): Promise<void> {
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    await fn(batch);
  }
}

/**
 * Retourne la date/heure UTC actuelle
 * Assure la cohérence des fuseaux horaires
 */
export function nowUtc(): Date {
  return new Date();
}

/**
 * Retourne la date/heure actuelle en Europe/Paris
 * Utile pour les logs et affichages
 */
export function nowEuropeParis(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris' }),
  );
}

/**
 * Formate une date pour l'affichage en Europe/Paris
 */
export function formatDateEuropeParis(date: Date): string {
  return date.toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Calcule la différence en minutes entre deux dates
 */
export function getMinutesDifference(date1: Date, date2: Date): number {
  return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60));
}

/**
 * Vérifie si une date est expirée (plus ancienne que maintenant)
 */
export function isExpired(date: Date): boolean {
  return date < nowUtc();
}

/**
 * Vérifie si une date est expirée avec une marge de sécurité
 * @param date Date à vérifier
 * @param marginMinutes Marge en minutes (défaut: 0)
 */
export function isExpiredWithMargin(
  date: Date,
  marginMinutes: number = 0,
): boolean {
  const now = nowUtc();
  const marginDate = new Date(now.getTime() + marginMinutes * 60 * 1000);
  return date < marginDate;
}

/**
 * Retourne une date d'expiration par défaut (24h dans le futur)
 */
export function getDefaultExpirationDate(): Date {
  const now = nowUtc();
  return new Date(now.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Retourne une date d'expiration personnalisée
 * @param hoursFromNow Nombre d'heures dans le futur
 */
export function getExpirationDate(hoursFromNow: number): Date {
  const now = nowUtc();
  return new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
}

/**
 * Log un événement de paiement local (non Stripe)
 */
export async function logLocalPaymentEvent(
  prisma: any,
  type: string,
  payload: Record<string, any>,
  orderId?: string,
): Promise<void> {
  try {
    // Vérifier que les méthodes nécessaires existent
    if (!prisma.payment?.findUnique || !prisma.paymentEvent?.create) {
      console.warn(
        'Prisma methods not available for logging local payment event',
      );
      return;
    }

    // Trouver le payment correspondant à cette commande
    const payment = await prisma.payment.findUnique({
      where: { order_id: orderId },
    });

    if (payment) {
      await prisma.paymentEvent.create({
        data: {
          payment_id: payment.id,
          order_id: orderId || 'unknown',
          stripe_event_id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type,
          payload,
        },
      });
    }
  } catch (error) {
    console.error(
      `Erreur lors de la création de l'événement local ${type}:`,
      error,
    );
  }
}

/**
 * Vérifie si un PaymentIntent peut être annulé en toute sécurité
 */
export function canSafelyCancelPaymentIntent(status: string): boolean {
  const safeToCancelStatuses = [
    'requires_payment_method',
    'requires_confirmation',
    'requires_action',
    'processing',
  ];

  return safeToCancelStatuses.includes(status);
}

/**
 * Vérifie si un PaymentIntent est dans un état final
 */
export function isPaymentIntentFinal(status: string): boolean {
  const finalStatuses = ['succeeded', 'canceled', 'failed'];

  return finalStatuses.includes(status);
}

/**
 * Retourne le statut d'un job avec des informations détaillées
 */
export function getJobStatusInfo(
  jobName: string,
  startTime: Date,
  endTime?: Date,
  success?: boolean,
  details?: Record<string, any>,
) {
  const duration = endTime ? getMinutesDifference(startTime, endTime) : null;

  return {
    jobName,
    startTime: formatDateEuropeParis(startTime),
    endTime: endTime ? formatDateEuropeParis(endTime) : null,
    duration: duration ? `${duration} minutes` : null,
    success,
    details,
    timestamp: nowUtc().toISOString(),
  };
}
