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

  describe('getOrdersByUserId', () => {
    it('should return orders for a user', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          user_id: 'user-1',
          machine_id: 'machine-1',
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          qr_code_token: 'qr_test_token',
        },
      ];

      const mockItems = [
        {
          id: 'item-1',
          order_id: 'order-1',
          product_id: 'product-1',
          quantity: 2,
          slot_number: 1,
        },
      ];

      const mockProduct = {
        id: 'product-1',
        name: 'Test Product',
        price: 2.50,
      };

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.orderItem.findMany.mockResolvedValue(mockItems);
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getOrdersByUserId('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'order-1',
        user_id: 'user-1',
        status: 'active',
      });
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
      });
    });

    it('should return empty array for user with no orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.orderItem.findMany.mockResolvedValue([]);

      const result = await service.getOrdersByUserId('user-1');

      expect(result).toHaveLength(0);
    });
  });

  describe('validateQRCode', () => {
    it('should validate active QR code successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        user_id: 'user-1',
        machine_id: 'machine-1',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        qr_code_token: 'qr_test_token',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.validateQRCode('qr_test_token');

      expect(result).toMatchObject({
        id: 'order-1',
        status: 'active',
      });
      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { qr_code_token: 'qr_test_token' },
      });
    });

    it('should throw error for invalid QR code', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.validateQRCode('invalid_token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error for inactive order', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'USED',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(service.validateQRCode('qr_test_token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should expire order if past expiration time', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'ACTIVE',
        expires_at: new Date(Date.now() - 60 * 1000).toISOString(), // Expired 1 minute ago
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({ ...mockOrder, status: 'EXPIRED' });

      await expect(service.validateQRCode('qr_test_token')).rejects.toThrow(
        BadRequestException,
      );

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'EXPIRED' },
      });
    });
  });

  describe('useOrder', () => {
    it('should mark order as used successfully', async () => {
      const mockOrder = {
        id: 'order-1',
        user_id: 'user-1',
        machine_id: 'machine-1',
        status: 'ACTIVE',
        items: [],
        total_price: 5.00,
      };

      const mockUpdatedOrder = { ...mockOrder, status: 'USED' };

      // Mock getOrderById call
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: 'ACTIVE',
      });
      mockPrismaService.orderItem.findMany.mockResolvedValue([]);
      mockPrismaService.product.findUnique.mockResolvedValue({ price: 2.50 });

      // Mock update call
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.useOrder('order-1');

      expect(result).toMatchObject({
        id: 'order-1',
        status: 'used',
      });
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'USED' },
      });
    });

    it('should throw error if order cannot be used', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'USED',
        items: [],
        total_price: 5.00,
      };

      // Mock getOrderById call
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.orderItem.findMany.mockResolvedValue([]);

      await expect(service.useOrder('order-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateOrder status mappings', () => {
    it('should handle updateOrder with different status values', async () => {
      const mockOrder = {
        id: 'order-1',
        user_id: 'user-1',
        machine_id: 'machine-1',
        status: 'PENDING',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        qr_code_token: 'qr_test_token',
      };

      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      // Test different status mappings
      const updateData: UpdateOrderInput = { status: 'pending' };
      const result = await service.updateOrder('order-1', updateData);

      expect(result.status).toBe('pending');
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'PENDING' },
      });
    });

    it('should handle updateOrder with expires_at', async () => {
      const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const mockOrder = {
        id: 'order-1',
        expires_at: newExpiresAt,
        status: 'ACTIVE',
      };

      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      const updateData: UpdateOrderInput = { expires_at: newExpiresAt };
      await service.updateOrder('order-1', updateData);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { expires_at: newExpiresAt },
      });
    });

    it('should handle edge case status mappings', async () => {
      const mockOrder = {
        id: 'order-1',
        status: 'PENDING',
      };

      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      // Test edge case status mappings
      const testStatuses = ['paid', 'failed', 'refunded', 'requires_payment'];
      
      for (const status of testStatuses) {
        await service.updateOrder('order-1', { status: status as any });
        expect(mockPrismaService.order.update).toHaveBeenCalledWith({
          where: { id: 'order-1' },
          data: { status: 'PENDING' },
        });
      }
    });
  });

  describe('loyalty points and free items', () => {
    it('should handle createOrder with points spending', async () => {
      const createOrderDto: CreateOrderInput = {
        user_id: 'user-1',
        machine_id: 'machine-1',
        items: [{ product_id: 'product-1', quantity: 1, slot_number: 1 }],
        points_spent: 50,
      };

      const mockUser = { id: 'user-1', points: 100 };
      const mockProduct = { id: 'product-1', name: 'Test Product', price: 2.50 };
      const mockStock = { id: 'stock-1', quantity: 10 };

      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txMock = {
          ...mockPrismaService,
          stock: {
            findFirst: jest.fn().mockResolvedValue(mockStock),
            update: jest.fn().mockResolvedValue({ ...mockStock, quantity: 9 }),
          },
          order: {
            create: jest.fn().mockResolvedValue({
              id: 'order-1',
              points_spent: 50,
              loyalty_applied: true,
              status: 'ACTIVE',
              user_id: 'user-1',
              machine_id: 'machine-1',
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              qr_code_token: 'qr_test_token',
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue({
              id: 'item-1',
              subtotal_cents: 250,
            }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
          },
          orderAction: {
            create: jest.fn().mockResolvedValue({}),
          },
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ ...mockUser, points: 50 }),
          },
        };
        return { 
          order: {
            id: 'order-1',
            points_spent: 50,
            loyalty_applied: true,
            status: 'ACTIVE',
            user_id: 'user-1',
            machine_id: 'machine-1',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            qr_code_token: 'qr_test_token',
          }, 
          items: [{
            id: 'item-1',
            subtotal_cents: 250,
          }]
        };
      });

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await service.createOrder(createOrderDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle createOrder with free items', async () => {
      const createOrderDto: CreateOrderInput = {
        user_id: 'user-1',
        machine_id: 'machine-1',
        items: [
          { 
            product_id: 'product-1', 
            quantity: 1, 
            slot_number: 1,
            is_free: true 
          }
        ],
      };

      const mockUser = { id: 'user-1', points: 100 };
      const mockProduct = { id: 'product-1', name: 'Free Product', price: 2.50 };
      const mockStock = { id: 'stock-1', quantity: 10 };

      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation(async (cb) => {
        const txMock = {
          ...mockPrismaService,
          stock: {
            findFirst: jest.fn().mockResolvedValue(mockStock),
            update: jest.fn().mockResolvedValue({ ...mockStock, quantity: 9 }),
          },
          order: {
            create: jest.fn().mockResolvedValue({ 
              id: 'order-1',
              status: 'ACTIVE',
              user_id: 'user-1',
              machine_id: 'machine-1',
              created_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              qr_code_token: 'qr_test_token',
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          orderItem: {
            create: jest.fn().mockResolvedValue({
              id: 'item-1',
              subtotal_cents: 0, // Free item
            }),
          },
          product: {
            findUnique: jest.fn().mockResolvedValue(mockProduct),
          },
        };
        return { 
          order: {
            id: 'order-1',
            status: 'ACTIVE',
            user_id: 'user-1',
            machine_id: 'machine-1',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            qr_code_token: 'qr_test_token',
          }, 
          items: [{
            id: 'item-1',
            subtotal_cents: 0,
          }]
        };
      });

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.createOrder(createOrderDto);

      expect(result).toBeDefined();
    });
  });


});
