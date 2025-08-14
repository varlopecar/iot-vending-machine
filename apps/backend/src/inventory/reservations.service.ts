import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface StockReservation {
  id: string;
  stock_id: string;
  quantity: number;
  order_id: string | null;
  reserved_at: string;
  expires_at: string;
  status: string;
}

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  /**
   * Libère les réservations de stock pour une commande
   * Cette méthode est appelée quand une commande expire ou est annulée
   *
   * @param tx Transaction Prisma
   * @param orderId ID de la commande
   * @returns Nombre de réservations libérées
   */
  async releaseReservedStockForOrder(
    tx: any,
    orderId: string,
  ): Promise<number> {
    try {
      this.logger.log(
        `🔄 Libération des réservations de stock pour la commande ${orderId}`,
      );

      // Récupérer les items de la commande
      const orderItems = await tx.orderItem.findMany({
        where: { order_id: orderId },
      });

      let totalReleased = 0;
      for (const item of orderItems) {
        const released = await this.releaseStockForProduct(
          tx,
          item.product_id,
          item.quantity,
          orderId,
        );
        totalReleased += released;
      }

      this.logger.log(
        `✅ ${totalReleased} unités de stock libérées pour la commande ${orderId}`,
      );
      return totalReleased;
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la libération du stock pour la commande ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Libère le stock réservé pour un produit spécifique
   */
  private async releaseStockForProduct(
    tx: any,
    productId: string,
    quantity: number,
    orderId: string,
  ): Promise<number> {
    try {
      // Vérifier si le produit a des réservations
      const reservations = await tx.stockReservation.findMany({
        where: {
          order_id: orderId,
          status: 'ACTIVE',
          stock: {
            product_id: productId,
          },
        },
        include: {
          stock: true,
        },
      });

      if (reservations.length === 0) {
        // Pas de réservations, on libère directement le stock
        const stock = await tx.stock.findFirst({
          where: {
            product_id: productId,
          },
        });

        if (!stock) {
          this.logger.warn(
            `⚠️  Aucun stock trouvé pour le produit ${productId}`,
          );
          return 0;
        }

        await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantity: stock.quantity + quantity,
          },
        });

        this.logger.log(
          `📦 Stock libéré pour le produit ${productId}: +${quantity} unités`,
        );
        return quantity;
      }

      // Libérer les réservations existantes
      let totalReleased = 0;
      for (const reservation of reservations) {
        if (reservation.quantity > 0) {
          // Mettre à jour le stock via l'ID du stock
          await tx.stock.update({
            where: {
              id: reservation.stock_id,
            },
            data: {
              quantity: {
                increment: reservation.quantity,
              },
            },
          });

          // Marquer la réservation comme libérée
          await tx.stockReservation.update({
            where: { id: reservation.id },
            data: {
              status: 'RELEASED',
            },
          });

          totalReleased += reservation.quantity;
        }
      }

      this.logger.log(
        `📦 ${totalReleased} unités libérées des réservations pour le produit ${productId}`,
      );
      return totalReleased;
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la libération du stock pour le produit ${productId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Crée une réservation de stock pour une commande
   */
  async createStockReservation(
    tx: any,
    productId: string,
    machineId: string,
    quantity: number,
    orderId: string,
    expiresAt: Date,
  ): Promise<StockReservation> {
    try {
      // Vérifier la disponibilité du stock
      const stock = await tx.stock.findFirst({
        where: {
          product_id: productId,
          machine_id: machineId,
        },
      });

      if (!stock || stock.quantity < quantity) {
        throw new Error(
          `Stock insuffisant pour le produit ${productId}: ${stock?.quantity || 0} disponible, ${quantity} demandé`,
        );
      }

      // Créer la réservation
      const reservation = await tx.stockReservation.create({
        data: {
          stock_id: stock.id,
          quantity,
          order_id: orderId,
          status: 'ACTIVE',
          expires_at: expiresAt.toISOString(),
        },
      });

      // Décrémenter le stock disponible
      await tx.stock.update({
        where: { id: stock.id },
        data: {
          quantity: stock.quantity - quantity,
        },
      });

      this.logger.log(
        `🔒 Réservation créée: ${quantity} unités du produit ${productId} pour la commande ${orderId}`,
      );
      return reservation;
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la création de la réservation pour le produit ${productId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Vérifie si une réservation est valide (active et non expirée)
   */
  async isReservationValid(
    tx: PrismaClient,
    reservationId: string,
  ): Promise<boolean> {
    const reservation = await tx.stockReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return false;
    }

    return (
      reservation.status === 'ACTIVE' &&
      new Date(reservation.expires_at) > new Date()
    );
  }

  /**
   * Nettoie les réservations expirées
   */
  async cleanupExpiredReservations(tx: any): Promise<number> {
    try {
      const expiredReservations = await tx.stockReservation.findMany({
        where: {
          status: 'ACTIVE',
          expires_at: {
            lt: new Date().toISOString(),
          },
        },
      });

      let cleanedCount = 0;
      for (const reservation of expiredReservations) {
        // Libérer le stock directement
        await tx.stock.update({
          where: { id: reservation.stock_id },
          data: {
            quantity: {
              increment: reservation.quantity,
            },
          },
        });

        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: {
            status: 'EXPIRED',
          },
        });

        cleanedCount++;
      }

      this.logger.log(`🧹 ${cleanedCount} réservations expirées nettoyées`);
      return cleanedCount;
    } catch (error) {
      this.logger.error(
        '❌ Erreur lors du nettoyage des réservations expirées:',
        error,
      );
      throw error;
    }
  }
}
