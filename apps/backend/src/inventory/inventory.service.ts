import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Décrémente le stock pour une commande de manière transactionnelle
   * @param tx - Transaction Prisma
   * @param orderId - ID de la commande
   * @throws BadRequestException si le stock est insuffisant ou la commande invalide
   */
  async decrementStockForOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
  ): Promise<void> {
    try {
      // Récupérer la commande avec ses items et la machine
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          machine: true,
        },
      });

      if (!order) {
        throw new BadRequestException(`Commande ${orderId} introuvable`);
      }

      // Vérifier que la machine est en ligne
      if (order.machine.status !== 'ONLINE') {
        throw new BadRequestException(
          `Machine ${order.machine.id} n'est pas en ligne`,
        );
      }

      // Décrémenter le stock pour chaque item
      for (const item of order.items) {
        const stock = await tx.stock.findFirst({
          where: {
            machine_id: order.machine_id,
            product_id: item.product_id,
            slot_number: item.slot_number,
          },
        });

        if (!stock) {
          throw new BadRequestException(
            `Stock introuvable pour le produit ${item.product_id} sur la machine ${order.machine_id}`,
          );
        }

        // Vérifier que le stock est suffisant
        if (stock.quantity < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit ${item.product_id}: ${stock.quantity} disponible, ${item.quantity} demandé`,
          );
        }

        // Décrémenter le stock
        await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: stock.quantity - item.quantity },
        });

        this.logger.log(
          `Stock décrémenté: produit ${item.product_id}, machine ${order.machine_id}, ` +
            `ancien: ${stock.quantity}, nouveau: ${stock.quantity - item.quantity}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Erreur lors de la décrémentation du stock pour la commande ${orderId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Vérifie la disponibilité du stock pour une commande
   * @param orderId - ID de la commande
   * @returns true si le stock est suffisant
   */
  async checkStockAvailability(orderId: string): Promise<boolean> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        return false;
      }

      for (const item of order.items) {
        const stock = await this.prisma.stock.findFirst({
          where: {
            machine_id: order.machine_id,
            product_id: item.product_id,
            slot_number: item.slot_number,
          },
        });

        if (!stock || stock.quantity < item.quantity) {
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la vérification du stock pour la commande ${orderId}:`,
        error,
      );
      return false;
    }
  }
}
