import { Test, TestingModule } from '@nestjs/testing';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import {
  getStripeClient,
  getStripeWebhookSecret,
} from '../stripe/stripeClient';
import { HttpStatus } from '@nestjs/common';

// Mock des modules externes
jest.mock('../stripe/stripeClient');

describe('StripeWebhookController', () => {
  let controller: StripeWebhookController;
  let service: jest.Mocked<StripeWebhookService>;
  let mockStripe: any;

  const mockEvent = {
    id: 'evt_test_123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        metadata: { orderId: 'order-123' },
      },
    },
  };

  const mockRequest = {
    body: Buffer.from(JSON.stringify(mockEvent)),
    headers: {
      'stripe-signature': 't=1234567890,v1=signature_hash',
    },
  };

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeWebhookController],
      providers: [
        {
          provide: StripeWebhookService,
          useValue: {
            handleEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StripeWebhookController>(StripeWebhookController);
    service = module.get(StripeWebhookService);

    // Mock Stripe
    mockStripe = {
      webhooks: {
        constructEvent: jest.fn().mockReturnValue(mockEvent),
      },
    };

    (getStripeClient as jest.Mock).mockReturnValue(mockStripe);
    (getStripeWebhookSecret as jest.Mock).mockReturnValue('whsec_test_secret');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /webhooks/stripe', () => {
    it('should handle valid webhook successfully', async () => {
      service.handleEvent.mockResolvedValue(true);

      await controller.handleStripeWebhook(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        mockRequest.body,
        mockRequest.headers['stripe-signature'],
        'whsec_test_secret',
      );
      expect(service.handleEvent).toHaveBeenCalledWith(mockEvent);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(mockResponse.json).toHaveBeenCalledWith({
        received: true,
        eventId: mockEvent.id,
        eventType: mockEvent.type,
      });
    });

    it('should return 400 when raw body is not available', async () => {
      const invalidRequest = {
        body: 'not-a-buffer',
        headers: { 'stripe-signature': 'valid-signature' },
      };

      await controller.handleStripeWebhook(
        invalidRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Raw body requis pour la vérification de signature',
      });
    });

    it('should return 400 when stripe-signature header is missing', async () => {
      const invalidRequest = {
        body: Buffer.from('test'),
        headers: {},
      };

      await controller.handleStripeWebhook(
        invalidRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'En-tête stripe-signature requis',
      });
    });

    it('should return 400 when webhook signature verification fails', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await controller.handleStripeWebhook(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Signature webhook invalide',
      });
    });

    it('should return 500 when webhook secret is not configured', async () => {
      (getStripeWebhookSecret as jest.Mock).mockReturnValue(null);

      await controller.handleStripeWebhook(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Configuration webhook manquante',
      });
    });

    it('should return 500 when service throws an error', async () => {
      service.handleEvent.mockRejectedValue(new Error('Service error'));

      await controller.handleStripeWebhook(
        mockRequest as any,
        mockResponse as any,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Erreur lors du traitement de l'événement",
        eventId: mockEvent.id,
      });
    });

    it('should extract orderId from event metadata correctly', async () => {
      service.handleEvent.mockResolvedValue(true);

      await controller.handleStripeWebhook(
        mockRequest as any,
        mockResponse as any,
      );

      // Vérifier que la méthode privée fonctionne correctement
      const orderId = (controller as any).extractOrderIdFromEvent(mockEvent);
      expect(orderId).toBe('order-123');
    });
  });
});
