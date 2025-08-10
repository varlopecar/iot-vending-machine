import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateUserInput,
  LoginInput,
  UpdateUserInput,
  User,
} from './auth.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private users: User[] = [];

  register(userData: CreateUserInput): User {
    // Check if user already exists
    const existingUser = this.users.find(
      (user) => user.email === userData.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Generate unique barcode
    const barcode = this.generateBarcode();

    const user: User = {
      id: randomUUID(),
      full_name: userData.full_name,
      email: userData.email,
      points: 0,
      barcode,
      created_at: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  login(loginData: LoginInput): { user: User; token: string } {
    const user = this.users.find((u) => u.email === loginData.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // In a real app, you'd verify the password hash here
    // For now, we'll just check if the user exists
    const token = this.generateToken(user.id);

    return { user, token };
  }

  getUserById(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  getUserByBarcode(barcode: string): User {
    const user = this.users.find((u) => u.barcode === barcode);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  updateUser(id: string, updateData: UpdateUserInput): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updateData,
    };

    return this.users[userIndex];
  }

  updatePoints(id: string, points: number): User {
    const userIndex = this.users.findIndex((u) => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException('User not found');
    }

    this.users[userIndex].points = points;
    return this.users[userIndex];
  }

  private generateBarcode(): string {
    // Generate a unique 12-digit barcode
    return Math.random().toString().slice(2, 14);
  }

  private generateToken(userId: string): string {
    // In a real app, you'd use JWT here
    return `token_${userId}_${Date.now()}`;
  }
}
