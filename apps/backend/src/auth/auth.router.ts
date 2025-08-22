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
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6),
      full_name: z.string().min(1),
      barcode: z.string().optional(),
    }),
    output: z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        full_name: z.string(),
        barcode: z.string().optional(),
        role: z.string(),
      }),
    }),
  })
  register(@Input() userData: any) {
    return this.authService.register(userData);
  }

  @Mutation({
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    output: z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        full_name: z.string(),
        barcode: z.string().optional(),
        role: z.string(),
      }),
    }),
  })
  login(@Input() loginData: any) {
    return this.authService.login(loginData);
  }

  @Mutation({
    input: z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
    output: z.object({
      access_token: z.string(),
      token_type: z.string(),
      expires_in: z.number(),
      user: z.object({
        id: z.string(),
        email: z.string(),
        full_name: z.string(),
        barcode: z.string().optional(),
        role: z.string(),
      }),
    }),
  })
  adminLogin(@Input() loginData: any) {
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
  updateUser(@Input('id') id: string, @Input('data') data: any) {
    // This method was removed from AuthService, so we'll throw an error
    throw new Error('updateUser method not implemented');
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
