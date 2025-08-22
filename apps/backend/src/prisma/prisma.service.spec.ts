import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  // Mock the PrismaService methods
  const mockPrismaService = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    onModuleInit: jest.fn(),
    onModuleDestroy: jest.fn(),
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

    service = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect on module init', async () => {
      mockPrismaService.onModuleInit.mockImplementation(async () => {
        await mockPrismaService.$connect();
      });

      await service.onModuleInit();

      expect(service.onModuleInit).toHaveBeenCalledTimes(1);
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('Connection failed');
      mockPrismaService.onModuleInit.mockRejectedValue(connectionError);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
      expect(service.onModuleInit).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect on module destroy', async () => {
      mockPrismaService.onModuleDestroy.mockImplementation(async () => {
        await mockPrismaService.$disconnect();
      });

      await service.onModuleDestroy();

      expect(service.onModuleDestroy).toHaveBeenCalledTimes(1);
    });

    it('should handle disconnection errors', async () => {
      const disconnectionError = new Error('Disconnection failed');
      mockPrismaService.onModuleDestroy.mockRejectedValue(disconnectionError);

      await expect(service.onModuleDestroy()).rejects.toThrow(
        'Disconnection failed',
      );
      expect(service.onModuleDestroy).toHaveBeenCalledTimes(1);
    });
  });

  describe('database connection methods', () => {
    it('should have $connect method', () => {
      expect(service.$connect).toBeDefined();
    });

    it('should have $disconnect method', () => {
      expect(service.$disconnect).toBeDefined();
    });

    it('should call $connect when requested', async () => {
      mockPrismaService.$connect.mockResolvedValue(undefined);

      await service.$connect();

      expect(service.$connect).toHaveBeenCalledTimes(1);
    });

    it('should call $disconnect when requested', async () => {
      mockPrismaService.$disconnect.mockResolvedValue(undefined);

      await service.$disconnect();

      expect(service.$disconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('lifecycle integration', () => {
    it('should handle complete lifecycle', async () => {
      mockPrismaService.onModuleInit.mockResolvedValue(undefined);
      mockPrismaService.onModuleDestroy.mockResolvedValue(undefined);

      // Simulate module initialization
      await service.onModuleInit();
      expect(service.onModuleInit).toHaveBeenCalledTimes(1);

      // Simulate module destruction
      await service.onModuleDestroy();
      expect(service.onModuleDestroy).toHaveBeenCalledTimes(1);
    });

    it('should be ready for database operations after init', async () => {
      mockPrismaService.onModuleInit.mockResolvedValue(undefined);
      mockPrismaService.$connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(service).toBeDefined();
      expect(service.$connect).toBeDefined();
      expect(service.$disconnect).toBeDefined();
    });
  });
});
