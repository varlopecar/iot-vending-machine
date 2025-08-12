import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import {
  buildPiIdemKey,
  oncePerOrder,
  isActionAlreadyPerformed,
  getOrderActions,
} from './idempotency';
import type { Prisma } from '@prisma/client';

describe('Idempotency System', () => {
  let prismaService: PrismaService;

  const mockPrismaService = {
    orderAction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockTransaction = {
    orderAction: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildPiIdemKey', () => {
    it('should build correct idempotency key', () => {
      const orderId = 'order-123';
      const key = buildPiIdemKey(orderId);
      expect(key).toBe('order:order-123');
    });

    it('should handle different order IDs', () => {
      expect(buildPiIdemKey('order-456')).toBe('order:order-456');
      expect(buildPiIdemKey('order-789')).toBe('order:order-789');
    });
  });

  describe('oncePerOrder', () => {
    const orderId = 'order-123';
    const action = 'credit_loyalty';
    const mockActionFn = jest.fn();

    beforeEach(() => {
      mockActionFn.mockClear();
    });

    it('should execute action when first time', async () => {
      mockTransaction.orderAction.create.mockResolvedValue({ id: 'action-1' });
      mockActionFn.mockResolvedValue(undefined);

      const result = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action,
        mockActionFn,
      );

      expect(result).toBe(true);
      expect(mockTransaction.orderAction.create).toHaveBeenCalledWith({
        data: {
          order_id: orderId,
          action,
          created_at: expect.any(String),
        },
      });
      expect(mockActionFn).toHaveBeenCalledTimes(1);
    });

    it('should not execute action when already performed', async () => {
      const uniqueConstraintError = new Error(
        'Unique constraint failed on order_id_action',
      );
      mockTransaction.orderAction.create.mockRejectedValue(
        uniqueConstraintError,
      );

      const result = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action,
        mockActionFn,
      );

      expect(result).toBe(false);
      expect(mockActionFn).not.toHaveBeenCalled();
    });

    it('should rethrow non-constraint errors', async () => {
      const otherError = new Error('Database connection failed');
      mockTransaction.orderAction.create.mockRejectedValue(otherError);

      await expect(
        oncePerOrder(mockTransaction as any, orderId, action, mockActionFn),
      ).rejects.toThrow('Database connection failed');

      expect(mockActionFn).not.toHaveBeenCalled();
    });

    it('should handle different actions for same order', async () => {
      const action1 = 'credit_loyalty';
      const action2 = 'decrement_stock';

      // Premier appel réussi
      mockTransaction.orderAction.create
        .mockResolvedValueOnce({ id: 'action-1' })
        .mockResolvedValueOnce({ id: 'action-2' });

      const result1 = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action1,
        mockActionFn,
      );
      const result2 = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action2,
        mockActionFn,
      );

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(mockActionFn).toHaveBeenCalledTimes(2);
    });

    it('should handle action function errors', async () => {
      mockTransaction.orderAction.create.mockResolvedValue({ id: 'action-1' });
      const actionError = new Error('Action failed');
      mockActionFn.mockRejectedValue(actionError);

      await expect(
        oncePerOrder(mockTransaction as any, orderId, action, mockActionFn),
      ).rejects.toThrow('Action failed');

      expect(mockTransaction.orderAction.create).toHaveBeenCalled();
    });
  });

  describe('isActionAlreadyPerformed', () => {
    const orderId = 'order-123';
    const action = 'credit_loyalty';

    it('should return true when action exists', async () => {
      mockPrismaService.orderAction.findUnique.mockResolvedValue({
        id: 'action-1',
        order_id: orderId,
        action,
        created_at: '2024-01-01T00:00:00Z',
      });

      const result = await isActionAlreadyPerformed(
        prismaService,
        orderId,
        action,
      );
      expect(result).toBe(true);
    });

    it('should return false when action does not exist', async () => {
      mockPrismaService.orderAction.findUnique.mockResolvedValue(null);

      const result = await isActionAlreadyPerformed(
        prismaService,
        orderId,
        action,
      );
      expect(result).toBe(false);
    });

    it('should handle different actions', async () => {
      mockPrismaService.orderAction.findUnique
        .mockResolvedValueOnce({ id: 'action-1' }) // Premier appel
        .mockResolvedValueOnce(null); // Deuxième appel

      const result1 = await isActionAlreadyPerformed(
        prismaService,
        orderId,
        'credit_loyalty',
      );
      const result2 = await isActionAlreadyPerformed(
        prismaService,
        orderId,
        'decrement_stock',
      );

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('getOrderActions', () => {
    const orderId = 'order-123';

    it('should return list of actions for order', async () => {
      const mockActions = [
        {
          action: 'credit_loyalty',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          action: 'decrement_stock',
          created_at: '2024-01-01T00:01:00Z',
        },
      ];

      mockPrismaService.orderAction.findMany.mockResolvedValue(mockActions);

      const result = await getOrderActions(prismaService, orderId);

      expect(result).toEqual(mockActions);
      expect(mockPrismaService.orderAction.findMany).toHaveBeenCalledWith({
        where: { order_id: orderId },
        select: { action: true, created_at: true },
        orderBy: { created_at: 'asc' },
      });
    });

    it('should return empty array when no actions exist', async () => {
      mockPrismaService.orderAction.findMany.mockResolvedValue([]);

      const result = await getOrderActions(prismaService, orderId);

      expect(result).toEqual([]);
    });

    it('should handle different order IDs', async () => {
      const mockActions1 = [
        { action: 'action1', created_at: '2024-01-01T00:00:00Z' },
      ];
      const mockActions2 = [
        { action: 'action2', created_at: '2024-01-01T00:00:00Z' },
      ];

      mockPrismaService.orderAction.findMany
        .mockResolvedValueOnce(mockActions1)
        .mockResolvedValueOnce(mockActions2);

      const result1 = await getOrderActions(prismaService, 'order-1');
      const result2 = await getOrderActions(prismaService, 'order-2');

      expect(result1).toEqual(mockActions1);
      expect(result2).toEqual(mockActions2);
    });
  });

  describe('Integration Tests', () => {
    const orderId = 'order-123';
    const action = 'credit_loyalty';
    const mockActionFn = jest.fn();

    beforeEach(() => {
      mockActionFn.mockClear();
    });

    it('should handle complete idempotency flow', async () => {
      // Premier appel - action créée et exécutée
      mockTransaction.orderAction.create.mockResolvedValue({ id: 'action-1' });
      mockActionFn.mockResolvedValue(undefined);

      const result1 = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action,
        mockActionFn,
      );

      expect(result1).toBe(true);
      expect(mockActionFn).toHaveBeenCalledTimes(1);

      // Deuxième appel - action déjà existante
      const uniqueConstraintError = new Error(
        'Unique constraint failed on order_id_action',
      );
      mockTransaction.orderAction.create.mockRejectedValue(
        uniqueConstraintError,
      );

      const result2 = await oncePerOrder(
        mockTransaction as any,
        orderId,
        action,
        mockActionFn,
      );

      expect(result2).toBe(false);
      expect(mockActionFn).toHaveBeenCalledTimes(1); // Toujours 1, pas 2
    });

    it('should handle multiple actions for same order', async () => {
      const actions = ['credit_loyalty', 'decrement_stock', 'generate_qr'];

      // Toutes les actions sont créées avec succès
      for (let i = 0; i < actions.length; i++) {
        mockTransaction.orderAction.create.mockResolvedValueOnce({
          id: `action-${i}`,
        });
      }

      const results = await Promise.all(
        actions.map((actionName) =>
          oncePerOrder(
            mockTransaction as any,
            orderId,
            actionName,
            mockActionFn,
          ),
        ),
      );

      expect(results).toEqual([true, true, true]);
      expect(mockActionFn).toHaveBeenCalledTimes(3);
    });
  });
});
