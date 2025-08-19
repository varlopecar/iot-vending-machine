// Configuration dotenv en premier
import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.schema';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

async function bootstrap() {
  // Valider les variables d'environnement au démarrage
  const env = validateEnv();

  // Créer l'application avec Express adapter pour configurer le raw body
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

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
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    credentials: true,
  });

  // Configuration du raw body pour les webhooks Stripe
  // IMPORTANT: Doit être AVANT app.use(express.json()) pour conserver le raw buffer
  expressApp.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

  await app.listen(env.PORT);


}
bootstrap();
