import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

import { StripeService } from './stripe.service';

// Mock Stripe
jest.mock('stripe');

describe('StripeService', () => {
  let service: StripeService;
  let configService: ConfigService;
  let mockStripe: jest.Mocked<Stripe>;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup Stripe mock
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
        cancel: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        list: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        list: jest.fn(),
      },
      paymentMethods: {
        attach: jest.fn(),
        detach: jest.fn(),
        list: jest.fn(),
        retrieve: jest.fn(),
      },
      refunds: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
      charges: {
        list: jest.fn(),
        retrieve: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    } as any;

    // Mock Stripe constructor
    (Stripe as jest.MockedClass<typeof Stripe>).mockImplementation(() => mockStripe);

    // Setup config mock
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      const config = {
        STRIPE_SECRET_KEY: 'sk_test_123',
        STRIPE_WEBHOOK_SECRET: 'whsec_123',
      };
      return config[key];
    });

    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    const paymentIntentData = {
      amount: 1000,
      currency: 'eur',
      payment_method: 'pm_test_123',
      confirmation_method: 'manual' as const,
      confirm: false,
      metadata: {
        orderId: 'order-1',
        userId: 'user-1',
      },
    };

    const mockPaymentIntent = {
      id: 'pi_test_123',
      amount: 1000,
      currency: 'eur',
      status: 'requires_confirmation',
      client_secret: 'pi_test_123_secret',
      metadata: paymentIntentData.metadata,
    };

    it('should create payment intent successfully', async () => {
      (mockStripe.paymentIntents.create as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(paymentIntentData);

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(paymentIntentData);
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle Stripe errors during creation', async () => {
      const stripeError = new Error('Invalid payment method');
      stripeError.name = 'StripeError';
      (mockStripe.paymentIntents.create as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.createPaymentIntent(paymentIntentData)).rejects.toThrow('Invalid payment method');
    });

    it('should validate amount', async () => {
      const invalidData = { ...paymentIntentData, amount: -100 };

      await expect(service.createPaymentIntent(invalidData)).rejects.toThrow(BadRequestException);
    });

    it('should handle different currencies', async () => {
      const usdData = { ...paymentIntentData, currency: 'usd' };
      const usdPaymentIntent = { ...mockPaymentIntent, currency: 'usd' };

      (mockStripe.paymentIntents.create as jest.Mock).mockResolvedValue(usdPaymentIntent);

      const result = await service.createPaymentIntent(usdData);

      expect(result.currency).toBe('usd');
    });
  });

  describe('confirmPaymentIntent', () => {
    const mockConfirmedPaymentIntent = {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 1000,
      currency: 'eur',
    };

    it('should confirm payment intent successfully', async () => {
      (mockStripe.paymentIntents.confirm as jest.Mock).mockResolvedValue(mockConfirmedPaymentIntent);

      const result = await service.confirmPaymentIntent('pi_test_123');

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith('pi_test_123');
      expect(result).toEqual(mockConfirmedPaymentIntent);
    });

    it('should handle confirmation errors', async () => {
      const stripeError = new Error('Payment failed');
      (mockStripe.paymentIntents.confirm as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.confirmPaymentIntent('pi_test_123')).rejects.toThrow('Payment failed');
    });

    it('should handle payment intent not found', async () => {
      const notFoundError = new Error('No such payment_intent');
      notFoundError.name = 'StripeError';
      (mockStripe.paymentIntents.confirm as jest.Mock).mockRejectedValue(notFoundError);

      await expect(service.confirmPaymentIntent('pi_invalid')).rejects.toThrow('No such payment_intent');
    });
  });

  describe('cancelPaymentIntent', () => {
    const mockCancelledPaymentIntent = {
      id: 'pi_test_123',
      status: 'canceled',
      amount: 1000,
      currency: 'eur',
    };

    it('should cancel payment intent successfully', async () => {
      (mockStripe.paymentIntents.cancel as jest.Mock).mockResolvedValue(mockCancelledPaymentIntent);

      const result = await service.cancelPaymentIntent('pi_test_123');

      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith('pi_test_123');
      expect(result).toEqual(mockCancelledPaymentIntent);
    });

    it('should handle cancellation errors', async () => {
      const stripeError = new Error('Cannot cancel succeeded payment');
      (mockStripe.paymentIntents.cancel as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.cancelPaymentIntent('pi_test_123')).rejects.toThrow('Cannot cancel succeeded payment');
    });
  });

  describe('retrievePaymentIntent', () => {
    const mockPaymentIntent = {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 1000,
      currency: 'eur',
      metadata: {
        orderId: 'order-1',
      },
    };

    it('should retrieve payment intent successfully', async () => {
      (mockStripe.paymentIntents.retrieve as jest.Mock).mockResolvedValue(mockPaymentIntent);

      const result = await service.retrievePaymentIntent('pi_test_123');

      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith('pi_test_123');
      expect(result).toEqual(mockPaymentIntent);
    });

    it('should handle retrieval errors', async () => {
      const stripeError = new Error('No such payment_intent');
      (mockStripe.paymentIntents.retrieve as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.retrievePaymentIntent('pi_invalid')).rejects.toThrow('No such payment_intent');
    });
  });

  describe('createCustomer', () => {
    const customerData = {
      email: 'test@example.com',
      name: 'Test User',
      metadata: {
        userId: 'user-1',
      },
    };

    const mockCustomer = {
      id: 'cus_test_123',
      email: 'test@example.com',
      name: 'Test User',
      metadata: customerData.metadata,
    };

    it('should create customer successfully', async () => {
      (mockStripe.customers.create as jest.Mock).mockResolvedValue(mockCustomer);

      const result = await service.createCustomer(customerData);

      expect(mockStripe.customers.create).toHaveBeenCalledWith(customerData);
      expect(result).toEqual(mockCustomer);
    });

    it('should handle customer creation errors', async () => {
      const stripeError = new Error('Invalid email');
      (mockStripe.customers.create as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.createCustomer(customerData)).rejects.toThrow('Invalid email');
    });

    it('should validate email format', async () => {
      const invalidData = { ...customerData, email: 'invalid-email' };

      await expect(service.createCustomer(invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('attachPaymentMethod', () => {
    const mockPaymentMethod = {
      id: 'pm_test_123',
      customer: 'cus_test_123',
      type: 'card',
    };

    it('should attach payment method successfully', async () => {
      (mockStripe.paymentMethods.attach as jest.Mock).mockResolvedValue(mockPaymentMethod);

      const result = await service.attachPaymentMethod('pm_test_123', 'cus_test_123');

      expect(mockStripe.paymentMethods.attach).toHaveBeenCalledWith('pm_test_123', {
        customer: 'cus_test_123',
      });
      expect(result).toEqual(mockPaymentMethod);
    });

    it('should handle attachment errors', async () => {
      const stripeError = new Error('Payment method already attached');
      (mockStripe.paymentMethods.attach as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.attachPaymentMethod('pm_test_123', 'cus_test_123'))
        .rejects.toThrow('Payment method already attached');
    });
  });

  describe('createRefund', () => {
    const refundData = {
      payment_intent: 'pi_test_123',
      amount: 500,
      reason: 'requested_by_customer' as const,
      metadata: {
        orderId: 'order-1',
      },
    };

    const mockRefund = {
      id: 're_test_123',
      amount: 500,
      payment_intent: 'pi_test_123',
      status: 'succeeded',
      reason: 'requested_by_customer',
    };

    it('should create refund successfully', async () => {
      (mockStripe.refunds.create as jest.Mock).mockResolvedValue(mockRefund);

      const result = await service.createRefund(refundData);

      expect(mockStripe.refunds.create).toHaveBeenCalledWith(refundData);
      expect(result).toEqual(mockRefund);
    });

    it('should handle refund errors', async () => {
      const stripeError = new Error('Cannot refund uncaptured payment');
      (mockStripe.refunds.create as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.createRefund(refundData)).rejects.toThrow('Cannot refund uncaptured payment');
    });

    it('should validate refund amount', async () => {
      const invalidData = { ...refundData, amount: -100 };

      await expect(service.createRefund(invalidData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('listPaymentMethods', () => {
    const mockPaymentMethods = {
      data: [
        {
          id: 'pm_test_123',
          type: 'card',
          card: { brand: 'visa', last4: '4242' },
        },
        {
          id: 'pm_test_456',
          type: 'card',
          card: { brand: 'mastercard', last4: '5555' },
        },
      ],
    };

    it('should list customer payment methods', async () => {
      (mockStripe.paymentMethods.list as jest.Mock).mockResolvedValue(mockPaymentMethods);

      const result = await service.listPaymentMethods('cus_test_123');

      expect(mockStripe.paymentMethods.list).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        type: 'card',
      });
      expect(result).toEqual(mockPaymentMethods);
    });

    it('should handle listing errors', async () => {
      const stripeError = new Error('No such customer');
      (mockStripe.paymentMethods.list as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.listPaymentMethods('cus_invalid')).rejects.toThrow('No such customer');
    });
  });

  describe('constructWebhookEvent', () => {
    const payload = 'webhook_payload';
    const signature = 'webhook_signature';
    const mockEvent = {
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          status: 'succeeded',
        },
      },
    };

    it('should construct webhook event successfully', async () => {
      (mockStripe.webhooks.constructEvent as jest.Mock).mockReturnValue(mockEvent);

      const result = await service.constructWebhookEvent(payload, signature);

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        'whsec_123'
      );
      expect(result).toEqual(mockEvent);
    });

    it('should handle webhook signature verification errors', async () => {
      const webhookError = new Error('Invalid signature');
      (mockStripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw webhookError;
      });

      await expect(service.constructWebhookEvent(payload, 'invalid_signature'))
        .rejects.toThrow('Invalid signature');
    });

    it('should handle missing webhook secret', async () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'STRIPE_WEBHOOK_SECRET') return null;
        return 'sk_test_123';
      });

      await expect(service.constructWebhookEvent(payload, signature))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('updatePaymentIntent', () => {
    const updateData = {
      metadata: {
        orderId: 'order-2',
        updated: 'true',
      },
    };

    const mockUpdatedPaymentIntent = {
      id: 'pi_test_123',
      metadata: updateData.metadata,
    };

    it('should update payment intent successfully', async () => {
      (mockStripe.paymentIntents.update as jest.Mock).mockResolvedValue(mockUpdatedPaymentIntent);

      const result = await service.updatePaymentIntent('pi_test_123', updateData);

      expect(mockStripe.paymentIntents.update).toHaveBeenCalledWith('pi_test_123', updateData);
      expect(result).toEqual(mockUpdatedPaymentIntent);
    });

    it('should handle update errors', async () => {
      const stripeError = new Error('Cannot update succeeded payment intent');
      (mockStripe.paymentIntents.update as jest.Mock).mockRejectedValue(stripeError);

      await expect(service.updatePaymentIntent('pi_test_123', updateData))
        .rejects.toThrow('Cannot update succeeded payment intent');
    });
  });

  describe('listCustomerCharges', () => {
    const mockCharges = {
      data: [
        {
          id: 'ch_test_123',
          amount: 1000,
          currency: 'eur',
          status: 'succeeded',
        },
        {
          id: 'ch_test_456',
          amount: 1500,
          currency: 'eur',
          status: 'succeeded',
        },
      ],
    };

    it('should list customer charges', async () => {
      (mockStripe.charges.list as jest.Mock).mockResolvedValue(mockCharges);

      const result = await service.listCustomerCharges('cus_test_123');

      expect(mockStripe.charges.list).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        limit: 10,
      });
      expect(result).toEqual(mockCharges);
    });

    it('should handle custom limit', async () => {
      (mockStripe.charges.list as jest.Mock).mockResolvedValue(mockCharges);

      await service.listCustomerCharges('cus_test_123', 25);

      expect(mockStripe.charges.list).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        limit: 25,
      });
    });
  });

  describe('calculateApplicationFee', () => {
    it('should calculate application fee correctly', () => {
      const result = service.calculateApplicationFee(1000);

      expect(result).toBe(30); // 3% of 1000
    });

    it('should handle minimum fee', () => {
      const result = service.calculateApplicationFee(100);

      expect(result).toBe(10); // Minimum fee
    });

    it('should handle zero amount', () => {
      const result = service.calculateApplicationFee(0);

      expect(result).toBe(0);
    });
  });

  describe('formatAmountForStripe', () => {
    it('should format EUR amount correctly', () => {
      const result = service.formatAmountForStripe(10.99, 'eur');

      expect(result).toBe(1099); // Cents
    });

    it('should format USD amount correctly', () => {
      const result = service.formatAmountForStripe(15.50, 'usd');

      expect(result).toBe(1550); // Cents
    });

    it('should handle zero-decimal currencies', () => {
      const result = service.formatAmountForStripe(100, 'jpy');

      expect(result).toBe(100); // No conversion for JPY
    });
  });

  describe('formatAmountFromStripe', () => {
    it('should format EUR amount correctly', () => {
      const result = service.formatAmountFromStripe(1099, 'eur');

      expect(result).toBe(10.99);
    });

    it('should format USD amount correctly', () => {
      const result = service.formatAmountFromStripe(1550, 'usd');

      expect(result).toBe(15.50);
    });

    it('should handle zero-decimal currencies', () => {
      const result = service.formatAmountFromStripe(100, 'jpy');

      expect(result).toBe(100); // No conversion for JPY
    });
  });

  describe('validatePaymentMethod', () => {
    const mockPaymentMethod = {
      id: 'pm_test_123',
      type: 'card',
      card: {
        brand: 'visa',
        checks: {
          cvc_check: 'pass',
          address_line1_check: 'pass',
        },
      },
    };

    it('should validate payment method successfully', async () => {
      (mockStripe.paymentMethods.retrieve as jest.Mock).mockResolvedValue(mockPaymentMethod);

      const result = await service.validatePaymentMethod('pm_test_123');

      expect(mockStripe.paymentMethods.retrieve).toHaveBeenCalledWith('pm_test_123');
      expect(result).toBe(true);
    });

    it('should reject invalid payment method', async () => {
      const stripeError = new Error('No such payment method');
      (mockStripe.paymentMethods.retrieve as jest.Mock).mockRejectedValue(stripeError);

      const result = await service.validatePaymentMethod('pm_invalid');

      expect(result).toBe(false);
    });
  });

  describe('getPaymentIntentsByMetadata', () => {
    const mockPaymentIntents = {
      data: [
        {
          id: 'pi_test_123',
          metadata: { orderId: 'order-1' },
        },
        {
          id: 'pi_test_456',
          metadata: { orderId: 'order-1' },
        },
      ],
    };

    it('should find payment intents by metadata', async () => {
      (mockStripe.paymentIntents.list as jest.Mock).mockResolvedValue(mockPaymentIntents);

      const result = await service.getPaymentIntentsByMetadata({ orderId: 'order-1' });

      expect(mockStripe.paymentIntents.list).toHaveBeenCalledWith({
        limit: 100,
      });
      expect(result).toHaveLength(2);
    });
  });
});