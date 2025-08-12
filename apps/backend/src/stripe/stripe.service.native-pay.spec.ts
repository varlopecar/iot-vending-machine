import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';
import { getStripeClient } from './stripeClient';
import type { CreatePaymentIntentInput } from './stripe.types';

// Mock des modules externes
jest.mock('./stripeClient');

describe('StripeService - Native Pay Support', () => {
  let service: StripeService;
  let mockStripe: any;

  const mockStripeClient = {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    accounts: {
      retrieve: jest.fn(),
    },
    paymentRequest: jest.fn(),
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

  describe('createPaymentIntent with Native Pay', () => {
    const baseInput: CreatePaymentIntentInput = {
      amount: 2500, // 25.00 EUR
      currency: 'eur',
      metadata: {
        order_id: 'order_123',
        user_id: 'user_456',
        machine_id: 'machine_789',
      },
    };

    it('should create payment intent with Apple Pay support for iOS', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        supportsNativePay: true,
        platform: 'ios',
      };

      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: input.metadata,
        payment_method_types: ['card', 'apple_pay'],
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(true);
      expect(result.paymentMethodTypes).toContain('apple_pay');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'eur',
        metadata: input.metadata,
        payment_method_types: ['card', 'apple_pay'],
      });
    });

    it('should create payment intent with Google Pay support for Android', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        supportsNativePay: true,
        platform: 'android',
      };

      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: input.metadata,
        payment_method_types: ['card', 'google_pay'],
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(true);
      expect(result.paymentMethodTypes).toContain('google_pay');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'eur',
        metadata: input.metadata,
        payment_method_types: ['card', 'google_pay'],
      });
    });

    it('should create payment intent without native pay when not requested', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        supportsNativePay: false,
      };

      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_abc',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: input.metadata,
        payment_method_types: [],
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(false);
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2500,
        currency: 'eur',
        metadata: input.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    });

    it('should reject unsupported currency for native pay', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        currency: 'btc', // Bitcoin non supporté
        supportsNativePay: true,
        platform: 'ios',
      };

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(false);
    });

    it('should reject amount outside limits for native pay', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        amount: 25, // Trop petit (0.25€)
        supportsNativePay: true,
        platform: 'ios',
      };

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(false);
    });

    it('should reject amount too high for native pay', async () => {
      const input: CreatePaymentIntentInput = {
        ...baseInput,
        amount: 1000000, // Trop élevé (10000€)
        supportsNativePay: true,
        platform: 'ios',
      };

      const result = await service.createPaymentIntent(input);

      expect(result.supportsNativePay).toBe(false);
    });
  });

  describe('checkApplePayAvailability', () => {
    it('should return true when Apple Pay is available', async () => {
      const mockPaymentRequest = {
        canMakePayment: jest.fn().mockReturnValue({ applePay: true }),
      };

      mockStripe.paymentRequest.mockResolvedValue(mockPaymentRequest);

      const result = await service.checkApplePayAvailability('example.com');

      expect(result).toBe(true);
      expect(mockStripe.paymentRequest).toHaveBeenCalledWith({
        country: 'FR',
        currency: 'eur',
        total: {
          label: 'Test',
          amount: 100,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
    });

    it('should return false when Apple Pay is not available', async () => {
      const mockPaymentRequest = {
        canMakePayment: jest.fn().mockReturnValue({ applePay: false }),
      };

      mockStripe.paymentRequest.mockResolvedValue(mockPaymentRequest);

      const result = await service.checkApplePayAvailability('example.com');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStripe.paymentRequest.mockRejectedValue(new Error('API Error'));

      const result = await service.checkApplePayAvailability('example.com');

      expect(result).toBe(false);
    });
  });

  describe('checkGooglePayAvailability', () => {
    it('should return true when Google Pay is available', async () => {
      const mockAccount = {
        id: 'acct_test',
        charges_enabled: true,
        payouts_enabled: true,
        country: 'FR',
      };

      mockStripe.accounts.retrieve.mockResolvedValue(mockAccount);

      const result = await service.checkGooglePayAvailability();

      expect(result).toBe(true);
      expect(mockStripe.accounts.retrieve).toHaveBeenCalled();
    });

    it('should return false when charges are not enabled', async () => {
      const mockAccount = {
        id: 'acct_test',
        charges_enabled: false,
        payouts_enabled: false,
        country: 'FR',
      };

      mockStripe.accounts.retrieve.mockResolvedValue(mockAccount);

      const result = await service.checkGooglePayAvailability();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockStripe.accounts.retrieve.mockRejectedValue(new Error('API Error'));

      const result = await service.checkGooglePayAvailability();

      expect(result).toBe(false);
    });
  });
});
