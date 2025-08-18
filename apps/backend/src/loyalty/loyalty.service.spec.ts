import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { LoyaltyService } from './loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let prismaService: PrismaService;
  let authService: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    order: {
      findMany: jest.fn(),
    },
  };

  const mockAuthService = {
    getUserById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
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

    service = module.get<LoyaltyService>(LoyaltyService);
    prismaService = module.get<PrismaService>(PrismaService);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('addPoints', () => {
    const userId = 'user-1';
    const points = 50;
    const reason = 'Purchase reward from Sophia';

    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      points: 100,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should add points successfully', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        points: 150,
      });

      const result = await service.addPoints(userId, points, reason);

      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: 150 },
      });
      expect(result).toEqual({
        id: expect.stringMatching(/^virt_add_\d+$/),
        date: expect.any(String),
        location: 'Sophia',
        points: points,
      });
    });

    it('should handle unknown location in reason', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.addPoints(userId, points, 'Unknown location');

      expect(result.location).toBe('Unknown');
    });
  });

  describe('deductPoints', () => {
    const userId = 'user-1';
    const points = 30;
    const reason = 'Redeemed advantage';

    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      points: 100,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should deduct points successfully', async () => {
      mockAuthService.getUserById.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        points: 70,
      });

      const result = await service.deductPoints(userId, points, reason);

      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: 70 },
      });
      expect(result).toEqual({
        id: expect.stringMatching(/^virt_deduct_\d+$/),
        date: expect.any(String),
        location: 'Unknown',
        points: -points,
      });
    });

    it('should throw error for insufficient points', async () => {
      const insufficientUser = { ...mockUser, points: 20 };
      mockAuthService.getUserById.mockResolvedValue(insufficientUser);

      await expect(service.deductPoints(userId, points, reason)).rejects.toThrow('Insufficient points');
    });
  });

  describe('getLoyaltyHistory', () => {
    const userId = 'user-1';
    const mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        points_earned: 15,
        points_spent: 0,
        created_at: '2024-01-15T10:00:00Z',
      },
      {
        id: 'order-2',
        user_id: 'user-1',
        points_earned: 0,
        points_spent: 50,
        created_at: '2024-01-20T14:30:00Z',
      },
    ];

    it('should return loyalty history successfully', async () => {
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.getLoyaltyHistory(userId);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'order_order-2_spent',
        user_id: userId,
        change: -50,
        reason: 'Redeemed: order order-2',
        created_at: '2024-01-20T14:30:00Z',
      });
      expect(result[1]).toEqual({
        id: 'order_order-1_earned',
        user_id: userId,
        change: 15,
        reason: 'Purchase credit: order order-1',
        created_at: '2024-01-15T10:00:00Z',
      });
    });

    it('should return empty array for user with no orders', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);

      const result = await service.getLoyaltyHistory('user-no-history');

      expect(result).toEqual([]);
    });
  });

  describe('getLoyaltyHistoryFormatted', () => {
    const userId = 'user-1';
    const mockOrdersWithMachine = [
      {
        id: 'order-1',
        user_id: 'user-1',
        points_earned: 15,
        points_spent: 0,
        created_at: '2024-01-15T10:00:00Z',
        machine: {
          label: 'Machine A1',
          location: 'Campus A',
        },
      },
    ];

    it('should return formatted loyalty history', async () => {
      mockPrismaService.order.findMany.mockResolvedValue(mockOrdersWithMachine);

      const result = await service.getLoyaltyHistoryFormatted(userId);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        include: {
          machine: { select: { label: true, location: true } },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'order_order-1_earned',
        date: '15/01/2024',
        location: 'Machine A1',
        points: 15,
      });
    });
  });

  describe('getLoyaltyHistoryPaged', () => {
    const userId = 'user-1';
    const mockFormattedHistory = [
      {
        id: 'entry-1',
        date: '20/01/2024',
        location: 'Machine A1',
        points: -50,
      },
      {
        id: 'entry-2',
        date: '15/01/2024',
        location: 'Machine A1',
        points: 15,
      },
      {
        id: 'entry-3',
        date: '10/01/2024',
        location: 'Machine B2',
        points: 10,
      },
    ];

    it('should return paged history with next offset', async () => {
      jest.spyOn(service, 'getLoyaltyHistoryFormatted').mockResolvedValue(mockFormattedHistory);

      const result = await service.getLoyaltyHistoryPaged(userId, 0, 2);

      expect(result.entries).toHaveLength(2);
      expect(result.entries[0]).toEqual(mockFormattedHistory[0]);
      expect(result.entries[1]).toEqual(mockFormattedHistory[1]);
      expect(result.nextOffset).toBe(2);
    });

    it('should return null nextOffset for last page', async () => {
      jest.spyOn(service, 'getLoyaltyHistoryFormatted').mockResolvedValue(mockFormattedHistory);

      const result = await service.getLoyaltyHistoryPaged(userId, 2, 2);

      expect(result.entries).toHaveLength(1);
      expect(result.nextOffset).toBe(null);
    });
  });

  describe('getAvailableAdvantages', () => {
    it('should return all available advantages', async () => {
      const result = service.getAvailableAdvantages();

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        id: 'petit_snack',
        title: 'Petit Snack',
        description: 'Un petit snack gratuit',
        points: 2,
        image: 'ptit_duo.png',
      });
      expect(result[4]).toEqual({
        id: 'gourmand',
        title: 'Le Gourmand',
        description: 'Un gros snack et une boisson',
        points: 7,
        image: 'le_gourmand.png',
      });
    });
  });

  describe('redeemAdvantage', () => {
    const userId = 'user-1';
    const advantageId = 'petit_snack';

    it('should redeem advantage successfully', async () => {
      const result = await service.redeemAdvantage(userId, advantageId);

      expect(result).toEqual({
        id: expect.stringMatching(/^virt_adv_petit_snack_\d+$/),
        date: expect.any(String),
        location: 'Avantage sélectionné: Petit Snack',
        points: 0,
      });
    });

    it('should throw NotFoundException for invalid advantage', async () => {
      await expect(service.redeemAdvantage(userId, 'invalid_advantage')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCurrentPoints', () => {
    const userId = 'user-1';

    it('should return current user points', async () => {
      const mockUser = {
        id: 'user-1',
        points: 150,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getCurrentPoints(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toBe(150);
    });

    it('should return 0 for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getCurrentPoints('non-existent-user');

      expect(result).toBe(0);
    });
  });

  describe('extractLocationFromReason', () => {
    it('should extract location from reason string', () => {
      expect(service['extractLocationFromReason']('Purchase from Sophia')).toBe('Sophia');
      expect(service['extractLocationFromReason']('Order from Antibes')).toBe('Antibes');
      expect(service['extractLocationFromReason']('Transaction in Nice')).toBe('Nice');
      expect(service['extractLocationFromReason']('Unknown location')).toBe('Unknown');
    });
  });
});