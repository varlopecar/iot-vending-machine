import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    id: 'user-1',
    full_name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'CUSTOMER' as const,
    barcode: '123456789',
    points: 100,
    created_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      signAsync: jest.fn(),
    };

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
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        full_name: 'New User',
        email: 'new@example.com',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      
      // Mock findUnique to return null (user doesn't exist)
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock create to return the new user
      (prismaService.user.create as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...registerDto,
        password: hashedPassword,
      });

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          full_name: registerDto.full_name,
          email: registerDto.email,
          password: hashedPassword,
          points: 0,
          barcode: expect.any(String),
        },
      });
      expect(result).toEqual({
        ...mockUser,
        ...registerDto,
        password: hashedPassword,
      });
    });

    it('should throw error if user already exists', async () => {
      const registerDto = {
        full_name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Mock findUnique to return existing user
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow('User with this email already exists');
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const token = 'jwt-token';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.login(loginDto);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: mockUser.id });
      expect(result).toEqual({
        user: mockUser,
        token: token,
      });
    });

    it('should throw error for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('adminLogin', () => {
    it('should login admin successfully', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' as const };
      const loginDto = {
        email: 'admin@example.com',
        password: 'password123',
      };

      const token = 'jwt-token';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(adminUser);
      jwtService.signAsync.mockResolvedValue(token);

      const result = await service.adminLogin(loginDto);

      expect(result).toEqual({
        user: adminUser,
        token: token,
      });
    });

    it('should throw error for non-admin user', async () => {
      const loginDto = {
        email: 'user@example.com',
        password: 'password123',
      };

      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.adminLogin(loginDto)).rejects.toThrow('Access denied: Admin privileges required');
    });
  });
});
