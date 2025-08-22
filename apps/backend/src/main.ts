// Configuration dotenv en premier
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.schema';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('🔧 Starting application bootstrap...');
  console.log('🔧 Node.js version:', process.version);
  console.log('🔧 Environment PORT:', process.env.PORT);
  console.log('🔧 Environment NODE_ENV:', process.env.NODE_ENV);
  
  // Valider les variables d'environnement au démarrage
  const env = validateEnv();
  console.log('✅ Environment validation successful, PORT:', env.PORT);

  // Créer l'application avec Express adapter pour configurer le raw body
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('IoT Vending Machine API')
    .setDescription(
      'REST API for IoT Vending Machine platform - Order management, payments, and machine operations',
    )
    .setVersion('1.0')
    .addTag('health', 'Health check endpoints')
    .addTag('order-delivery', 'Order delivery and pickup management')
    .addTag('order-validation', 'QR code validation and order status')
    .addTag('card-payment', 'Credit card payment processing')
    .addTag('webhooks', 'Stripe webhook handling')
    .addTag('metrics', 'Payment metrics and monitoring')
    .addBearerAuth()
    .build();

  // Enable validation pipe for automatic validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Configuration CORS restrictive selon recommandations OWASP
  const allowedOrigins = [
    'http://localhost:3001', // Back-office Next.js
    'https://iot-vending-machine-web.vercel.app', // Back-office production
    // Expo development
    'http://localhost:8081',
    'http://localhost:19000',
    'http://localhost:19006',
    // EAS builds - à adapter selon votre configuration
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origin (mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS: Origin non autorisée: ${origin}`);
        callback(new Error('Origin non autorisée par la politique CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],
    credentials: true,
  });

  // Configuration du raw body pour les webhooks Stripe
  // IMPORTANT: Doit être AVANT app.use(express.json()) pour conserver le raw buffer
  expressApp.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

  await app.listen(env.PORT);

  console.log(`🚀 Application is running on: http://localhost:${env.PORT}`);
  console.log(
    `📚 Swagger documentation available at: http://localhost:${env.PORT}/api-docs`,
  );
}
bootstrap();
