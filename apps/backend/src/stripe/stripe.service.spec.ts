import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { getStripeClient } from './stripeClient';
import type Stripe from 'stripe';

// Mock des modules externes
jest.mock('./stripeClient');

describe('StripeService', () => {
  let service: StripeService;
  let mockStripe: any;

  const mockStripeClient = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);

    // Mock Stripe
    mockStripe = mockStripeClient;
    (getStripeClient as jest.Mock).mockReturnValue(mockStripe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    const validInput = {
      amount: 2500, // 25.00 EUR
      currency: 'eur',
      metadata: {
        order_id: 'order_123',
        user_id: 'user_456',
        machine_id: 'machine_789',
      },
    };

    it('should create a payment intent with valid input', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: validInput.metadata,
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(validInput);

      expect(result).toEqual({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: validInput.metadata,
      });
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'eur',
        metadata: validInput.metadata,
      });
    });

    it('should handle Stripe errors gracefully', async () => {
      const stripeError = new Error('Stripe API error');
      stripeError.name = 'StripeError';
      stripeError.message = 'Invalid amount';

      mockStripe.paymentIntents.create.mockRejectedValue(stripeError);

      await expect(service.createPaymentIntent(validInput)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle unexpected errors', async () => {
      const unexpectedError = new Error('Network error');
      mockStripe.paymentIntents.create.mockRejectedValue(unexpectedError);

      await expect(service.createPaymentIntent(validInput)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getPaymentIntent', () => {
    const paymentIntentId = 'pi_test_123';

    it('should retrieve a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: paymentIntentId,
        amount: 2500,
        currency: 'eur',
        status: 'succeeded',
        metadata: { order_id: 'order_123' },
      };

      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);

      const result = await service.getPaymentIntent(paymentIntentId);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.retrieve).toHaveBeenCalledWith(
        paymentIntentId,
      );
    });

    it('should handle retrieval errors', async () => {
      const stripeError = new Error('Payment intent not found');
      stripeError.name = 'StripeError';

      mockStripe.paymentIntents.retrieve.mockRejectedValue(stripeError);

      await expect(service.getPaymentIntent(paymentIntentId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('confirmPaymentIntent', () => {
    const paymentIntentId = 'pi_test_123';

    it('should confirm a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 2500,
        currency: 'eur',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(mockPaymentIntent);

      const result = await service.confirmPaymentIntent(paymentIntentId);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(
        paymentIntentId,
      );
    });

    it('should handle confirmation errors', async () => {
      const stripeError = new Error('Payment confirmation failed');
      stripeError.name = 'StripeError';

      mockStripe.paymentIntents.confirm.mockRejectedValue(stripeError);

      await expect(
        service.confirmPaymentIntent(paymentIntentId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelPaymentIntent', () => {
    const paymentIntentId = 'pi_test_123';

    it('should cancel a payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: paymentIntentId,
        status: 'canceled',
        amount: 2500,
        currency: 'eur',
      };

      mockStripe.paymentIntents.cancel.mockResolvedValue(mockPaymentIntent);

      const result = await service.cancelPaymentIntent(paymentIntentId);

      expect(result).toEqual(mockPaymentIntent);
      expect(mockStripe.paymentIntents.cancel).toHaveBeenCalledWith(
        paymentIntentId,
      );
    });

    it('should handle cancellation errors', async () => {
      const stripeError = new Error('Payment cancellation failed');
      stripeError.name = 'StripeError';

      mockStripe.paymentIntents.cancel.mockRejectedValue(stripeError);

      await expect(
        service.cancelPaymentIntent(paymentIntentId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleStripeError', () => {
    it('should handle Stripe errors correctly', () => {
      const stripeError = new Error('Card declined');
      stripeError.name = 'StripeError';
      stripeError.message = 'Your card was declined';

      const result = service['handleStripeError'](stripeError);

      expect(result).toEqual({
        type: 'unknown_error',
        code: 'unknown',
        message: 'Your card was declined',
      });
    });

    it('should handle non-Stripe errors', () => {
      const regularError = new Error('Network timeout');

      const result = service['handleStripeError'](regularError);

      expect(result).toEqual({
        type: 'unknown_error',
        code: 'unknown',
        message: 'Network timeout',
      });
    });
  });
});
