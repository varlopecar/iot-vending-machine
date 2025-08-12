import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductInput,
  UpdateProductInput,
  Product,
} from './products.schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(productData: CreateProductInput): Promise<Product> {
    const product = await this.prisma.product.create({
      data: productData,
    });
    return this.mapProduct(product);
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.mapProduct(product);
  }

  async updateProduct(
    id: string,
    updateData: UpdateProductInput,
  ): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
      return this.mapProduct(product);
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      await this.prisma.product.update({
        where: { id },
        data: { is_active: false },
      });
      return true;
    } catch {
      throw new NotFoundException('Product not found');
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: {
        is_active: true,
        name: { contains: category, mode: 'insensitive' },
      },
      orderBy: { name: 'asc' },
    });
    return products.map(this.mapProduct);
  }

  private mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    ingredients: p.ingredients,
    allergens: p.allergens,
    nutritional_value: p.nutritional_value,
    image_url: p.image_url,
    is_active: p.is_active,
  });
}
