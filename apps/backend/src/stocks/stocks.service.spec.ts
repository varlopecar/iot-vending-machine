import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TRPCError } from '@trpc/server';

import { StocksService } from './stocks.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateStockInput, UpdateStockInput } from './stocks.schema';

describe('StocksService', () => {
  let service: StocksService;
  let prismaService: PrismaService;
  let alertsService: AlertsService;

  const mockPrismaService = {
    stock: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    machine: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    restock: {
      create: jest.fn(),
    },
    restockItem: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAlertsService = {
    updateMachineAlerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StocksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AlertsService,
          useValue: mockAlertsService,
        },
      ],
    }).compile();

    service = module.get<StocksService>(StocksService);
    prismaService = module.get<PrismaService>(PrismaService);
    alertsService = module.get<AlertsService>(AlertsService);

    jest.clearAllMocks();
  });

  describe('createStock', () => {
    const createStockDto: CreateStockInput = {
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 10,
      slot_number: 1,
      max_capacity: 20,
      low_threshold: 5,
    };

    const mockStockResult = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 10,
      slot_number: 1,
      max_capacity: 20,
      low_threshold: 5,
    };

    it('should create stock successfully', async () => {
      (mockPrismaService.stock.create as jest.Mock).mockResolvedValue(mockStockResult);

      const result = await service.createStock(createStockDto);

      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: createStockDto,
      });
      expect(result).toEqual(mockStockResult);
    });

    it('should handle creation errors', async () => {
      (mockPrismaService.stock.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(service.createStock(createStockDto)).rejects.toThrow('Creation failed');
    });
  });

  describe('getAllStocks', () => {
    const mockStocks = [
      { id: 'stock-1', machine_id: 'machine-1', product_id: 'product-1', quantity: 10, slot_number: 1, max_capacity: 20, low_threshold: 5 },
      { id: 'stock-2', machine_id: 'machine-2', product_id: 'product-2', quantity: 5, slot_number: 2, max_capacity: 15, low_threshold: 3 },
    ];

    it('should return all stocks', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue(mockStocks);

      const result = await service.getAllStocks();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockStocks.map(s => ({
        id: s.id,
        machine_id: s.machine_id,
        product_id: s.product_id,
        quantity: s.quantity,
        slot_number: s.slot_number,
        max_capacity: s.max_capacity,
        low_threshold: s.low_threshold,
      })));
    });

    it('should handle database errors', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getAllStocks()).rejects.toThrow('DB Error');
    });
  });

  describe('getStockById', () => {
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 10,
      slot_number: 1,
      max_capacity: 20,
      low_threshold: 5,
    };

    it('should return stock by id', async () => {
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      const result = await service.getStockById('stock-1');

      expect(mockPrismaService.stock.findUnique).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
      });
      expect(result).toEqual({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 10,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 5,
      });
    });

    it('should throw NotFoundException if stock not found', async () => {
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getStockById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStocksByMachine', () => {
    const mockStocksWithProduct = [
      {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 10,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 5,
        product: {
          name: 'Test Product',
          price: 2.50,
          image_url: '/test.jpg',
          ingredients_list: ['ingredient1'],
          allergens_list: ['allergen1'],
        },
      },
    ];

    it('should return stocks by machine with product details', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue(mockStocksWithProduct);

      const result = await service.getStocksByMachine('machine-1');

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { machine_id: 'machine-1' },
        include: { product: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('product_name', 'Test Product');
    });

    it('should return empty array for machine with no stocks', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getStocksByMachine('machine-no-stocks');

      expect(result).toEqual([]);
    });
  });

  describe('updateStock', () => {
    const updateStockDto: UpdateStockInput = {
      quantity: 15,
    };

    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      quantity: 10,
      max_capacity: 20,
    };

    it('should update stock successfully', async () => {
      const updatedStock = { ...mockStock, quantity: 15 };
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (mockPrismaService.stock.update as jest.Mock).mockResolvedValue(updatedStock);
      (mockAlertsService.updateMachineAlerts as jest.Mock).mockResolvedValue(undefined);

      const result = await service.updateStock('stock-1', updateStockDto);

      // Le service utilise une transaction pour les mises à jour de quantité
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if stock not found', async () => {
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updateStock('non-existent', updateStockDto)).rejects.toThrow(NotFoundException);
    });

    it('should validate quantity against max capacity', async () => {
      const invalidDto = { quantity: 25 };
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      await expect(service.updateStock('stock-1', invalidDto)).rejects.toThrow(TRPCError);
    });
  });

  describe('addStockQuantity', () => {
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      quantity: 10,
      max_capacity: 20,
    };

    it('should add stock quantity successfully', async () => {
      const updatedStock = { ...mockStock, quantity: 15 };
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (mockPrismaService.stock.update as jest.Mock).mockResolvedValue(updatedStock);
      (mockAlertsService.updateMachineAlerts as jest.Mock).mockResolvedValue(undefined);

      const result = await service.addStockQuantity('stock-1', 5);

      expect(result).toBeDefined();
    });

    it('should throw error if exceeds max capacity', async () => {
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      await expect(service.addStockQuantity('stock-1', 15)).rejects.toThrow(TRPCError);
    });
  });

  describe('removeStockQuantity', () => {
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      quantity: 10,
      max_capacity: 20,
    };

    it('should remove stock quantity successfully', async () => {
      const updatedStock = { ...mockStock, quantity: 5 };
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);
      (mockPrismaService.stock.update as jest.Mock).mockResolvedValue(updatedStock);
      (mockAlertsService.updateMachineAlerts as jest.Mock).mockResolvedValue(undefined);

      const result = await service.removeStockQuantity('stock-1', 5);

      expect(result).toBeDefined();
    });

    it('should not allow negative stock', async () => {
      (mockPrismaService.stock.findUnique as jest.Mock).mockResolvedValue(mockStock);

      await expect(service.removeStockQuantity('stock-1', 15)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('getLowStockItems', () => {
    const mockLowStockItems = [
      {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 3,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 5,
        product: {
          name: 'Low Stock Product',
          price: 2.50,
          image_url: '/test.jpg',
          ingredients_list: [],
          allergens_list: [],
        },
      },
    ];

    it('should return low stock items', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue(mockLowStockItems);

      const result = await service.getLowStockItems();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 5 } },
        include: { product: true },
      });
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no low stock items', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getLowStockItems();

      expect(result).toEqual([]);
    });
  });

  describe('getOutOfStockItems', () => {
    const mockOutOfStockItems = [
      {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 0,
        slot_number: 1,
        max_capacity: 20,
        low_threshold: 5,
        product: {
          name: 'Out of Stock Product',
          price: 2.50,
          image_url: '/test.jpg',
          ingredients_list: [],
          allergens_list: [],
        },
      },
    ];

    it('should return out of stock items', async () => {
      (mockPrismaService.stock.findMany as jest.Mock).mockResolvedValue(mockOutOfStockItems);

      const result = await service.getOutOfStockItems();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 0 } },
        include: { product: true },
      });
      expect(result).toHaveLength(1);
    });
  });
});
