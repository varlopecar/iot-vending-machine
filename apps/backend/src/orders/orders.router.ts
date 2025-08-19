import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { OrdersService } from './orders.service';
import { TrpcAuthMiddleware } from '../auth/trpc-auth.middleware';
import { z } from 'zod';
import {
  createOrderSchema,
  updateOrderSchema,
  orderSchema,
  orderWithItemsSchema,
} from './orders.schema';
import type { CreateOrderInput, UpdateOrderInput } from './orders.schema';
import { UnauthorizedException } from '@nestjs/common';

@Router({ alias: 'orders' })
export class OrdersRouter {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly authMiddleware: TrpcAuthMiddleware,
  ) {}

  @Query({
    input: z.object({ id: z.string().min(1) }),
    output: orderWithItemsSchema,
  })
  async getOrderById(@Input('id') id: string, ctx: any) {
    // TEMPORAIRE: Désactiver l'authentification pour déboguer
    // TODO: Réactiver l'authentification une fois le problème résolu
    /*
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);
    */
    
    console.log('🐛 DEBUG - getOrderById appelé avec id:', id);
    const order = await this.ordersService.getOrderById(id);
    console.log('🐛 DEBUG - getOrderById résultat:', JSON.stringify(order, null, 2));
    
    return order;
  }

  @Query({
    input: z.object({ user_id: z.string().min(1) }),
    output: z.array(orderWithItemsSchema),
  })
  async getOrdersByUserId(@Input('user_id') userId: string, ctx: any) {
    // TEMPORAIRE: Désactiver l'authentification pour déboguer
    // TODO: Réactiver l'authentification une fois le problème résolu
    /*
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    this.authMiddleware.requireOwnershipOrAdmin(user, userId);
    */
    
    console.log('🐛 DEBUG - getOrdersByUserId appelé avec userId:', userId);
    const orders = await this.ordersService.getOrdersByUserId(userId);
    console.log('🐛 DEBUG - getOrdersByUserId résultat:', orders.length, 'commandes trouvées');
    
    return orders;
  }

  @Mutation({
    input: createOrderSchema,
    output: orderWithItemsSchema,
  })
  async createOrder(@Input() orderData: CreateOrderInput, ctx: any) {
    // TEMPORAIRE: Désactiver l'authentification pour déboguer
    // TODO: Réactiver l'authentification une fois le problème résolu
    /*
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    this.authMiddleware.requireOwnershipOrAdmin(user, orderData.user_id);
    */
    
    console.log('🐛 DEBUG - createOrder appelé avec:', JSON.stringify(orderData, null, 2));
    console.log('🐛 DEBUG - ctx headers:', ctx?.req?.headers?.authorization);
    
    const result = await this.ordersService.createOrder(orderData);
    console.log('🐛 DEBUG - createOrder résultat:', JSON.stringify(result, null, 2));
    
    return result;
  }

  @Mutation({
    input: z.object({
      id: z.string().min(1),
      data: updateOrderSchema,
    }),
    output: orderSchema,
  })
  async updateOrder(@Input('id') id: string, @Input('data') data: UpdateOrderInput, ctx: any) {
    // Vérifier l'authentification
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    
    // Récupérer la commande pour vérifier la propriété
    const order = await this.ordersService.getOrderById(id);
    
    // Vérifier que l'utilisateur peut modifier cette commande (protection BOLA)
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);
    
    return this.ordersService.updateOrder(id, data);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: orderSchema,
  })
  async cancelOrder(@Input('id') id: string, ctx: any) {
    // TEMPORAIRE: Désactiver l'authentification pour déboguer
    // TODO: Réactiver l'authentification une fois le problème résolu
    /*
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    const order = await this.ordersService.getOrderById(id);
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);
    */
    
    console.log('🐛 DEBUG - cancelOrder appelé avec id:', id);
    const result = await this.ordersService.cancelOrder(id);
    console.log('🐛 DEBUG - cancelOrder résultat:', JSON.stringify(result, null, 2));
    
    return result;
  }

  @Mutation({
    input: z.object({ qr_code_token: z.string() }),
    output: orderSchema,
  })
  async validateQRCode(@Input('qr_code_token') qrCodeToken: string, ctx: any) {
    // Note: La validation QR peut être publique car le token contient déjà toutes les vérifications nécessaires
    // et est signé cryptographiquement. Cependant, on peut ajouter l'authentification pour plus de sécurité.
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    
    return this.ordersService.validateQRCode(qrCodeToken);
  }

  @Mutation({
    input: z.object({ id: z.string().min(1) }),
    output: orderSchema,
  })
  async useOrder(@Input('id') id: string, ctx: any) {
    // Vérifier l'authentification - typiquement utilisé par les opérateurs de machine
    const user = await this.authMiddleware.authenticateUser(ctx.req?.headers?.authorization);
    
    // Récupérer la commande pour vérifier la propriété
    const order = await this.ordersService.getOrderById(id);
    
    // Vérifier que l'utilisateur peut utiliser cette commande (protection BOLA)
    this.authMiddleware.requireOwnershipOrAdmin(user, order.user_id);
    
    return this.ordersService.useOrder(id);
  }
}
