import { Test, TestingModule } from '@nestjs/testing';
import { StripeService } from './stripe.service';

// Mock du client Stripe
jest.mock('./stripeClient', () => ({
  getStripeClient: jest.fn(() => ({
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
    },
  })),
}));

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeService],
    }).compile();

    service = module.get<StripeService>(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create a payment intent with valid input', async () => {
      const mockInput = {
        amount: 2500,
        currency: 'eur',
        metadata: {
          order_id: 'order_123',
          user_id: 'user_456',
          machine_id: 'machine_789',
        },
      };

      // Mock de la réponse Stripe
      const mockStripeResponse = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_456',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: mockInput.metadata,
      };

      // Mock de la méthode Stripe
      const stripeClient = require('./stripeClient').getStripeClient();
      stripeClient.paymentIntents.create.mockResolvedValue(mockStripeResponse);

      const result = await service.createPaymentIntent(mockInput);

      expect(result).toEqual({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_456',
        amount: 2500,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: mockInput.metadata,
      });
    });
  });
});
