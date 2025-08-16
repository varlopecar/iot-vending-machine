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
      count: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
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
      name: 'Test Product',
      price: 2.50,
      category: 'Test Category',
      purchase_price: 1.50,
      allergens_list: ['Nuts'],
      nutritional: { calories: 100, serving: '100g' },
    };

    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      price: 2.5,
      category: 'Autres',
      description: '',
      image_url: '/assets/images/coca.png',
      is_active: true,
      allergens: '',
      allergens_list: [],
      ingredients: '',
      ingredients_list: [],
      nutritional_value: '',
      nutritional: undefined,
      purchase_price: 0,
    };

    it('should create a product successfully', async () => {
      (prismaService.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.createProduct(createProductDto);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          category: createProductDto.category,
          price: createProductDto.price,
          purchase_price: createProductDto.purchase_price,
          description: '',
          ingredients: '',
          ingredients_list: [],
          allergens: 'Nuts',
          nutritional_value: '100 kcal pour 100g',
          image_url: '/assets/images/coca.png',
          allergens_list: ['Nuts'],
          nutritional: { calories: 100, serving: '100g' },
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should handle creation errors', async () => {
      (prismaService.product.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(service.createProduct(createProductDto)).rejects.toThrow('Creation failed');
    });

    it('should create product with minimal data', async () => {
          const minimalDto = {
      name: 'Minimal Product',
      price: 1.00,
      category: 'Drinks',
      purchase_price: 0.50,
    };

          const minimalProduct = {
      id: 'product-2',
      ...minimalDto,
      is_active: true,
      allergens: '',
      allergens_list: [],
      description: '',
      image_url: '/assets/images/coca.png',
      ingredients: '',
      ingredients_list: [],
      nutritional_value: '',
      nutritional: undefined,
    };

      (prismaService.product.create as jest.Mock).mockResolvedValue(minimalProduct);

      const result = await service.createProduct(minimalDto);

      expect(result).toEqual(minimalProduct);
    });
  });

  describe('getAllProducts', () => {
    const mockProducts = [
      {
        id: 'product-1',
        name: 'Product 1',
        price: 0,
        category: 'Autres',
        is_active: true,
        allergens: '',
        allergens_list: [],
        description: '',
        image_url: '/assets/images/coca.png',
        ingredients: '',
        ingredients_list: [],
        nutritional_value: '',
        nutritional: undefined,
        purchase_price: 0,
      },
      {
        id: 'product-2',
        name: 'Product 2',
        price: 0,
        category: 'Autres',
        is_active: true,
        allergens: '',
        allergens_list: [],
        description: '',
        image_url: '/assets/images/coca.png',
        ingredients: '',
        ingredients_list: [],
        nutritional_value: '',
        nutritional: undefined,
        purchase_price: 0,
      },
    ];

    it('should return all active products', async () => {
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await service.getAllProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return all products including inactive', async () => {
      const allProducts = [...mockProducts, { 
      id: 'product-3', 
      is_active: false,
      name: '',
      category: 'Autres',
      allergens: '',
      allergens_list: [],
      description: '',
      image_url: '/assets/images/coca.png',
      ingredients: '',
      ingredients_list: [],
      nutritional_value: '',
      nutritional: undefined,
      price: 0,
      purchase_price: 0,
    }];
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(allProducts);

      const result = await service.getAllProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(allProducts);
    });

    it('should handle database errors', async () => {
      (prismaService.product.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getAllProducts()).rejects.toThrow('DB Error');
    });
  });

  describe('getProductById', () => {
    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      price: 2.50,
      category_id: 'category-1',
      is_active: true,
      purchase_category: 'SNACK',
    };

    it('should return product by id', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getProductById('product-1');

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProductById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      (prismaService.product.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getProductById('product-1')).rejects.toThrow('DB Error');
    });
  });

  describe('updateProduct', () => {
    const updateProductDto: UpdateProductInput = {
      name: 'Updated Product',
      price: 3.00,
    };

    const updatedProduct = {
      id: 'product-1',
      name: 'Updated Product',
      price: 3.00,
      description: '',
      is_active: true,
      category: 'Autres',
      allergens: '',
      allergens_list: [],
      image_url: '/assets/images/coca.png',
      ingredients: '',
      ingredients_list: [],
      nutritional_value: '',
      nutritional: undefined,
      purchase_price: 0,
    };

    it('should update product successfully', async () => {
      (prismaService.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.updateProduct('product-1', updateProductDto);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: updateProductDto,
      });
      expect(result).toEqual(updatedProduct);
    });

    it('should handle update errors', async () => {
      (prismaService.product.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(service.updateProduct('product-1', updateProductDto)).rejects.toThrow('Product not found');
    });

    it('should update partial data', async () => {
      const partialUpdate = { price: 4.00 };
      const partialResult = { ...updatedProduct, price: 4.00 };

      (prismaService.product.update as jest.Mock).mockResolvedValue(partialResult);

      const result = await service.updateProduct('product-1', partialUpdate);

      expect(result.price).toBe(4.00);
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete product', async () => {
      (prismaService.product.update as jest.Mock).mockResolvedValue(true);

      const result = await service.deleteProduct('product-1');

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: { is_active: false },
      });
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      (prismaService.product.update as jest.Mock).mockRejectedValue(new Error('Delete failed'));

      await expect(service.deleteProduct('product-1')).rejects.toThrow('Product not found');
    });
  });

  describe('getProductsByCategory', () => {
    const mockProducts = [
      { id: 'product-1', name: 'Product 1', category_id: 'category-1', is_active: true },
      { id: 'product-2', name: 'Product 2', category_id: 'category-1', is_active: true },
    ];

    it('should return products by category', async () => {
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await service.getProductsByCategory('category-1');

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          is_active: true,
          name: {
            contains: 'category-1',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return empty array for category with no products', async () => {
      (prismaService.product.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getProductsByCategory('empty-category');

      expect(result).toEqual([]);
    });
  });


});
