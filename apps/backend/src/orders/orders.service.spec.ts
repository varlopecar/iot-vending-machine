import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { CreateOrderInput, UpdateOrderInput } from './orders.schema';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    machine: {
      findUnique: jest.fn(),
    },
    stock: {
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orderAction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAuthService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto: CreateOrderInput = {
      user_id: 'user-1',
      machine_id: 'machine-1',
      items: [
        { product_id: 'product-1', quantity: 2, slot_number: 1 },
        { product_id: 'product-2', quantity: 1, slot_number: 2 },
      ],
    };

    const mockOrder = {
      id: 'order-1',
      user_id: 'user-1',
      machine_id: 'machine-1',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      qr_code_token: 'qr_test_token',
    };

    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      price: 2.50,
      is_active: true,
    };

    const mockMachine = {
      id: 'machine-1',
      location: 'Test Location',
      status: 'ONLINE',
    };

    const mockStock = {
      id: 'stock-1',
      product_id: 'product-1',
      machine_id: 'machine-1',
      quantity: 10,
      max_capacity: 20,
    };

    it('should create order successfully', async () => {
      const mockOrderItem = {
        id: 'item-1',
        order_id: 'order-1',
        product_id: 'product-1',
        quantity: 2,
        slot_number: 1,
        unit_price_cents: 250,
        subtotal_cents: 500,
        label: 'Test Product',
      };

      const mockTx = {
        order: { 
          create: jest.fn().mockResolvedValue(mockOrder),
          update: jest.fn().mockResolvedValue(mockOrder),
        },
        orderItem: { 
          create: jest.fn().mockResolvedValue(mockOrderItem),
        },
        stock: {
          findFirst: jest.fn().mockResolvedValue(mockStock),
          update: jest.fn(),
        },
        product: { findUnique: jest.fn().mockResolvedValue(mockProduct) },
        user: { 
          findUnique: jest.fn().mockResolvedValue({ id: 'user-1', points: 100 }),
          update: jest.fn(),
        },
        orderAction: { create: jest.fn() },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });
      (mockAuthService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });

      const result = await service.createOrder(createOrderDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if machine not found', async () => {
      const mockTx = {
        machine: { findUnique: jest.fn().mockResolvedValue(null) },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow();
    });

    it('should throw error if product not found', async () => {
      const mockTx = {
        machine: { findUnique: jest.fn().mockResolvedValue(mockMachine) },
        product: { findUnique: jest.fn().mockResolvedValue(null) },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow();
    });

    it('should throw error if insufficient stock', async () => {
      const lowStock = { ...mockStock, quantity: 1 };
      const mockTx = {
        machine: { findUnique: jest.fn().mockResolvedValue(mockMachine) },
        product: { findUnique: jest.fn().mockResolvedValue(mockProduct) },
        stock: { findFirst: jest.fn().mockResolvedValue(lowStock) },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await expect(service.createOrder(createOrderDto)).rejects.toThrow();
    });

    it('should handle empty order items', async () => {
      const emptyOrderDto = { ...createOrderDto, items: [] };

      const mockTx = {
        order: { create: jest.fn() },
        stock: { findFirst: jest.fn() },
        product: { findUnique: jest.fn() },
        user: { findUnique: jest.fn() },
        orderAction: { create: jest.fn() },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });
      (mockAuthService.getUserById as jest.Mock).mockResolvedValue({ id: 'user-1' });

      await expect(service.createOrder(emptyOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getOrderById', () => {
    const mockOrder = {
      id: 'order-1',
      user_id: 'user-1',
      machine_id: 'machine-1',
      status: 'PENDING',
      total_amount: 8.00,
      items: [
        { id: 'item-1', product_id: 'product-1', quantity: 2, price: 2.50 },
      ],
    };

    it('should return order by id', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockPrismaService.orderItem.findMany as jest.Mock).mockResolvedValue(mockOrder.items);

      const result = await service.getOrderById('order-1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: 'order-1' },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if order not found', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getOrderById('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      (mockPrismaService.order.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getOrderById('order-1')).rejects.toThrow('DB Error');
    });
  });

  describe('getOrdersByUserId', () => {
    const mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        status: 'COMPLETED',
        total_amount: 8.00,
        created_at: new Date(),
      },
      {
        id: 'order-2',
        user_id: 'user-1',
        status: 'PENDING',
        total_amount: 5.00,
        created_at: new Date(),
      },
    ];

    it('should return orders by user id', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);
      (mockPrismaService.orderItem.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getOrdersByUserId('user-1');

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
      });
      expect(result).toBeDefined();
    });

    it('should return empty array for user with no orders', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getOrdersByUserId('user-no-orders');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getOrdersByUserId('user-1')).rejects.toThrow('DB Error');
    });
  });



  describe('cancelOrder', () => {
    it('should cancel order and restore stock', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'active',
        machine_id: 'machine-1',
        items: [
          { product_id: 'product-1', quantity: 2 },
          { product_id: 'product-2', quantity: 1 },
        ],
      };

      const mockOrderItems = [
        { product_id: 'product-1', quantity: 2 },
        { product_id: 'product-2', quantity: 1 },
      ];

      // Mock getOrderById
      (mockPrismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);
      (mockPrismaService.orderItem.findMany as jest.Mock).mockResolvedValue(mockOrderItems);

      const mockTx = {
        order: {
          update: jest.fn().mockResolvedValue({ ...mockOrder, status: 'CANCELLED' }),
        },
        stock: {
          findFirst: jest.fn().mockResolvedValue({ id: 'stock-1', quantity: 5 }),
          update: jest.fn(),
        },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      const result = await service.cancelOrder('order-1');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw error if order already completed', async () => {
      const completedOrder = {
        id: 'order-1',
        status: 'COMPLETED',
      };

      const mockTx = {
        order: { findUnique: jest.fn().mockResolvedValue(completedOrder) },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      await expect(service.cancelOrder('order-1')).rejects.toThrow();
    });
  });


});
