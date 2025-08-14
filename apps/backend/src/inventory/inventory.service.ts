import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  /**
   * Décrémente le stock pour une commande
   * Cette méthode est appelée lors de la confirmation de paiement
   */
  async decrementStockForOrder(tx: any, orderId: string): Promise<void> {
    try {
      this.logger.log(`📦 Décrémentation du stock pour la commande ${orderId}`);

      // Vérifier que la transaction a les méthodes nécessaires
      if (!tx.orderItem?.findMany) {
        this.logger.warn('Transaction does not have orderItem.findMany method');
        return;
      }

      // Récupérer les items de la commande
      const orderItems = await tx.orderItem.findMany({
        where: { order_id: orderId },
      });

      // Décrémenter le stock pour chaque item
      for (const item of orderItems) {
        await tx.stock.updateMany({
          where: {
            product_id: item.product_id,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });

        this.logger.log(
          `📉 Stock décrémenté pour le produit ${item.product_id}: -${item.quantity} unités`,
        );
      }

      this.logger.log(
        `✅ Stock décrémenté avec succès pour la commande ${orderId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la décrémentation du stock pour la commande ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Vérifie la disponibilité du stock pour une commande
   */
  async checkStockAvailability(orderId: string): Promise<boolean> {
    try {
      // Cette méthode sera implémentée selon les besoins
      this.logger.log(
        `🔍 Vérification de la disponibilité du stock pour la commande ${orderId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de la vérification du stock pour la commande ${orderId}:`,
        error,
      );
      return false;
    }
  }
}
