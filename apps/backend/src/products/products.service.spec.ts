import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockProduct = {
    id: 'product-1',
    name: 'Test Product',
    description: 'A test product',
    price: 1.25,
    purchase_price: 0.75,
    category: 'SNACKS',
    image_url: 'https://example.com/image.jpg',
    nutritional: {
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
    },
    allergens_list: ['nuts', 'dairy'],
    ingredients_list: [],
    is_active: true,
    allergens: '',
    ingredients: '',
    nutritional_value: '',
  };

  beforeEach(async () => {
    const mockPrismaService = {
      product: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
    };

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
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createProductDto = {
        name: 'New Product',
        category: 'BEVERAGES',
        price: 2.50,
        purchase_price: 1.50,
        allergens_list: ['gluten'],
        nutritional: {
          calories: 150,
          protein: 8,
          carbs: 20,
          fat: 5,
        },
      };

      (prismaService.product.create as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.createProduct(createProductDto);

      expect(prismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createProductDto,
          allergens: 'gluten',
          description: '',
          image_url: '/assets/images/coca.png',
          ingredients: '',
          ingredients_list: [],
          nutritional_value: '',
        },
      });
      expect(result).toEqual(mockProduct);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const mockProducts = [mockProduct];
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await service.getAllProducts();

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await service.getProductById('product-1');

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'product-1' },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw error if product not found', async () => {
      (prismaService.product.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getProductById('nonexistent')).rejects.toThrow('Product not found');
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        price: 3.00,
      };

      const updatedProduct = { ...mockProduct, ...updateProductDto };
      (prismaService.product.update as jest.Mock).mockResolvedValue(updatedProduct);

      const result = await service.updateProduct('product-1', updateProductDto);

      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'product-1' },
        data: updateProductDto,
      });
      expect(result).toEqual(updatedProduct);
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
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [mockProduct];
      (prismaService.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await service.getProductsByCategory('SNACKS');

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          is_active: true,
          name: {
            contains: 'SNACKS',
            mode: 'insensitive',
          },
        },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockProducts);
    });
  });
});
