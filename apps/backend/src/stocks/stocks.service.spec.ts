import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TRPCError } from '@trpc/server';

import { StocksService } from './stocks.service';
import { PrismaService } from '../prisma/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { CreateStockInput, UpdateStockInput, AddSlotInput } from './stocks.schema';

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

  describe('getStocksByMachine', () => {
    it('should return stocks with product details for a machine', async () => {
      const mockStocks = [
        {
          id: 'stock-1',
          machine_id: 'machine-1',
          product_id: 'product-1',
          quantity: 5,
          slot_number: 1,
          max_capacity: 10,
          low_threshold: 2,
          product: {
            name: 'Coca Cola',
            price: 2.50,
            image_url: 'coca.jpg',
            ingredients_list: ['water', 'sugar'],
            allergens_list: ['none'],
            nutritional: { calories: 150 },
          },
        },
      ];

      mockPrismaService.stock.findMany.mockResolvedValue(mockStocks);

      const result = await service.getStocksByMachine('machine-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_name: 'Coca Cola',
        product_price: 2.50,
        product_image_url: 'coca.jpg',
      });
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { machine_id: 'machine-1' },
        include: { product: true },
      });
    });
  });

  describe('getStockByMachineAndProduct', () => {
    it('should return stock for specific machine and product', async () => {
      const mockStock = {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 5,
        slot_number: 1,
        max_capacity: 10,
        low_threshold: 2,
      };

      mockPrismaService.stock.findFirst.mockResolvedValue(mockStock);

      const result = await service.getStockByMachineAndProduct('machine-1', 'product-1');

      expect(result).toMatchObject({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
      });
    });

    it('should return null if no stock found', async () => {
      mockPrismaService.stock.findFirst.mockResolvedValue(null);

      const result = await service.getStockByMachineAndProduct('machine-1', 'product-1');

      expect(result).toBeNull();
    });
  });

  describe('updateStockQuantity', () => {
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 5,
      slot_number: 1,
      max_capacity: 10,
      low_threshold: 2,
    };

    it('should update stock quantity successfully', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.stock.update.mockResolvedValue({ ...mockStock, quantity: 8 });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateStockQuantity('stock-1', 8);

      expect(result.quantity).toBe(8);
      expect(mockPrismaService.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: { quantity: 8 },
      });
      expect(mockAlertsService.updateMachineAlerts).toHaveBeenCalledWith('machine-1');
    });

    it('should throw error for negative quantity', async () => {
      await expect(service.updateStockQuantity('stock-1', -1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if stock not found', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(null);

      await expect(service.updateStockQuantity('stock-1', 8)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if quantity exceeds max capacity', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      await expect(service.updateStockQuantity('stock-1', 15)).rejects.toThrow(
        TRPCError,
      );
    });

    it('should handle alerts service error silently', async () => {
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.stock.update.mockResolvedValue({ ...mockStock, quantity: 8 });
      mockAlertsService.updateMachineAlerts.mockRejectedValue(new Error('Alerts error'));

      const result = await service.updateStockQuantity('stock-1', 8);

      expect(result.quantity).toBe(8);
    });
  });

  describe('addStockQuantity', () => {
    it('should add to existing stock quantity', async () => {
      const mockStock = {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 5,
        slot_number: 1,
        max_capacity: 10,
        low_threshold: 2,
      };

      mockPrismaService.stock.findUnique
        .mockResolvedValueOnce(mockStock) // for getStockById
        .mockResolvedValueOnce(mockStock) // for updateStockQuantity
      mockPrismaService.stock.update.mockResolvedValue({ ...mockStock, quantity: 8 });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.addStockQuantity('stock-1', 3);

      expect(result.quantity).toBe(8);
      expect(mockPrismaService.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: { quantity: 8 },
      });
    });
  });

  describe('removeStockQuantity', () => {
    it('should remove from existing stock quantity', async () => {
      const mockStock = {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 5,
        slot_number: 1,
        max_capacity: 10,
        low_threshold: 2,
      };

      mockPrismaService.stock.findUnique
        .mockResolvedValueOnce(mockStock) // for getStockById
        .mockResolvedValueOnce(mockStock) // for updateStockQuantity
      mockPrismaService.stock.update.mockResolvedValue({ ...mockStock, quantity: 2 });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.removeStockQuantity('stock-1', 3);

      expect(result.quantity).toBe(2);
    });

    it('should throw error if insufficient stock', async () => {
      const mockStock = {
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        quantity: 2,
        slot_number: 1,
        max_capacity: 10,
        low_threshold: 2,
      };

      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      await expect(service.removeStockQuantity('stock-1', 5)).rejects.toThrow(
        'Insufficient stock',
      );
    });
  });

  describe('getLowStockItems', () => {
    it('should return stocks below threshold', async () => {
      const mockLowStocks = [
        {
          id: 'stock-1',
          machine_id: 'machine-1',
          product_id: 'product-1',
          quantity: 1,
          slot_number: 1,
          max_capacity: 10,
          low_threshold: 2,
          product: {
            name: 'Low Stock Item',
            price: 1.50,
            image_url: 'low.jpg',
            ingredients_list: [],
            allergens_list: [],
          },
        },
      ];

      mockPrismaService.stock.findMany.mockResolvedValue(mockLowStocks);

      const result = await service.getLowStockItems(2);

      expect(result).toHaveLength(1);
      expect(result[0].product_name).toBe('Low Stock Item');
      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 2 } },
        include: { product: true },
      });
    });

    it('should use default threshold of 5', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([]);

      await service.getLowStockItems();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 5 } },
        include: { product: true },
      });
    });
  });

  describe('getOutOfStockItems', () => {
    it('should return stocks with 0 quantity', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([]);

      await service.getOutOfStockItems();

      expect(mockPrismaService.stock.findMany).toHaveBeenCalledWith({
        where: { quantity: { lte: 0 } },
        include: { product: true },
      });
    });
  });

  describe('getNextAvailableSlotNumber', () => {
    it('should return next available slot number', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([
        { slot_number: 1 },
        { slot_number: 3 },
      ]);

      const result = await service.getNextAvailableSlotNumber('machine-1');

      expect(result).toBe(2);
    });

    it('should return 1 if no slots exist', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([]);

      const result = await service.getNextAvailableSlotNumber('machine-1');

      expect(result).toBe(1);
    });

    it('should throw error if all slots are occupied', async () => {
      mockPrismaService.stock.findMany.mockResolvedValue([
        { slot_number: 1 },
        { slot_number: 2 },
        { slot_number: 3 },
        { slot_number: 4 },
        { slot_number: 5 },
        { slot_number: 6 },
      ]);

      await expect(service.getNextAvailableSlotNumber('machine-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('addSlot', () => {
    const mockSlotData: AddSlotInput = {
      machine_id: 'machine-1',
      product_id: 'product-1',
      slot_number: 1,
      initial_quantity: 5,
    };

    const mockMachine = { id: 'machine-1', name: 'Test Machine' };
    const mockProduct = { id: 'product-1', name: 'Test Product' };

    it('should add slot successfully', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.count.mockResolvedValue(2);
      mockPrismaService.stock.findFirst.mockResolvedValue(null);
      mockPrismaService.stock.create.mockResolvedValue({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        slot_number: 1,
        quantity: 5,
        max_capacity: 5,
        low_threshold: 1,
      });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.addSlot(mockSlotData);

      expect(result).toMatchObject({
        machine_id: 'machine-1',
        product_id: 'product-1',
        slot_number: 1,
        quantity: 5,
      });
      expect(mockPrismaService.stock.create).toHaveBeenCalledWith({
        data: {
          machine_id: 'machine-1',
          product_id: 'product-1',
          slot_number: 1,
          quantity: 5,
          max_capacity: 5,
          low_threshold: 1,
        },
      });
    });

    it('should throw error if machine not found', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(null);

      await expect(service.addSlot(mockSlotData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if product not found', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.addSlot(mockSlotData)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error if machine already has 6 slots', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.count.mockResolvedValue(6);

      await expect(service.addSlot(mockSlotData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if slot number is already taken', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.count.mockResolvedValue(2);
      mockPrismaService.stock.findFirst.mockResolvedValue({ id: 'existing-slot' });

      await expect(service.addSlot(mockSlotData)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should set machine to ONLINE when 6 slots are reached', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.count
        .mockResolvedValueOnce(5) // before creation
        .mockResolvedValueOnce(6); // after creation
      mockPrismaService.stock.findFirst.mockResolvedValue(null);
      mockPrismaService.stock.create.mockResolvedValue({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        slot_number: 1,
        quantity: 5,
        max_capacity: 5,
        low_threshold: 1,
      });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      await service.addSlot(mockSlotData);

      expect(mockPrismaService.machine.update).toHaveBeenCalledWith({
        where: { id: 'machine-1' },
        data: { status: 'ONLINE' },
      });
    });

    it('should handle alerts service error silently', async () => {
      mockPrismaService.machine.findUnique.mockResolvedValue(mockMachine);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.stock.count.mockResolvedValue(2);
      mockPrismaService.stock.findFirst.mockResolvedValue(null);
      mockPrismaService.stock.create.mockResolvedValue({
        id: 'stock-1',
        machine_id: 'machine-1',
        product_id: 'product-1',
        slot_number: 1,
        quantity: 5,
        max_capacity: 5,
        low_threshold: 1,
      });
      mockAlertsService.updateMachineAlerts.mockRejectedValue(new Error('Alerts error'));

      const result = await service.addSlot(mockSlotData);

      expect(result).toBeDefined();
    });
  });

  describe('updateStock with quantity changes', () => {
    const mockStock = {
      id: 'stock-1',
      machine_id: 'machine-1',
      product_id: 'product-1',
      quantity: 5,
      slot_number: 1,
      max_capacity: 10,
      low_threshold: 2,
    };

    const mockUser = { id: 'user-1' };
    const mockRestock = { id: 'restock-1' };

    it('should handle quantity update with transaction and restock logging', async () => {
      const updateData = { quantity: 8 };
      
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txMock = {
          ...mockPrismaService,
          restock: { create: jest.fn().mockResolvedValue(mockRestock) },
          restockItem: { create: jest.fn().mockResolvedValue({}) },
          stock: { update: jest.fn().mockResolvedValue({ ...mockStock, quantity: 8 }) },
        };
        return cb(txMock);
      });
      mockPrismaService.stock.findUnique.mockResolvedValueOnce(mockStock).mockResolvedValueOnce({ ...mockStock, quantity: 8 });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateStock('stock-1', updateData);

      expect(result.quantity).toBe(8);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw TRPCError if quantity exceeds max capacity in updateStock', async () => {
      const updateData = { quantity: 15 };
      
      mockPrismaService.stock.findUnique.mockResolvedValue(mockStock);

      await expect(service.updateStock('stock-1', updateData)).rejects.toThrow(TRPCError);
    });

    it('should handle updateStock without quantity change', async () => {
      const updateData = { low_threshold: 3 };
      
      mockPrismaService.stock.update.mockResolvedValue({ ...mockStock, low_threshold: 3 });
      mockAlertsService.updateMachineAlerts.mockResolvedValue(undefined);

      const result = await service.updateStock('stock-1', updateData);

      expect(result.low_threshold).toBe(3);
      expect(mockPrismaService.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: updateData,
      });
    });
  });
});