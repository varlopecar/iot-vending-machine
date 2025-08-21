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
      data: {
        name: productData.name,
        category: productData.category,
        price: productData.price,
        purchase_price: productData.purchase_price,
        // Champs non gérés pour l'instant
        description: '',
        ingredients: '',
        ingredients_list: [], // Liste vide par défaut
        allergens: productData.allergens_list?.join(', ') ?? '',
        nutritional_value:
          productData.nutritional?.calories && productData.nutritional?.serving
            ? `${productData.nutritional.calories} kcal pour ${productData.nutritional.serving}`
            : '',
        image_url: '/assets/images/coca.png', // Image par défaut locale
        // Optionnels
        allergens_list: productData.allergens_list ?? [],
        nutritional: productData.nutritional ?? undefined,
      },
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

  async getAllProductsWithStats(): Promise<
    Array<Product & { soldCount: number }>
  > {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    // Récupérer les statistiques de vente pour chaque produit
    const productStats = await Promise.all(
      products.map(async (product) => {
        const soldCount = await this.prisma.orderItem.aggregate({
          where: {
            product_id: product.id,
            order: {
              status: 'COMPLETED', // Seulement les commandes complétées
            },
          },
          _sum: {
            quantity: true,
          },
        });

        return {
          ...this.mapProduct(product),
          soldCount: soldCount._sum.quantity || 0,
        };
      }),
    );

    return productStats;
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
      // Préparer les données comme dans createProduct
      const dataToUpdate: any = { ...updateData };

      // Générer nutritional_value si nutritional est fourni
      if (updateData.nutritional) {
        dataToUpdate.nutritional_value =
          updateData.nutritional.calories && updateData.nutritional.serving
            ? `${updateData.nutritional.calories} kcal pour ${updateData.nutritional.serving}`
            : '';
      }

      // Générer allergens si allergens_list est fourni
      if (updateData.allergens_list) {
        dataToUpdate.allergens = updateData.allergens_list.join(', ');
      }

      const product = await this.prisma.product.update({
        where: { id },
        data: dataToUpdate,
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
    name: p.name || '',
    description: p.description || '',
    price: p.price ? Number(p.price) : 0,
    purchase_price: p.purchase_price ? Number(p.purchase_price) : 0,
    category: p.category || 'Autres',
    ingredients: p.ingredients || '',
    ingredients_list: p.ingredients_list || [],
    allergens: p.allergens || '',
    allergens_list: p.allergens_list || [],
    nutritional_value: p.nutritional_value || '',
    nutritional: p.nutritional || undefined,
    image_url: p.image_url || '/assets/images/coca.png',
    is_active: p.is_active ?? true,
  });
}
