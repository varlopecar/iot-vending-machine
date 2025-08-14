import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateStockInput,
  UpdateStockInput,
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
      const stock = await this.prisma.stock.update({
        where: { id },
        data: updateData,
      });
      return this.mapStock(stock);
    } catch {
      throw new NotFoundException('Stock not found');
    }
  }

  async updateStockQuantity(id: string, quantity: number): Promise<Stock> {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }
    return this.updateStock(id, { quantity });
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

  private mapStock = (s: any): Stock => ({
    id: s.id,
    machine_id: s.machine_id,
    product_id: s.product_id,
    quantity: s.quantity,
    slot_number: s.slot_number,
  });
}
