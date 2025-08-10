import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductInput,
  UpdateProductInput,
  Product,
} from './products.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  private products: Product[] = [];

  createProduct(productData: CreateProductInput): Product {
    const product: Product = {
      id: randomUUID(),
      ...productData,
    };

    this.products.push(product);
    return product;
  }

  getAllProducts(): Product[] {
    return this.products.filter((product) => product.is_active);
  }

  getProductById(id: string): Product {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  updateProduct(id: string, updateData: UpdateProductInput): Product {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException('Product not found');
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateData,
    };

    return this.products[productIndex];
  }

  deleteProduct(id: string): boolean {
    const productIndex = this.products.findIndex((p) => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete by setting is_active to false
    this.products[productIndex].is_active = false;
    return true;
  }

  getProductsByCategory(category: string): Product[] {
    return this.products.filter(
      (product) =>
        product.is_active &&
        product.name.toLowerCase().includes(category.toLowerCase()),
    );
  }
}
