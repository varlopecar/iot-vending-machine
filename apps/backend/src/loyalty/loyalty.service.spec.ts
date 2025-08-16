import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';

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
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    loyaltyReward: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    loyaltyTransaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockAuthService = {
    getUserById: jest.fn(),
    updateUserPoints: jest.fn(),
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

  describe('getCurrentPoints', () => {
    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      points: 150,
    };

    it('should return current user points', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getCurrentPoints('user-1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: { points: true },
      });
      expect(result).toBe(150);
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getCurrentPoints('non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should handle database errors', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getCurrentPoints('user-1')).rejects.toThrow('DB Error');
    });
  });

  describe('getLoyaltyHistory', () => {
    const mockOrders = [
      {
        id: 'order-1',
        user_id: 'user-1',
        points_earned: 10,
        points_spent: 0,
        total_amount: 10.00,
        status: 'COMPLETED',
        created_at: new Date('2023-01-15'),
      },
      {
        id: 'order-2',
        user_id: 'user-1',
        points_earned: 0,
        points_spent: 5,
        total_amount: 8.00,
        status: 'COMPLETED',
        created_at: new Date('2023-01-10'),
      },
    ];

    it('should return loyalty history from orders', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.getLoyaltyHistory('user-1');

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { 
          user_id: 'user-1',
          status: 'COMPLETED',
        },
        select: {
          id: true,
          points_earned: true,
          points_spent: true,
          total_amount: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should return empty array for user with no orders', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getLoyaltyHistory('user-no-orders');

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      (mockPrismaService.order.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.getLoyaltyHistory('user-1')).rejects.toThrow('DB Error');
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue(mockOrders);

      const result = await service.getLoyaltyHistory('user-1', startDate, endDate);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { 
          user_id: 'user-1',
          status: 'COMPLETED',
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          id: true,
          points_earned: true,
          points_spent: true,
          total_amount: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockOrders);
    });
  });

  describe('addPoints', () => {
    const mockUser = {
      id: 'user-1',
      points: 100,
    };

    it('should add points to user account', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        points: 150,
      });
      (mockPrismaService.loyaltyTransaction.create as jest.Mock).mockResolvedValue({
        id: 'transaction-1',
        user_id: 'user-1',
        points: 50,
        type: 'EARNED',
      });

      const result = await service.addPoints('user-1', 50, 'Purchase reward');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { points: 150 },
      });
      expect(mockPrismaService.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-1',
          points: 50,
          type: 'EARNED',
          description: 'Purchase reward',
        },
      });
      expect(result).toBe(150);
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.addPoints('non-existent', 50)).rejects.toThrow(NotFoundException);
    });

    it('should handle negative points', async () => {
      await expect(service.addPoints('user-1', -10)).rejects.toThrow(BadRequestException);
    });

    it('should handle zero points', async () => {
      await expect(service.addPoints('user-1', 0)).rejects.toThrow(BadRequestException);
    });
  });

  describe('spendPoints', () => {
    const mockUser = {
      id: 'user-1',
      points: 100,
    };

    it('should spend points from user account', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        points: 70,
      });
      (mockPrismaService.loyaltyTransaction.create as jest.Mock).mockResolvedValue({
        id: 'transaction-1',
        user_id: 'user-1',
        points: 30,
        type: 'SPENT',
      });

      const result = await service.spendPoints('user-1', 30, 'Discount applied');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { points: 70 },
      });
      expect(mockPrismaService.loyaltyTransaction.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user-1',
          points: 30,
          type: 'SPENT',
          description: 'Discount applied',
        },
      });
      expect(result).toBe(70);
    });

    it('should throw BadRequestException if insufficient points', async () => {
      const userWithLowPoints = { ...mockUser, points: 20 };
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(userWithLowPoints);

      await expect(service.spendPoints('user-1', 50)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.spendPoints('non-existent', 30)).rejects.toThrow(NotFoundException);
    });

    it('should handle negative points', async () => {
      await expect(service.spendPoints('user-1', -10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('calculatePointsFromAmount', () => {
    it('should calculate points correctly', () => {
      const result = service.calculatePointsFromAmount(10.00);

      expect(result).toBe(10); // 1 point per euro
    });

    it('should handle decimal amounts', () => {
      const result = service.calculatePointsFromAmount(15.75);

      expect(result).toBe(15); // Rounded down
    });

    it('should handle zero amount', () => {
      const result = service.calculatePointsFromAmount(0);

      expect(result).toBe(0);
    });

    it('should handle negative amounts', () => {
      const result = service.calculatePointsFromAmount(-5.00);

      expect(result).toBe(0);
    });
  });

  describe('getAvailableRewards', () => {
    const mockRewards = [
      {
        id: 'reward-1',
        name: '10% Discount',
        description: 'Get 10% off your next purchase',
        points_required: 100,
        is_active: true,
        discount_percentage: 10,
      },
      {
        id: 'reward-2',
        name: 'Free Drink',
        description: 'Get a free drink',
        points_required: 50,
        is_active: true,
        free_product_id: 'product-drink-1',
      },
    ];

    it('should return available rewards', async () => {
      (mockPrismaService.loyaltyReward.findMany as jest.Mock).mockResolvedValue(mockRewards);

      const result = await service.getAvailableRewards();

      expect(mockPrismaService.loyaltyReward.findMany).toHaveBeenCalledWith({
        where: { is_active: true },
        orderBy: { points_required: 'asc' },
      });
      expect(result).toEqual(mockRewards);
    });

    it('should filter rewards by user points', async () => {
      const userPoints = 75;
      const affordableRewards = [mockRewards[1]]; // Only the 50-point reward
      
      (mockPrismaService.loyaltyReward.findMany as jest.Mock).mockResolvedValue(affordableRewards);

      const result = await service.getAvailableRewards(userPoints);

      expect(mockPrismaService.loyaltyReward.findMany).toHaveBeenCalledWith({
        where: { 
          is_active: true,
          points_required: { lte: userPoints },
        },
        orderBy: { points_required: 'asc' },
      });
      expect(result).toEqual(affordableRewards);
    });
  });

  describe('redeemReward', () => {
    const mockUser = {
      id: 'user-1',
      points: 150,
    };

    const mockReward = {
      id: 'reward-1',
      name: '10% Discount',
      points_required: 100,
      is_active: true,
      discount_percentage: 10,
    };

    it('should redeem reward successfully', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.loyaltyReward.findUnique as jest.Mock).mockResolvedValue(mockReward);
      
      const mockTx = {
        user: {
          update: jest.fn().mockResolvedValue({ ...mockUser, points: 50 }),
        },
        loyaltyTransaction: {
          create: jest.fn().mockResolvedValue({
            id: 'transaction-1',
            type: 'SPENT',
            points: 100,
          }),
        },
      };

      (mockPrismaService.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockTx);
      });

      const result = await service.redeemReward('user-1', 'reward-1');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        reward: mockReward,
        remainingPoints: 50,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.redeemReward('non-existent', 'reward-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if reward not found', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.loyaltyReward.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.redeemReward('user-1', 'non-existent')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient points', async () => {
      const userWithLowPoints = { ...mockUser, points: 50 };
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(userWithLowPoints);
      (mockPrismaService.loyaltyReward.findUnique as jest.Mock).mockResolvedValue(mockReward);

      await expect(service.redeemReward('user-1', 'reward-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if reward is inactive', async () => {
      const inactiveReward = { ...mockReward, is_active: false };
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.loyaltyReward.findUnique as jest.Mock).mockResolvedValue(inactiveReward);

      await expect(service.redeemReward('user-1', 'reward-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getLoyaltyStats', () => {
    const mockUser = {
      id: 'user-1',
      points: 150,
    };

    it('should return loyalty statistics', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.order.count as jest.Mock)
        .mockResolvedValueOnce(25) // total orders
        .mockResolvedValueOnce(20); // completed orders
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue([
        { points_earned: 10 },
        { points_earned: 15 },
        { points_earned: 8 },
      ]);

      const result = await service.getLoyaltyStats('user-1');

      expect(result).toEqual({
        currentPoints: 150,
        totalOrders: 25,
        completedOrders: 20,
        totalPointsEarned: 33,
        averagePointsPerOrder: 1.65,
      });
    });

    it('should handle user with no orders', async () => {
      (mockPrismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (mockPrismaService.order.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (mockPrismaService.order.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getLoyaltyStats('user-1');

      expect(result.averagePointsPerOrder).toBe(0);
    });
  });

  describe('getTopLoyaltyUsers', () => {
    const mockTopUsers = [
      { id: 'user-1', full_name: 'Top User 1', points: 500 },
      { id: 'user-2', full_name: 'Top User 2', points: 450 },
      { id: 'user-3', full_name: 'Top User 3', points: 400 },
    ];

    it('should return top loyalty users', async () => {
      (mockPrismaService.user.findMany as jest.Mock).mockResolvedValue(mockTopUsers);

      const result = await service.getTopLoyaltyUsers(3);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          full_name: true,
          points: true,
        },
        orderBy: { points: 'desc' },
        take: 3,
      });
      expect(result).toEqual(mockTopUsers);
    });

    it('should use default limit', async () => {
      (mockPrismaService.user.findMany as jest.Mock).mockResolvedValue(mockTopUsers);

      await service.getTopLoyaltyUsers();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 })
      );
    });
  });

  describe('createLoyaltyReward', () => {
    const rewardData = {
      name: 'New Reward',
      description: 'A new test reward',
      points_required: 200,
      discount_percentage: 15,
    };

    const mockCreatedReward = {
      id: 'reward-new',
      ...rewardData,
      is_active: true,
      created_at: new Date(),
    };

    it('should create loyalty reward', async () => {
      (mockPrismaService.loyaltyReward.create as jest.Mock).mockResolvedValue(mockCreatedReward);

      const result = await service.createLoyaltyReward(rewardData);

      expect(mockPrismaService.loyaltyReward.create).toHaveBeenCalledWith({
        data: rewardData,
      });
      expect(result).toEqual(mockCreatedReward);
    });

    it('should handle creation errors', async () => {
      (mockPrismaService.loyaltyReward.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));

      await expect(service.createLoyaltyReward(rewardData)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateLoyaltyReward', () => {
    const updateData = {
      name: 'Updated Reward',
      points_required: 250,
    };

    const mockUpdatedReward = {
      id: 'reward-1',
      name: 'Updated Reward',
      points_required: 250,
    };

    it('should update loyalty reward', async () => {
      (mockPrismaService.loyaltyReward.update as jest.Mock).mockResolvedValue(mockUpdatedReward);

      const result = await service.updateLoyaltyReward('reward-1', updateData);

      expect(mockPrismaService.loyaltyReward.update).toHaveBeenCalledWith({
        where: { id: 'reward-1' },
        data: updateData,
      });
      expect(result).toEqual(mockUpdatedReward);
    });

    it('should handle update errors', async () => {
      (mockPrismaService.loyaltyReward.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      await expect(service.updateLoyaltyReward('reward-1', updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('getLoyaltyTransactions', () => {
    const mockTransactions = [
      {
        id: 'transaction-1',
        user_id: 'user-1',
        points: 50,
        type: 'EARNED',
        description: 'Purchase reward',
        created_at: new Date(),
      },
      {
        id: 'transaction-2',
        user_id: 'user-1',
        points: 30,
        type: 'SPENT',
        description: 'Discount applied',
        created_at: new Date(),
      },
    ];

    it('should return loyalty transactions', async () => {
      (mockPrismaService.loyaltyTransaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await service.getLoyaltyTransactions('user-1');

      expect(mockPrismaService.loyaltyTransaction.findMany).toHaveBeenCalledWith({
        where: { user_id: 'user-1' },
        orderBy: { created_at: 'desc' },
      });
      expect(result).toEqual(mockTransactions);
    });

    it('should limit results', async () => {
      (mockPrismaService.loyaltyTransaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);

      await service.getLoyaltyTransactions('user-1', 5);

      expect(mockPrismaService.loyaltyTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 })
      );
    });
  });
});
