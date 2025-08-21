import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserInput,
  LoginInput,
  AdminLoginInput,
  UpdateUserInput,
} from './auth.schema';

// Mock bcrypt
jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
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

    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: CreateUserInput = {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      points: 0,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue('hashedPassword' as never);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockBcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
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
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginInput = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      points: 100,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should login user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
      });
      expect(result).toEqual({
        user: mockUser,
        token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });

  describe('adminLogin', () => {
    const adminLoginDto: AdminLoginInput = {
      email: 'admin@example.com',
      password: 'admin123',
    };

    const mockAdminUser = {
      id: 'admin-1',
      full_name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedPassword',
      points: 0,
      barcode: 'ADM001',
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    };

    it('should login admin user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockAdminUser);
      mockBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.signAsync.mockResolvedValue('mock-admin-jwt-token');

      const result = await service.adminLogin(adminLoginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockAdminUser.id,
      });
      expect(result).toEqual({
        user: mockAdminUser,
        token: 'mock-admin-jwt-token',
      });
    });

    it('should throw UnauthorizedException for non-admin user', async () => {
      const customerUser = { ...mockAdminUser, role: 'CUSTOMER' };
      mockPrismaService.user.findUnique.mockResolvedValue(customerUser);
      mockBcrypt.compare.mockResolvedValue(true as never);

      await expect(service.adminLogin(adminLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserById', () => {
    const userId = 'user-1';
    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      points: 150,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should return user by id successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe('getUserByBarcode', () => {
    const barcode = 'BC001';
    const mockUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      points: 200,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should return user by barcode successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getUserByBarcode(barcode);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { barcode },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserByBarcode(barcode)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    const userId = 'user-1';
    const updateDto: UpdateUserInput = {
      full_name: 'John Updated',
      email: 'john.updated@example.com',
    };

    const mockUpdatedUser = {
      id: 'user-1',
      full_name: 'John Updated',
      email: 'john.updated@example.com',
      password: 'hashedPassword',
      points: 150,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should update user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUpdatedUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUser(userId, updateDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateDto,
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('updatePoints', () => {
    const userId = 'user-1';
    const newPoints = 500;

    const mockUpdatedUser = {
      id: 'user-1',
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword',
      points: 500,
      barcode: 'BC001',
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    it('should update user points successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUpdatedUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updatePoints(userId, newPoints);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { points: newPoints },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('generateBarcode', () => {
    it('should generate unique barcode', () => {
      const barcode1 = service['generateBarcode']();
      const barcode2 = service['generateBarcode']();

      expect(barcode1).toMatch(/^\d{12}$/);
      expect(barcode2).toMatch(/^\d{12}$/);
      expect(barcode1).not.toBe(barcode2);
    });
  });

  describe('generateJwt', () => {
    const userId = 'user-1';

    it('should generate JWT token', async () => {
      mockJwtService.signAsync.mockResolvedValue('mock.jwt.token');

      const token = await service['generateJwt'](userId);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: userId,
      });
      expect(token).toBe('mock.jwt.token');
    });
  });
});
