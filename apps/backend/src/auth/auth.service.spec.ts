import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, LoginInput } from './auth.schema';

// Mock bcrypt globalement
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    sign: jest.fn(),
    verify: jest.fn(),
    decode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: CreateUserInput = {
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'CUSTOMER',
      barcode: '123456789',
      points: 100,
      created_at: new Date(),
    };

    it('should register a new user successfully', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaService.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          full_name: registerDto.full_name,
          email: registerDto.email,
          password: 'hashedPassword',
          points: 0,
          barcode: expect.any(String),
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if user already exists', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should handle bcrypt errors', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(service.register(registerDto)).rejects.toThrow('Hash failed');
    });

    it('should handle database creation errors', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaService.user.create as jest.Mock).mockRejectedValue(new Error('DB Error'));

      await expect(service.register(registerDto)).rejects.toThrow('DB Error');
    });
  });

  describe('login', () => {
    const loginDto: LoginInput = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'CUSTOMER',
      barcode: '123456789',
      points: 100,
      created_at: new Date(),
    };

    it('should login user successfully', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token');

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual({
        token: 'jwt-token',
        user: mockUser,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle bcrypt compare errors', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockRejectedValue(new Error('Compare failed'));

      await expect(service.login(loginDto)).rejects.toThrow('Compare failed');
    });
  });



  describe('getUserById', () => {
    const mockUser = {
      id: 'user-1',
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'hashedPassword',
      role: 'CUSTOMER',
      barcode: '123456789',
      points: 100,
      created_at: new Date(),
    };

    it('should return user by id', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await service.getUserById('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.getUserById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePoints', () => {
    it('should update user points', async () => {
      const updatedUser = { id: 'user-1', points: 150 };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue({ id: 'user-1' });
      (prismaService.user.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await service.updatePoints('user-1', 150);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { points: 150 },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.updatePoints('non-existent', 150)).rejects.toThrow(NotFoundException);
    });
  });
});