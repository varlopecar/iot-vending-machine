import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateOrderInput,
  UpdateOrderInput,
  Order,
  OrderItem,
  OrderWithItems,
} from './orders.schema';
import { randomUUID } from 'crypto';
import { AuthService } from '../auth/auth.service';
import { ProductsService } from '../products/products.service';
import { StocksService } from 'src/stocks/stocks.service';

@Injectable()
export class OrdersService {
  private orders: Order[] = [];
  private orderItems: OrderItem[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly productsService: ProductsService,
    private readonly stocksService: StocksService,
  ) {}

  createOrder(orderData: CreateOrderInput): OrderWithItems {
    // Validate user exists
    this.authService.getUserById(orderData.user_id);

    // Generate QR code token
    const qrCodeToken = this.generateQRCodeToken();

    // Set expiration time (30 minutes from now)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const order: Order = {
      id: randomUUID(),
      user_id: orderData.user_id,
      machine_id: orderData.machine_id,
      status: 'active',
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      qr_code_token: qrCodeToken,
    };

    this.orders.push(order);

    // Validate products and check stock
    const items: OrderItem[] = [];
    let totalPrice = 0;

    for (const item of orderData.items) {
      const product = this.productsService.getProductById(item.product_id);
      const stock = this.stocksService.getStockByMachineAndProduct(
        orderData.machine_id,
        item.product_id,
      );

      if (!stock || stock.quantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      // Decrement stock immediately (as per requirements)
      this.stocksService.updateStockQuantity(
        stock.id,
        stock.quantity - item.quantity,
      );

      const orderItem: OrderItem = {
        id: randomUUID(),
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        slot_number: item.slot_number,
      };

      items.push(orderItem);
      this.orderItems.push(orderItem);
      totalPrice += product.price * item.quantity;
    }

    return {
      ...order,
      items,
      total_price: totalPrice,
    };
  }

  getOrderById(id: string): OrderWithItems {
    const order = this.orders.find((o) => o.id === id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const items = this.orderItems.filter((item) => item.order_id === id);
    const totalPrice = this.calculateOrderTotal(items);

    return {
      ...order,
      items,
      total_price: totalPrice,
    };
  }

  getOrdersByUserId(userId: string): OrderWithItems[] {
    const userOrders = this.orders.filter((o) => o.user_id === userId);
    const ordersWithItems: OrderWithItems[] = [];

    for (const order of userOrders) {
      const items = this.orderItems.filter(
        (item) => item.order_id === order.id,
      );
      const totalPrice = this.calculateOrderTotal(items);

      ordersWithItems.push({
        ...order,
        items,
        total_price: totalPrice,
      });
    }

    return ordersWithItems;
  }

  updateOrder(id: string, updateData: UpdateOrderInput): Order {
    const orderIndex = this.orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      throw new NotFoundException('Order not found');
    }

    this.orders[orderIndex] = {
      ...this.orders[orderIndex],
      ...updateData,
    };

    return this.orders[orderIndex];
  }

  cancelOrder(id: string): Order {
    const order = this.getOrderById(id);

    if (order.status !== 'active') {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Restore stock
    for (const item of order.items) {
      const stock = this.stocksService.getStockByMachineAndProduct(
        order.machine_id,
        item.product_id,
      );

      if (stock) {
        this.stocksService.updateStockQuantity(
          stock.id,
          stock.quantity + item.quantity,
        );
      }
    }

    return this.updateOrder(id, { status: 'cancelled' });
  }

  validateQRCode(qrCodeToken: string): Order {
    const order = this.orders.find((o) => o.qr_code_token === qrCodeToken);
    if (!order) {
      throw new NotFoundException('Invalid QR code');
    }

    if (order.status !== 'active') {
      throw new BadRequestException('Order is not active');
    }

    if (new Date(order.expires_at) < new Date()) {
      this.updateOrder(order.id, { status: 'expired' });
      throw new BadRequestException('Order has expired');
    }

    return order;
  }

  useOrder(id: string): Order {
    const order = this.getOrderById(id);

    if (order.status !== 'active') {
      throw new BadRequestException('Order cannot be used');
    }

    return this.updateOrder(id, { status: 'used' });
  }

  private calculateOrderTotal(items: OrderItem[]): number {
    let total = 0;
    for (const item of items) {
      const product = this.productsService.getProductById(item.product_id);
      total += product.price * item.quantity;
    }
    return total;
  }

  private generateQRCodeToken(): string {
    return `qr_${randomUUID()}_${Date.now()}`;
  }
}
