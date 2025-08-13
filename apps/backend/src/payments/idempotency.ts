import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

/**
 * Construit une clé d'idempotence pour un PaymentIntent
 * @param orderId - ID de la commande
 * @returns Clé d'idempotence
 */
export function buildPiIdemKey(orderId: string): string {
  return `order:${orderId}`;
}

/**
 * Exécute une action une seule fois par commande
 * @param tx - Transaction Prisma
 * @param orderId - ID de la commande
 * @param action - Nom de l'action
 * @param fn - Fonction à exécuter
 * @returns true si l'action a été exécutée, false si déjà effectuée
 */
export async function oncePerOrder(
  tx: Prisma.TransactionClient,
  orderId: string,
  action: string,
  fn: () => Promise<void>,
): Promise<boolean> {
  try {
    // Essayer d'insérer l'action dans order_actions
    await tx.orderAction.create({
      data: {
        order_id: orderId,
        action,
        created_at: new Date().toISOString(),
      },
    });

    // Si l'insertion réussit, exécuter la fonction
    await fn();
    return true;
  } catch (error) {
    // Si c'est une erreur de contrainte unique, l'action a déjà été effectuée
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return false;
    }
    // Sinon, c'est une vraie erreur, la relancer
    throw error;
  }
}

/**
 * Vérifie si une action a déjà été effectuée pour une commande
 * @param prisma - Instance Prisma
 * @param orderId - ID de la commande
 * @param action - Nom de l'action
 * @returns true si l'action a déjà été effectuée
 */
export async function isActionAlreadyPerformed(
  prisma: PrismaService,
  orderId: string,
  action: string,
): Promise<boolean> {
  const existingAction = await prisma.orderAction.findUnique({
    where: {
      order_id_action: {
        order_id: orderId,
        action,
      },
    },
  });

  return !!existingAction;
}

/**
 * Récupère toutes les actions effectuées pour une commande
 * @param prisma - Instance Prisma
 * @param orderId - ID de la commande
 * @returns Liste des actions effectuées
 */
export async function getOrderActions(
  prisma: PrismaService,
  orderId: string,
): Promise<Array<{ action: string; created_at: string }>> {
  return prisma.orderAction.findMany({
    where: { order_id: orderId },
    select: { action: true, created_at: true },
    orderBy: { created_at: 'asc' },
  });
}
