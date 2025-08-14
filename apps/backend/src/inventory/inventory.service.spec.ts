import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import type { Prisma } from '@prisma/client';

describe('InventoryService', () => {
  let service: InventoryService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
    },
    stock: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockTransaction = {
    order: {
      findUnique: jest.fn(),
    },
    orderItem: {
      findMany: jest.fn(),
    },
    stock: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('decrementStockForOrder', () => {
    const orderId = 'order-123';
    const mockOrder = {
      id: orderId,
      machine_id: 'machine-456',
      machine: { status: 'ONLINE' },
      items: [
        {
          product_id: 'product-1',
          quantity: 2,
          slot_number: 1,
        },
        {
          product_id: 'product-2',
          quantity: 1,
          slot_number: 2,
        },
      ],
    };

    const mockStock1 = {
      id: 'stock-1',
      quantity: 5,
    };

    const mockStock2 = {
      id: 'stock-2',
      quantity: 3,
    };

    it('should decrement stock successfully for multi-item order', async () => {
      mockTransaction.order.findUnique.mockResolvedValue(mockOrder);
      mockTransaction.orderItem.findMany.mockResolvedValue([
        { product_id: 'product-1', quantity: 2, slot_number: 1 },
        { product_id: 'product-2', quantity: 1, slot_number: 2 },
      ]);
      mockTransaction.stock.findFirst
        .mockResolvedValueOnce(mockStock1) // Premier item
        .mockResolvedValueOnce(mockStock2); // Deuxième item

      await service.decrementStockForOrder(mockTransaction as any, orderId);

      expect(mockTransaction.stock.update).toHaveBeenCalledTimes(2);
      expect(mockTransaction.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: { quantity: 3 }, // 5 - 2
      });
      expect(mockTransaction.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-2' },
        data: { quantity: 2 }, // 3 - 1
      });
    });

    it('should throw error when order not found', async () => {
      mockTransaction.order.findUnique.mockResolvedValue(null);

      await expect(
        service.decrementStockForOrder(mockTransaction as any, orderId),
      ).rejects.toThrow(BadRequestException);
      expect(mockTransaction.stock.update).not.toHaveBeenCalled();
    });

    it('should throw error when machine is offline', async () => {
      const offlineOrder = {
        ...mockOrder,
        machine: { status: 'OFFLINE' },
      };
      mockTransaction.order.findUnique.mockResolvedValue(offlineOrder);

      await expect(
        service.decrementStockForOrder(mockTransaction as any, orderId),
      ).rejects.toThrow(BadRequestException);
      expect(mockTransaction.stock.update).not.toHaveBeenCalled();
    });

    it('should throw error when stock not found', async () => {
      mockTransaction.order.findUnique.mockResolvedValue(mockOrder);
      mockTransaction.stock.findFirst.mockResolvedValue(null);

      await expect(
        service.decrementStockForOrder(mockTransaction as any, orderId),
      ).rejects.toThrow(BadRequestException);
      expect(mockTransaction.stock.update).not.toHaveBeenCalled();
    });

    it('should throw error when stock is insufficient', async () => {
      const insufficientStock = {
        ...mockStock1,
        quantity: 1, // Moins que la quantité demandée (2)
      };

      mockTransaction.order.findUnique.mockResolvedValue(mockOrder);
      mockTransaction.stock.findFirst.mockResolvedValue(insufficientStock);

      await expect(
        service.decrementStockForOrder(mockTransaction as any, orderId),
      ).rejects.toThrow(BadRequestException);
      expect(mockTransaction.stock.update).not.toHaveBeenCalled();
    });

    it('should handle single item order', async () => {
      const singleItemOrder = {
        ...mockOrder,
        items: [
          {
            product_id: 'product-1',
            quantity: 1,
            slot_number: 1,
          },
        ],
      };

      mockTransaction.order.findUnique.mockResolvedValue(singleItemOrder);
      mockTransaction.stock.findFirst.mockResolvedValue(mockStock1);

      await service.decrementStockForOrder(mockTransaction as any, orderId);

      expect(mockTransaction.stock.update).toHaveBeenCalledTimes(1);
      expect(mockTransaction.stock.update).toHaveBeenCalledWith({
        where: { id: 'stock-1' },
        data: { quantity: 4 }, // 5 - 1
      });
    });
  });

  describe('checkStockAvailability', () => {
    const orderId = 'order-123';
    const mockOrder = {
      id: orderId,
      machine_id: 'machine-456',
      items: [
        {
          product_id: 'product-1',
          quantity: 2,
          slot_number: 1,
        },
      ],
    };

    it('should return true when stock is sufficient', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.stock.findFirst.mockResolvedValue({
        quantity: 5,
      });

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(true);
    });

    it('should return false when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(false);
    });

    it('should return false when stock not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.stock.findFirst.mockResolvedValue(null);

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(false);
    });

    it('should return false when stock is insufficient', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.stock.findFirst.mockResolvedValue({
        quantity: 1, // Moins que la quantité demandée (2)
      });

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(false);
    });

    it('should handle multiple items correctly', async () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            slot_number: 1,
          },
          {
            product_id: 'product-2',
            quantity: 1,
            slot_number: 2,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(multiItemOrder);
      mockPrismaService.stock.findFirst
        .mockResolvedValueOnce({ quantity: 5 }) // Premier item
        .mockResolvedValueOnce({ quantity: 3 }); // Deuxième item

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(true);
    });

    it('should return false if any item has insufficient stock', async () => {
      const multiItemOrder = {
        ...mockOrder,
        items: [
          {
            product_id: 'product-1',
            quantity: 2,
            slot_number: 1,
          },
          {
            product_id: 'product-2',
            quantity: 1,
            slot_number: 2,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(multiItemOrder);
      mockPrismaService.stock.findFirst
        .mockResolvedValueOnce({ quantity: 5 }) // Premier item OK
        .mockResolvedValueOnce({ quantity: 0 }); // Deuxième item insuffisant

      const result = await service.checkStockAvailability(orderId);
      expect(result).toBe(false);
    });
  });
});
