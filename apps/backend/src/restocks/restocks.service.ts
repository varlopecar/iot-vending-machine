import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRestockInput, RestockToMaxInput, RestockSlotToMaxInput, ManualRestockInput, RestockWithItems } from './restocks.schema';

@Injectable()
export class RestocksService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un restock avec les quantités spécifiées
   */
  async createRestock(restockData: CreateRestockInput): Promise<RestockWithItems> {
    // Vérifier que la machine existe
    const machine = await this.prisma.machine.findUnique({
      where: { id: restockData.machine_id },
    });
    if (!machine) {
      throw new NotFoundException(`Machine ${restockData.machine_id} non trouvée`);
    }

    // Vérifier que l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { id: restockData.user_id },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${restockData.user_id} non trouvé`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Créer le restock principal
      const restock = await tx.restock.create({
        data: {
          machine_id: restockData.machine_id,
          user_id: restockData.user_id,
          notes: restockData.notes || null,
          created_at: new Date().toISOString(),
        },
      });

      // Traiter chaque item de restock
      const restockItems: Array<{
        id: string;
        restock_id: string;
        stock_id: string;
        quantity_before: number;
        quantity_after: number;
        quantity_added: number;
        type: 'addition' | 'removal';
        slot_number: number;
        product_name: string;
        product_image_url?: string;
      }> = [];
      for (const item of restockData.items) {
        // Vérifier que le stock existe et appartient à la machine
        const stock = await tx.stock.findFirst({
          where: {
            id: item.stock_id,
            machine_id: restockData.machine_id,
          },
          include: { product: true },
        });

        if (!stock) {
          throw new BadRequestException(
            `Stock ${item.stock_id} non trouvé pour la machine ${restockData.machine_id}`
          );
        }

        const quantityBefore = stock.quantity;
        const quantityAfter = quantityBefore + item.quantity_to_add;

        // Vérifier que la quantité finale ne dépasse pas la capacité maximale
        if (quantityAfter > stock.max_capacity) {
          throw new BadRequestException(
            `La quantité finale (${quantityAfter}) dépasserait la capacité maximale (${stock.max_capacity}) pour le slot ${stock.slot_number}`
          );
        }

        // Mettre à jour le stock
        await tx.stock.update({
          where: { id: stock.id },
          data: {
            quantity: quantityAfter,
            updated_at: new Date().toISOString(),
          },
        });

        // Créer l'item de restock
        const restockItem = await tx.restockItem.create({
          data: {
            restock_id: restock.id,
            stock_id: stock.id,
            quantity_before: quantityBefore,
            quantity_after: quantityAfter,
            quantity_added: item.quantity_to_add,
          },
        });

        restockItems.push({
          id: restockItem.id,
          restock_id: restockItem.restock_id,
          stock_id: restockItem.stock_id,
          quantity_before: restockItem.quantity_before,
          quantity_after: restockItem.quantity_after,
          quantity_added: restockItem.quantity_added,
          type: restockItem.quantity_added >= 0 ? 'addition' : 'removal',
          slot_number: stock.slot_number,
          product_name: stock.product.name,
          product_image_url: stock.product.image_url,
        });
      }

      return { restock, items: restockItems };
    });

    return {
      id: result.restock.id,
      machine_id: result.restock.machine_id,
      user_id: result.restock.user_id,
      created_at: result.restock.created_at,
      notes: result.restock.notes || undefined,
      items: result.items,
    };
  }

  /**
   * Ravitaille tous les slots de la machine au maximum de leur capacité
   */
  async restockToMax(restockData: RestockToMaxInput): Promise<RestockWithItems> {
    // Vérifier que la machine existe
    const machine = await this.prisma.machine.findUnique({
      where: { id: restockData.machine_id },
    });
    if (!machine) {
      throw new NotFoundException(`Machine ${restockData.machine_id} non trouvée`);
    }

    // Récupérer l'admin si user_id n'est pas fourni
    let userId: string;
    if (restockData.user_id) {
      userId = restockData.user_id;
    } else {
      const admin = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      if (!admin) {
        throw new NotFoundException('Aucun utilisateur admin trouvé');
      }
      userId = admin.id;
    }

    // Récupérer tous les stocks de la machine
    const stocks = await this.prisma.stock.findMany({
      where: { machine_id: restockData.machine_id },
      include: { product: true },
    });

    if (stocks.length === 0) {
      throw new BadRequestException(`Aucun slot configuré pour la machine ${restockData.machine_id}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Créer le restock principal
      const restock = await tx.restock.create({
        data: {
          machine_id: restockData.machine_id,
          user_id: userId,
          notes: restockData.notes || 'Ravitaillement automatique au maximum',
          created_at: new Date().toISOString(),
        },
      });

      // Traiter chaque slot
      const restockItems: Array<{
        id: string;
        restock_id: string;
        stock_id: string;
        quantity_before: number;
        quantity_after: number;
        quantity_added: number;
        slot_number: number;
        product_name: string;
        product_image_url?: string;
      }> = [];
      for (const stock of stocks) {
        const quantityBefore = stock.quantity;
        const quantityAfter = stock.max_capacity;
        const quantityAdded = quantityAfter - quantityBefore;

        // Ne traiter que les slots qui ont besoin d'être ravitaillés
        if (quantityAdded > 0) {
          // Mettre à jour le stock
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: quantityAfter,
              updated_at: new Date().toISOString(),
            },
          });

          // Créer l'item de restock
          const restockItem = await tx.restockItem.create({
            data: {
              restock_id: restock.id,
              stock_id: stock.id,
              quantity_before: quantityBefore,
              quantity_after: quantityAfter,
              quantity_added: quantityAdded,
            },
          });

        restockItems.push({
            id: restockItem.id,
            restock_id: restockItem.restock_id,
            stock_id: restockItem.stock_id,
            quantity_before: restockItem.quantity_before,
            quantity_after: restockItem.quantity_after,
            quantity_added: restockItem.quantity_added,
          type: (restockItem.quantity_added >= 0 ? 'addition' : 'removal') as 'addition' | 'removal',
          slot_number: stock.slot_number,
            product_name: stock.product.name,
            product_image_url: stock.product.image_url,
          });
        }
      }

      return { restock, items: restockItems };
    });

    return {
      id: result.restock.id,
      machine_id: result.restock.machine_id,
      user_id: result.restock.user_id,
      created_at: result.restock.created_at,
      notes: result.restock.notes || undefined,
      items: result.items,
    };
  }

  /**
   * Récupère l'historique des restocks pour une machine
   */
  async getRestocksByMachine(machineId: string): Promise<RestockWithItems[]> {
    const restocks = await this.prisma.restock.findMany({
      where: { machine_id: machineId },
      include: {
        items: {
          include: {
            stock: {
              include: { product: true },
            },
          },
        },
        user: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return restocks.map((restock) => ({
      id: restock.id,
      machine_id: restock.machine_id,
      user_id: restock.user_id,
      created_at: restock.created_at,
      notes: restock.notes || undefined,
      items: restock.items.map((item) => ({
        id: item.id,
        restock_id: item.restock_id,
        stock_id: item.stock_id,
        quantity_before: item.quantity_before,
        quantity_after: item.quantity_after,
        quantity_added: item.quantity_added,
        type: item.quantity_added >= 0 ? 'addition' : 'removal',
        slot_number: item.stock.slot_number,
        product_name: item.stock.product.name,
        product_image_url: item.stock.product.image_url,
      })),
    }));
  }

  /**
   * Récupère tous les restocks
   */
  async getAllRestocks(): Promise<RestockWithItems[]> {
    const restocks = await this.prisma.restock.findMany({
      include: {
        items: {
          include: {
            stock: {
              include: { product: true },
            },
          },
        },
        user: true,
        machine: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return restocks.map((restock) => ({
      id: restock.id,
      machine_id: restock.machine_id,
      user_id: restock.user_id,
      created_at: restock.created_at,
      notes: restock.notes || undefined,
        items: restock.items.map((item) => ({
        id: item.id,
        restock_id: item.restock_id,
        stock_id: item.stock_id,
        quantity_before: item.quantity_before,
        quantity_after: item.quantity_after,
        quantity_added: item.quantity_added,
          type: item.quantity_added >= 0 ? 'addition' : 'removal',
        slot_number: item.stock.slot_number,
        product_name: item.stock.product.name,
        product_image_url: item.stock.product.image_url,
      })),
    }));
  }

  /**
   * Ravitaille un slot au maximum de sa capacité
   */
  async restockSlotToMax(restockData: RestockSlotToMaxInput): Promise<RestockWithItems> {
    // Vérifier que le stock existe
    const stock = await this.prisma.stock.findUnique({
      where: { id: restockData.stock_id },
      include: { 
        product: true,
        machine: true,
      },
    });
    if (!stock) {
      throw new NotFoundException(`Stock ${restockData.stock_id} non trouvé`);
    }

    // Calculer la quantité à ajouter pour atteindre le maximum
    const quantityToAdd = stock.max_capacity - stock.quantity;
    if (quantityToAdd <= 0) {
      throw new BadRequestException('Le slot est déjà au maximum de sa capacité');
    }

    // Récupérer l'admin si user_id n'est pas fourni
    let userId: string;
    if (restockData.user_id) {
      userId = restockData.user_id;
    } else {
      const admin = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      if (!admin) {
        throw new NotFoundException('Aucun utilisateur admin trouvé');
      }
      userId = admin.id;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Créer le restock principal
      const restock = await tx.restock.create({
        data: {
          machine_id: stock.machine_id,
          user_id: userId,
          notes: restockData.notes || `Ravitaillement au maximum du slot ${stock.slot_number}`,
          created_at: new Date().toISOString(),
        },
      });

      // Créer l'item de restock
      const restockItem = await tx.restockItem.create({
        data: {
          restock_id: restock.id,
          stock_id: stock.id,
          quantity_before: stock.quantity,
          quantity_after: stock.max_capacity,
          quantity_added: quantityToAdd,
        },
      });

      // Mettre à jour la quantité du stock au maximum
      await tx.stock.update({
        where: { id: stock.id },
        data: { quantity: stock.max_capacity },
      });

      return {
        restock,
        items: [
          {
            id: restockItem.id,
            restock_id: restockItem.restock_id,
            stock_id: restockItem.stock_id,
            quantity_before: restockItem.quantity_before,
            quantity_after: restockItem.quantity_after,
            quantity_added: restockItem.quantity_added,
            type: restockItem.quantity_added >= 0 ? 'addition' : 'removal',
            slot_number: stock.slot_number,
            product_name: stock.product.name,
            product_image_url: stock.product.image_url,
          },
        ],
      };
    });

    return {
      id: result.restock.id,
      machine_id: result.restock.machine_id,
      user_id: result.restock.user_id,
      created_at: result.restock.created_at,
      notes: result.restock.notes || undefined,
        items: result.items,
    };
  }

  /**
   * Ravitaille manuellement un slot avec une quantité spécifique
   */
  async manualRestock(restockData: ManualRestockInput): Promise<RestockWithItems> {
    // Vérifier que le stock existe
    const stock = await this.prisma.stock.findUnique({
      where: { id: restockData.stock_id },
      include: { 
        product: true,
        machine: true,
      },
    });
    if (!stock) {
      throw new NotFoundException(`Stock ${restockData.stock_id} non trouvé`);
    }

    // Vérifier que la quantité ne dépasse pas la capacité maximale
    const newQuantity = stock.quantity + restockData.quantity;
    if (newQuantity > stock.max_capacity) {
      throw new BadRequestException(
        `La quantité totale (${newQuantity}) dépasserait la capacité maximale (${stock.max_capacity})`
      );
    }

    // Récupérer l'admin si user_id n'est pas fourni
    let userId: string;
    if (restockData.user_id) {
      userId = restockData.user_id;
    } else {
      const admin = await this.prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });
      if (!admin) {
        throw new NotFoundException('Aucun utilisateur admin trouvé');
      }
      userId = admin.id;
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // Créer le restock principal
      const restock = await tx.restock.create({
        data: {
          machine_id: stock.machine_id,
          user_id: userId,
          notes: restockData.notes || `Ravitaillement manuel du slot ${stock.slot_number}`,
          created_at: new Date().toISOString(),
        },
      });

      // Créer l'item de restock
      const restockItem = await tx.restockItem.create({
        data: {
          restock_id: restock.id,
          stock_id: stock.id,
          quantity_before: stock.quantity,
          quantity_after: newQuantity,
          quantity_added: restockData.quantity,
        },
      });

      // Mettre à jour la quantité du stock
      await tx.stock.update({
        where: { id: stock.id },
        data: { quantity: newQuantity },
      });

      return {
        restock,
        items: [
          {
            id: restockItem.id,
            restock_id: restockItem.restock_id,
            stock_id: restockItem.stock_id,
            quantity_before: restockItem.quantity_before,
            quantity_after: restockItem.quantity_after,
            quantity_added: restockItem.quantity_added,
            slot_number: stock.slot_number,
            product_name: stock.product.name,
            product_image_url: stock.product.image_url,
          },
        ],
      };
    });

    return {
      id: result.restock.id,
      machine_id: result.restock.machine_id,
      user_id: result.restock.user_id,
      created_at: result.restock.created_at,
      notes: result.restock.notes || undefined,
      items: result.items,
    };
  }
}
