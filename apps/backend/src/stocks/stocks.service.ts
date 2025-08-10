import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateStockInput,
  UpdateStockInput,
  Stock,
  StockWithProduct,
} from './stocks.schema';
import { ProductsService } from '../products/products.service';
import { randomUUID } from 'crypto';

@Injectable()
export class StocksService {
  private stocks: Stock[] = [];

  constructor(private readonly productsService: ProductsService) {}

  createStock(stockData: CreateStockInput): Stock {
    const stock: Stock = {
      id: randomUUID(),
      ...stockData,
    };

    this.stocks.push(stock);
    return stock;
  }

  getAllStocks(): Stock[] {
    return this.stocks;
  }

  getStockById(id: string): Stock {
    const stock = this.stocks.find((s) => s.id === id);
    if (!stock) {
      throw new NotFoundException('Stock not found');
    }
    return stock;
  }

  getStocksByMachine(machineId: string): StockWithProduct[] {
    const machineStocks = this.stocks.filter((s) => s.machine_id === machineId);
    const stocksWithProducts: StockWithProduct[] = [];

    for (const stock of machineStocks) {
      const product = this.productsService.getProductById(stock.product_id);
      stocksWithProducts.push({
        ...stock,
        product_name: product.name,
        product_price: product.price,
      });
    }

    return stocksWithProducts;
  }

  getStockByMachineAndProduct(
    machineId: string,
    productId: string,
  ): Stock | null {
    return (
      this.stocks.find(
        (s) => s.machine_id === machineId && s.product_id === productId,
      ) || null
    );
  }

  updateStock(id: string, updateData: UpdateStockInput): Stock {
    const stockIndex = this.stocks.findIndex((s) => s.id === id);
    if (stockIndex === -1) {
      throw new NotFoundException('Stock not found');
    }

    this.stocks[stockIndex] = {
      ...this.stocks[stockIndex],
      ...updateData,
    };

    return this.stocks[stockIndex];
  }

  updateStockQuantity(id: string, quantity: number): Stock {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative');
    }

    return this.updateStock(id, { quantity });
  }

  addStockQuantity(id: string, quantity: number): Stock {
    const stock = this.getStockById(id);
    return this.updateStockQuantity(id, stock.quantity + quantity);
  }

  removeStockQuantity(id: string, quantity: number): Stock {
    const stock = this.getStockById(id);
    if (stock.quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    return this.updateStockQuantity(id, stock.quantity - quantity);
  }

  getLowStockItems(threshold: number = 5): StockWithProduct[] {
    const lowStockItems = this.stocks.filter((s) => s.quantity <= threshold);
    const stocksWithProducts: StockWithProduct[] = [];

    for (const stock of lowStockItems) {
      const product = this.productsService.getProductById(stock.product_id);
      stocksWithProducts.push({
        ...stock,
        product_name: product.name,
        product_price: product.price,
      });
    }

    return stocksWithProducts;
  }

  getOutOfStockItems(): StockWithProduct[] {
    return this.getLowStockItems(0);
  }
}
