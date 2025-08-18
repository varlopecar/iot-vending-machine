import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductInput, UpdateProductInput } from './products.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    orderItem: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    const createProductDto: CreateProductInput = {
      name: 'Coca-Cola',
      category: 'Boissons',
      price: 1.5,
      purchase_price: 0.8,
      allergens_list: ['Aucun'],
      nutritional: {
        calories: 140,
        protein: 0,
        carbs: 39,
        fat: 0,
      },
    };

    const mockCreatedProduct = {
      id: 'product-1',
      name: 'Coca-Cola',
      category: 'Boissons',
      price: 1.5,
      purchase_price: 0.8,
      description: '',
      ingredients: '',
      ingredients_list: [],
      allergens: '',
      allergens_list: ['Aucun'],
      nutritional_value: '',
      nutritional: createProductDto.nutritional,
      image_url: '/assets/images/coca.png',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    it('should create a product successfully', async () => {
      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.createProduct(createProductDto);

      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          category: createProductDto.category,
          price: createProductDto.price,
          purchase_price: createProductDto.purchase_price,
          description: '',
          ingredients: '',
          ingredients_list: [],
          allergens: 'Aucun',
          nutritional_value: '',
          image_url: '/assets/images/coca.png',
          allergens_list: createProductDto.allergens_list,
          nutritional: createProductDto.nutritional,
        },
      });

      expect(result).toEqual({
        id: mockCreatedProduct.id,
        name: mockCreatedProduct.name,
        description: '',
        price: mockCreatedProduct.price,
        purchase_price: mockCreatedProduct.purchase_price,
        category: mockCreatedProduct.category,
        ingredients: '',
        ingredients_list: [],
        allergens: '',
        allergens_list: mockCreatedProduct.allergens_list,
        nutritional_value: '',
        nutritional: mockCreatedProduct.nutritional,
        image_url: '/assets/images/coca.png',
        is_active: true,
      });
    });
  });

  describe('getAllProducts', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Coca-Cola',
        description: 'Boisson gazeuse',
        price: 1.5,
        purchase_price: 0.8,
        category: 'Boissons',
        ingredients: 'Eau, sucre',
        ingredients_list: ['Eau', 'Sucre'],
        allergens: 'Aucun',
        allergens_list: [],
        nutritional_value: 'Calories: 140',
        nutritional: { calories: 140, protein: 0, carbs: 39, fat: 0 },
        image_url: 'coca.jpg',
        is_active: true,
      },
    ];

    it('should return all active products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getAllProducts();

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockProducts[0].id,
        name: mockProducts[0].name,
        description: mockProducts[0].description,
        price: mockProducts[0].price,
        purchase_price: mockProducts[0].purchase_price,
        category: mockProducts[0].category,
        ingredients: mockProducts[0].ingredients,
        ingredients_list: mockProducts[0].ingredients_list,
        allergens: mockProducts[0].allergens,
        allergens_list: mockProducts[0].allergens_list,
        nutritional_value: mockProducts[0].nutritional_value,
        nutritional: mockProducts[0].nutritional,
        image_url: mockProducts[0].image_url,
        is_active: mockProducts[0].is_active,
      });
    });

    it('should return empty array when no products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.getAllProducts();

      expect(result).toEqual([]);
    });
  });

  describe('getAllProductsWithStats', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Coca-Cola',
        description: 'Boisson gazeuse',
        price: 1.5,
        purchase_price: 0.8,
        category: 'Boissons',
        ingredients: 'Eau, sucre',
        ingredients_list: ['Eau', 'Sucre'],
        allergens: 'Aucun',
        allergens_list: [],
        nutritional_value: 'Calories: 140',
        nutritional: { calories: 140, protein: 0, carbs: 39, fat: 0 },
        image_url: 'coca.jpg',
        is_active: true,
      },
    ];

    it('should return products with sales statistics', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.orderItem.aggregate.mockResolvedValue({
        _sum: { quantity: 50 }
      });

      const result = await service.getAllProductsWithStats();

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
      expect(mockPrismaService.orderItem.aggregate).toHaveBeenCalledWith({
        where: {
          product_id: 'product-1',
          order: {
            status: 'COMPLETED'
          }
        },
        _sum: {
          quantity: true
        }
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('soldCount', 50);
    });

    it('should handle products with no sales', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.orderItem.aggregate.mockResolvedValue({
        _sum: { quantity: null }
      });

      const result = await service.getAllProductsWithStats();

      expect(result[0]).toHaveProperty('soldCount', 0);
    });
  });

  describe('getProductById', () => {
    const productId = 'product-1';
    const mockProduct = {
      id: 'product-1',
      name: 'Coca-Cola',
      description: 'Boisson gazeuse',
      price: 1.5,
      purchase_price: 0.8,
      category: 'Boissons',
      ingredients: 'Eau, sucre',
      ingredients_list: ['Eau', 'Sucre'],
      allergens: 'Aucun',
      allergens_list: [],
      nutritional_value: 'Calories: 140',
      nutritional: { calories: 140, protein: 0, carbs: 39, fat: 0 },
      image_url: 'coca.jpg',
      is_active: true,
    };

    it('should return product by id', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getProductById(productId);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        purchase_price: mockProduct.purchase_price,
        category: mockProduct.category,
        ingredients: mockProduct.ingredients,
        ingredients_list: mockProduct.ingredients_list,
        allergens: mockProduct.allergens,
        allergens_list: mockProduct.allergens_list,
        nutritional_value: mockProduct.nutritional_value,
        nutritional: mockProduct.nutritional,
        image_url: mockProduct.image_url,
        is_active: mockProduct.is_active,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getProductById(productId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('getProductsByCategory', () => {
    const category = 'Boissons';
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Coca-Cola',
        category: 'Boissons',
        price: 1.5,
        is_active: true,
        description: 'Boisson gazeuse',
        purchase_price: 0.8,
        ingredients: 'Eau, sucre',
        ingredients_list: ['Eau', 'Sucre'],
        allergens: 'Aucun',
        allergens_list: [],
        nutritional_value: 'Calories: 140',
        nutritional: null,
        image_url: 'coca.jpg',
      },
    ];

    it('should return products by category search', async () => {
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getProductsByCategory(category);

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          is_active: true,
          name: { contains: category, mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array for category with no products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([]);

      const result = await service.getProductsByCategory('NonExistentCategory');

      expect(result).toEqual([]);
    });
  });

  describe('updateProduct', () => {
    const productId = 'product-1';
    const updateDto: UpdateProductInput = {
      name: 'Coca-Cola Updated',
      price: 1.6,
    };

    const mockUpdatedProduct = {
      id: 'product-1',
      name: 'Coca-Cola Updated',
      description: 'Boisson gazeuse',
      price: 1.6,
      purchase_price: 0.8,
      category: 'Boissons',
      ingredients: 'Eau, sucre',
      ingredients_list: ['Eau', 'Sucre'],
      allergens: 'Aucun',
      allergens_list: [],
      nutritional_value: 'Calories: 140',
      nutritional: { calories: 140, protein: 0, carbs: 39, fat: 0 },
      image_url: 'coca.jpg',
      is_active: true,
    };

    it('should update product successfully', async () => {
      mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await service.updateProduct(productId, updateDto);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: updateDto,
      });
      expect(result).toEqual({
        id: mockUpdatedProduct.id,
        name: mockUpdatedProduct.name,
        description: mockUpdatedProduct.description,
        price: mockUpdatedProduct.price,
        purchase_price: mockUpdatedProduct.purchase_price,
        category: mockUpdatedProduct.category,
        ingredients: mockUpdatedProduct.ingredients,
        ingredients_list: mockUpdatedProduct.ingredients_list,
        allergens: mockUpdatedProduct.allergens,
        allergens_list: mockUpdatedProduct.allergens_list,
        nutritional_value: mockUpdatedProduct.nutritional_value,
        nutritional: mockUpdatedProduct.nutritional,
        image_url: mockUpdatedProduct.image_url,
        is_active: mockUpdatedProduct.is_active,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.update.mockRejectedValue(new Error('Product not found'));

      await expect(service.updateProduct('non-existent-id', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProduct', () => {
    const productId = 'product-1';

    it('should soft delete product successfully', async () => {
      mockPrismaService.product.update.mockResolvedValue({ id: productId, is_active: false });

      const result = await service.deleteProduct(productId);

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { is_active: false },
      });
      expect(result).toBe(true);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrismaService.product.update.mockRejectedValue(new Error('Product not found'));

      await expect(service.deleteProduct('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});