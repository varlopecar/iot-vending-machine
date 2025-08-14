import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import {
  CreateStockInput,
  UpdateStockInput,
  AddSlotInput,
  Stock,
  StockWithProduct,
} from './stocks.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StocksService {
  constructor(private readonly prisma: PrismaService) {}

  async createStock(stockData: CreateStockInput): Promise<Stock> {
    const stock = await this.prisma.stock.create({
      data: stockData,
    });
    return this.mapStock(stock);
  }

  async getAllStocks(): Promise<Stock[]> {
    const stocks = await this.prisma.stock.findMany();
    return stocks.map(this.mapStock);
  }

  async getStockById(id: string): Promise<Stock> {
    const stock = await this.prisma.stock.findUnique({ where: { id } });
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return this.mapStock(stock);
  }

  async getStocksByMachine(machineId: string): Promise<StockWithProduct[]> {
    const stocks = await this.prisma.stock.findMany({
      where: { machine_id: machineId },
      include: { product: true },
    });
    return stocks.map((s) => ({
      id: s.id,
      machine_id: s.machine_id,
      product_id: s.product_id,
      quantity: s.quantity,
      slot_number: s.slot_number,
      max_capacity: s.max_capacity,
      low_threshold: s.low_threshold,
      product_name: s.product.name,
      product_price: Number(s.product.price),
      product_image_url: s.product.image_url,
      product_ingredients_list: s.product.ingredients_list ?? [],
      product_allergens_list: s.product.allergens_list ?? [],
      product_nutritional: (s.product as any).nutritional ?? undefined,
    }));
  }

  async getStockByMachineAndProduct(
    machineId: string,
    productId: string,
  ): Promise<Stock | null> {
    const stock = await this.prisma.stock.findFirst({
      where: { machine_id: machineId, product_id: productId },
    });
    return stock ? this.mapStock(stock) : null;
  }

  async updateStock(id: string, updateData: UpdateStockInput): Promise<Stock> {
    try {
      // Si la quantité est mise à jour, valider par rapport à max_capacity
      if (Object.prototype.hasOwnProperty.call(updateData, 'quantity')) {
        const current = await this.prisma.stock.findUnique({ where: { id } });
        if (!current) throw new NotFoundException('Stock not found');
        const newQuantity = (updateData as any).quantity as number | undefined;
        if (typeof newQuantity === 'number' && newQuantity > current.max_capacity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `La quantité (${newQuantity}) dépasse la capacité maximale (${current.max_capacity})`,
          });
        }
      }

      const stock = await this.prisma.stock.update({
        where: { id },
        data: updateData,
      });
      return this.mapStock(stock);
    } catch (err) {
      // Ne pas masquer les erreurs de validation en NotFound
      if (err instanceof BadRequestException || err instanceof NotFoundException || err instanceof TRPCError) {
        throw err;
      }
      throw new NotFoundException('Stock not found');
    }
  }

  async updateStockQuantity(id: string, quantity: number): Promise<Stock> {
    if (quantity < 0) {
      throw new BadRequestException('La quantité ne peut pas être négative');
    }
    const current = await this.prisma.stock.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException('Stock not found');
    }
    if (quantity > current.max_capacity) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `La quantité (${quantity}) dépasse la capacité maximale (${current.max_capacity})`,
      });
    }
    const updated = await this.prisma.stock.update({ where: { id }, data: { quantity } });
    return this.mapStock(updated);
  }

  async addStockQuantity(id: string, quantity: number): Promise<Stock> {
    const stock = await this.getStockById(id);
    return this.updateStockQuantity(id, stock.quantity + quantity);
  }

  async removeStockQuantity(id: string, quantity: number): Promise<Stock> {
    const stock = await this.getStockById(id);
    if (stock.quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    return this.updateStockQuantity(id, stock.quantity - quantity);
  }

  async getLowStockItems(threshold: number = 5): Promise<StockWithProduct[]> {
    const stocks = await this.prisma.stock.findMany({
      where: { quantity: { lte: threshold } },
      include: { product: true },
    });
    return stocks.map((s) => ({
      id: s.id,
      machine_id: s.machine_id,
      product_id: s.product_id,
      quantity: s.quantity,
      slot_number: s.slot_number,
      max_capacity: s.max_capacity,
      low_threshold: s.low_threshold,
      product_name: s.product.name,
      product_price: Number(s.product.price),
      product_image_url: s.product.image_url,
      product_ingredients_list: s.product.ingredients_list ?? [],
      product_allergens_list: s.product.allergens_list ?? [],
      product_nutritional: (s.product as any).nutritional ?? undefined,
    }));
  }

  async getOutOfStockItems(): Promise<StockWithProduct[]> {
    return this.getLowStockItems(0);
  }

  /**
   * Trouve le prochain numéro de slot disponible pour une machine
   */
  async getNextAvailableSlotNumber(machineId: string): Promise<number> {
    const existingSlots = await this.prisma.stock.findMany({
      where: { machine_id: machineId },
      select: { slot_number: true },
      orderBy: { slot_number: 'asc' },
    });

    const usedSlots = existingSlots.map(s => s.slot_number);
    
    // Trouve le premier slot disponible de 1 à 6
    for (let i = 1; i <= 6; i++) {
      if (!usedSlots.includes(i)) {
        return i;
      }
    }
    
    throw new BadRequestException('Aucun slot disponible (maximum 6 slots par machine)');
  }

  /**
   * Ajoute un nouveau slot à une machine avec validation des contraintes
   */
  async addSlot(slotData: AddSlotInput): Promise<Stock> {
    // Vérifier que la machine existe
    const machine = await this.prisma.machine.findUnique({
      where: { id: slotData.machine_id },
    });
    if (!machine) {
      throw new NotFoundException(`Machine ${slotData.machine_id} non trouvée`);
    }

    // Vérifier que le produit existe
    const product = await this.prisma.product.findUnique({
      where: { id: slotData.product_id },
    });
    if (!product) {
      throw new NotFoundException(`Produit ${slotData.product_id} non trouvé`);
    }

    // Vérifier qu'il n'y a pas déjà 6 slots (limite maximale)
    const existingSlots = await this.prisma.stock.count({
      where: { machine_id: slotData.machine_id },
    });
    if (existingSlots >= 6) {
      throw new BadRequestException('Une machine ne peut avoir que 6 slots maximum');
    }

    // Vérifier que le numéro de slot n'est pas déjà pris
    const existingSlot = await this.prisma.stock.findFirst({
      where: {
        machine_id: slotData.machine_id,
        slot_number: slotData.slot_number,
      },
    });
    if (existingSlot) {
      throw new BadRequestException(`Le slot ${slotData.slot_number} est déjà occupé`);
    }

    // Créer le nouveau slot avec les valeurs par défaut
    const stock = await this.prisma.stock.create({
      data: {
        machine_id: slotData.machine_id,
        product_id: slotData.product_id,
        slot_number: slotData.slot_number,
        quantity: slotData.initial_quantity,
        max_capacity: 5, // Maximum 4 produits par slot
        low_threshold: 1, // Seuil bas à 1 pour tous
      },
    });

    // Mettre la machine en ONLINE si maintenant 6 slots sont configurés
    const countAfterCreate = await this.prisma.stock.count({
      where: { machine_id: slotData.machine_id },
    });

    if (countAfterCreate >= 6) {
      await this.prisma.machine.update({
        where: { id: slotData.machine_id },
        data: { status: 'ONLINE' },
      });
    }

    return this.mapStock(stock);
  }

  private mapStock = (s: any): Stock => ({
    id: s.id,
    machine_id: s.machine_id,
    product_id: s.product_id,
    quantity: s.quantity,
    slot_number: s.slot_number,
    max_capacity: s.max_capacity,
    low_threshold: s.low_threshold,
  });
}
