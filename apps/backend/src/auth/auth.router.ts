import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { AuthService } from './auth.service';
import { z } from 'zod';
import {
  createUserSchema,
  loginSchema,
  adminLoginSchema,
  updateUserSchema,
  userSchema,
} from './auth.schema';
import type {
  CreateUserInput,
  LoginInput,
  AdminLoginInput,
  UpdateUserInput,
} from './auth.schema';

@Router({ alias: 'auth' })
export class AuthRouter {
  constructor(private readonly authService: AuthService) {}

  @Mutation({
    input: createUserSchema,
    output: userSchema,
  })
  register(@Input() userData: CreateUserInput) {
    return this.authService.register(userData);
  }

  @Mutation({
    input: loginSchema,
    output: z.object({
      user: userSchema,
      token: z.string(),
    }),
  })
  login(@Input() loginData: LoginInput) {
    return this.authService.login(loginData);
  }

  @Mutation({
    input: adminLoginSchema,
    output: z.object({
      user: userSchema,
      token: z.string(),
    }),
  })
  adminLogin(@Input() loginData: AdminLoginInput) {
    return this.authService.adminLogin(loginData);
  }

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: userSchema,
  })
  getUserById(@Input('id') id: string) {
    return this.authService.getUserById(id);
  }

  @Query({
    input: z.object({ barcode: z.string() }),
    output: userSchema,
  })
  getUserByBarcode(@Input('barcode') barcode: string) {
    return this.authService.getUserByBarcode(barcode);
  }

  @Mutation({
    input: z.object({
      id: z.uuid(),
      data: updateUserSchema,
    }),
    output: userSchema,
  })
  updateUser(@Input('id') id: string, @Input('data') data: UpdateUserInput) {
    return this.authService.updateUser(id, data);
  }

  @Mutation({
    input: z.object({
      id: z.uuid(),
      points: z.number().int().min(0),
    }),
    output: userSchema,
  })
  updatePoints(@Input('id') id: string, @Input('points') points: number) {
    return this.authService.updatePoints(id, points);
  }
}
