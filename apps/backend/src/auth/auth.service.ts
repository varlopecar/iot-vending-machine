import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto, AuthResponseDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate unique barcode if not provided
    const barcode = userData.barcode || this.generateBarcode();

    const user = await this.prisma.user.create({
      data: {
        full_name: userData.full_name,
        email: userData.email,
        password: hashedPassword,
        points: 0,
        barcode,
        role: 'CUSTOMER',
      },
    });

    const token = await this.generateJwt(user.id);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        barcode: user.barcode,
        role: user.role,
      },
    };
  }

  async login(loginData: LoginDto): Promise<AuthResponseDto> {
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

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        barcode: user.barcode,
        role: user.role,
      },
    };
  }

  async adminLogin(loginData: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    // Verify user is admin or operator
    if (user.role !== 'ADMIN' && user.role !== 'OPERATOR') {
      throw new UnauthorizedException(
        'Access denied: Admin privileges required',
      );
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

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        barcode: user.barcode,
        role: user.role,
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByBarcode(barcode: string) {
    const user = await this.prisma.user.findUnique({
      where: { barcode },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updatePoints(id: string, points: number) {
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

  generateMachineToken(userId: string, machineId: string): string {
    // Generate a machine-specific token with additional claims
    const payload = {
      sub: userId,
      machineId: machineId,
      type: 'machine',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    };

    return this.jwt.sign(payload);
  }
}
