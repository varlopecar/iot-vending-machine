import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateUserInput,
  LoginInput,
  AdminLoginInput,
  UpdateUserInput,
  User,
} from './auth.schema';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(userData: CreateUserInput): Promise<User> {
    // Check if user already exists
    const existingUser = (await this.prisma.user.findUnique({
      where: { email: userData.email },
    })) as User;

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate unique barcode
    const barcode = this.generateBarcode();

    const user = (await this.prisma.user.create({
      data: {
        full_name: userData.full_name,
        email: userData.email,
        password: hashedPassword,
        points: 0,
        barcode,
      },
    })) as User;

    return user;
  }

  async login(loginData: LoginInput): Promise<{ user: User; token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateJwt(user.id);

    return { user, token };
  }

  async adminLogin(loginData: AdminLoginInput): Promise<{ user: User; token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Verify user is admin or operator
    if (user.role !== 'ADMIN' && user.role !== 'OPERATOR') {
      throw new UnauthorizedException('Access denied: Admin privileges required');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginData.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    const token = await this.generateJwt(user.id);

    return { user, token };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByBarcode(barcode: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { barcode },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: string, updateData: UpdateUserInput): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    return updatedUser;
  }

  async updatePoints(id: string, points: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { points },
    });

    return updatedUser;
  }

  private generateBarcode(): string {
    // Generate a unique 12-digit barcode
    return Math.random().toString().slice(2, 14);
  }

  private async generateJwt(userId: string): Promise<string> {
    return await this.jwt.signAsync({ sub: userId });
  }
}
