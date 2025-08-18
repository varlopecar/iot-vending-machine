import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    machine: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
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
      max_capacity: 15,
      low_threshold: 3,
    };

    const mockStock = {
      id: 'stock-1',
      ...createStockDto,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should create stock successfully', async () => {
      mockPrismaService.stock.create.mockResolvedValue(mockStock);

      const result = await service.createStock(createStockDto);

      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: createStockDto,
      });
      expect(result).toEqual({
        id: mockStock.id,
        machine_id: mockStock.machine_id,
        product_id: mockStock.product_id,
        quantity: mockStock.quantity,
        slot_number: mockStock.slot_number,
        max_capacity: mockStock.max_capacity,
        low_threshold: mockStock.low_threshold,
      });
    });
  });

  describe('getAllStocks', () => {
    const mockStocks = [
      {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 8,
        slot_number: 1,
        max_capacity: 15,
        low_threshold: 3,
      },
      {
        id: 'stock-2',
        machine_id: 'machine-1',
        product_id: 'product-2',
        quantity: 2,
        slot_number: 2,
        max_capacity: 10,
        low_threshold: 3,
      },
    ];

    it('should return all stocks', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue(mockStocks);

      const result = await service.getAllStocks();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockStocks[0].id,
        machine_id: mockStocks[0].machine_id,
        product_id: mockStocks[0].product_id,
        quantity: mockStocks[0].quantity,
        slot_number: mockStocks[0].slot_number,
        max_capacity: mockStocks[0].max_capacity,
        low_threshold: mockStocks[0].low_threshold,
      });
    });
  });

  describe('getStockById', () => {
    const stockId = 'stock-1';
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 8,
      slot_number: 1,
      max_capacity: 15,
      low_threshold: 3,
    };

    it('should return stock by id', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      const result = await service.getStockById(stockId);

      expect(mockPrismaService.stock.findUnique).toHaveBeenCalledWith({
        where: { id: stockId },
      });
      expect(result).toEqual({
        id: mockStock.id,
        machine_id: mockStock.machine_id,
        product_id: mockStock.product_id,
        quantity: mockStock.quantity,
        slot_number: mockStock.slot_number,
        max_capacity: mockStock.max_capacity,
        low_threshold: mockStock.low_threshold,
      });
    });

    it('should throw NotFoundException if stock not found', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(null);

      await expect(service.getStockById(stockId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stock.findUnique).toHaveBeenCalledWith({
        where: { id: stockId },
      });
    });
  });

  describe('getStocksByMachine', () => {
    const machineId = 'machine-1';
    const mockStocksWithProduct = [
      {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 8,
        slot_number: 1,
        max_capacity: 15,
        low_threshold: 3,
        product: {
          id: 'product-1',
          name: 'Coca-Cola',
          price: 1.5,
          image_url: 'coca.jpg',
          ingredients_list: ['Eau', 'Sucre'],
          allergens_list: [],
          nutritional: { calories: 140, protein: 0, carbs: 39, fat: 0 },
        },
      },
    ];

    it('should return stocks with product details for a machine', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue(mockStocksWithProduct);

      const result = await service.getStocksByMachine(machineId);

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { machine_id: machineId },
        include: { product: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockStocksWithProduct[0].id,
        machine_id: mockStocksWithProduct[0].machine_id,
        product_id: mockStocksWithProduct[0].product_id,
        quantity: mockStocksWithProduct[0].quantity,
        slot_number: mockStocksWithProduct[0].slot_number,
        max_capacity: mockStocksWithProduct[0].max_capacity,
        low_threshold: mockStocksWithProduct[0].low_threshold,
        product_name: mockStocksWithProduct[0].product.name,
        product_price: mockStocksWithProduct[0].product.price,
        product_image_url: mockStocksWithProduct[0].product.image_url,
        product_ingredients_list: mockStocksWithProduct[0].product.ingredients_list,
        product_allergens_list: mockStocksWithProduct[0].product.allergens_list,
        product_nutritional: mockStocksWithProduct[0].product.nutritional,
      });
    });

    it('should return empty array for machine with no stocks', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([]);

      const result = await service.getStocksByMachine('empty-machine');

      expect(result).toEqual([]);
    });
  });

  describe('updateStock', () => {
    const stockId = 'stock-1';
    const updateDto: UpdateStockInput = {
      low_threshold: 2,
    };

    const mockUpdatedStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 10,
      slot_number: 1,
      max_capacity: 15,
      low_threshold: 2,
    };

    it('should update stock successfully', async () => {
      mockPrismaService.stock.update.mockResolvedValue(mockUpdatedStock);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateStock(stockId, updateDto);

      expect(mockPrismaService.stock.update).toHaveBeenCalledWith({
        where: { id: stockId },
        data: updateDto,
      });
      expect(mockAlertsService.updateMachineAlerts).toHaveBeenCalledWith(
        mockUpdatedStock.machine_id
      );
      expect(result).toEqual({
        id: mockUpdatedStock.id,
        machine_id: mockUpdatedStock.machine_id,
        product_id: mockUpdatedStock.product_id,
        quantity: mockUpdatedStock.quantity,
        slot_number: mockUpdatedStock.slot_number,
        max_capacity: mockUpdatedStock.max_capacity,
        low_threshold: mockUpdatedStock.low_threshold,
      });
    });

    it('should handle alerts service errors gracefully', async () => {
      mockPrismaService.stock.update.mockResolvedValue(mockUpdatedStock);
      mockAlertsService.updateMachineAlerts.mockRejectedValue(new Error('Alert service error'));

      const result = await service.updateStock(stockId, updateDto);

      expect(result).toEqual({
        id: mockUpdatedStock.id,
        machine_id: mockUpdatedStock.machine_id,
        product_id: mockUpdatedStock.product_id,
        quantity: mockUpdatedStock.quantity,
        slot_number: mockUpdatedStock.slot_number,
        max_capacity: mockUpdatedStock.max_capacity,
        low_threshold: mockUpdatedStock.low_threshold,
      });
    });
  });

  describe('updateStockQuantity', () => {
    const stockId = 'stock-1';
    const quantity = 12;

    const mockCurrentStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 8,
      slot_number: 1,
      max_capacity: 15,
      low_threshold: 3,
    };

    const mockUpdatedStock = {
      ...mockCurrentStock,
      quantity: 12,
    };

    it('should update stock quantity successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockCurrentStock);
      mockPrismaService.stock.update.mockResolvedValue(mockUpdatedStock);
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateStockQuantity(stockId, quantity);

      expect(mockPrismaService.stock.findUnique).toHaveBeenCalledWith({
        where: { id: stockId },
      });
      expect(mockPrismaService.stock.update).toHaveBeenCalledWith({
        where: { id: stockId },
        data: { quantity },
      });
      expect(result.quantity).toBe(quantity);
    });

    it('should throw BadRequestException for negative quantity', async () => {
      await expect(service.updateStockQuantity(stockId, -1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if stock not found', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(null);

      await expect(service.updateStockQuantity(stockId, quantity)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addStockQuantity', () => {
    const stockId = 'stock-1';
    const addQuantity = 5;

    const mockCurrentStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 8,
      slot_number: 1,
      max_capacity: 15,
      low_threshold: 3,
    };

    it('should add stock quantity successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValueOnce(mockCurrentStock); // For getStockById
      mockPrismaService.stock.findUnique.mockResolvedValueOnce(mockCurrentStock); // For updateStockQuantity
      mockPrismaService.stock.update.mockResolvedValue({
        ...mockCurrentStock,
        quantity: 13,
      });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.addStockQuantity(stockId, addQuantity);

      expect(result.quantity).toBe(13);
    });
  });

  describe('removeStockQuantity', () => {
    const stockId = 'stock-1';
    const removeQuantity = 3;

    const mockCurrentStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 8,
      slot_number: 1,
      max_capacity: 15,
      low_threshold: 3,
    };

    it('should remove stock quantity successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValueOnce(mockCurrentStock); // For getStockById
      mockPrismaService.stock.findUnique.mockResolvedValueOnce(mockCurrentStock); // For updateStockQuantity
      mockPrismaService.stock.update.mockResolvedValue({
        ...mockCurrentStock,
        quantity: 5,
      });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.removeStockQuantity(stockId, removeQuantity);

      expect(result.quantity).toBe(5);
    });

    it('should throw error for insufficient stock', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockCurrentStock);

      await expect(service.removeStockQuantity(stockId, 10)).rejects.toThrow('Insufficient stock');
    });
  });

  describe('getLowStockItems', () => {
    const threshold = 5;
    const mockLowStocksWithProduct = [
      {
        id: 'stock-2',
        machine_id: 'machine-1',
        product_id: 'product-2',
        quantity: 2,
        slot_number: 2,
        max_capacity: 10,
        low_threshold: 3,
        product: {
          id: 'product-2',
          name: 'Chips',
          price: 2.0,
          image_url: 'chips.jpg',
          ingredients_list: ['Pommes de terre', 'Huile'],
          allergens_list: ['Gluten'],
          nutritional: undefined,
        },
      },
    ];

    it('should return low stock items', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue(mockLowStocksWithProduct);

      const result = await service.getLowStockItems(threshold);

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: threshold } },
        include: { product: true },
      });
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBeLessThanOrEqual(threshold);
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return out of stock items', async () => {
      const mockOutOfStockItems = [];
      mockPrismaService.stock.findMany.mockResolvedValue(mockOutOfStockItems);

      const result = await service.getOutOfStockItems();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 0 } },
        include: { product: true },
      });
      expect(result).toEqual([]);
    });
  });

  describe('getNextAvailableSlotNumber', () => {
    const machineId = 'machine-1';

    it('should return next available slot number', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([
        { slot_number: 1 },
        { slot_number: 3 },
        { slot_number: 5 },
      ]);

      const result = await service.getNextAvailableSlotNumber(machineId);

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { machine_id: machineId },
        select: { slot_number: true },
        orderBy: { slot_number: 'asc' },
      });
      expect(result).toBe(2); // First available slot
    });

    it('should throw BadRequestException when no slots available', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([
        { slot_number: 1 },
        { slot_number: 2 },
        { slot_number: 3 },
        { slot_number: 4 },
        { slot_number: 5 },
        { slot_number: 6 },
      ]);

      await expect(service.getNextAvailableSlotNumber(machineId)).rejects.toThrow(BadRequestException);
    });
  });
});