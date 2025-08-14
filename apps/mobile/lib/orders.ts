import { trpcMutation, trpcQuery } from './api';

export type CreateOrderItemInput = {
  product_id: string;
  quantity: number;
  slot_number: number;
};

export type CreateOrderInput = {
  user_id: string;
  machine_id: string;
  items: CreateOrderItemInput[];
  points_spent?: number;
};

export type OrderWithItems = {
  id: string;
  user_id: string;
  machine_id: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'USED' | 'CANCELLED' | string;
  created_at: string;
  expires_at: string;
  qr_code_token: string;
  items: Array<{
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    slot_number: number;
  }>;
  total_price: number;
};

export async function createOrder(input: CreateOrderInput) {
  return trpcMutation<CreateOrderInput, OrderWithItems>('orders.createOrder', input);
}

export async function getOrdersByUserId(user_id: string) {
  return trpcQuery<{ user_id: string }, OrderWithItems[]>('orders.getOrdersByUserId', { user_id });
}

export async function getOrderById(id: string) {
  return trpcQuery<{ id: string }, OrderWithItems>('orders.getOrderById', { id });
}

export async function cancelOrder(id: string) {
  return trpcMutation<{ id: string }, any>('orders.cancelOrder', { id });
}


