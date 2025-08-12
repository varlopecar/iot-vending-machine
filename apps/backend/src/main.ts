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

  // Configuration CORS pour Stripe
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Configuration du raw body pour les webhooks Stripe
  // IMPORTANT: Doit être AVANT app.use(express.json()) pour conserver le raw buffer
  expressApp.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

  await app.listen(env.PORT);

  console.log(`🚀 Serveur démarré sur le port ${env.PORT}`);
  console.log(`🌍 Environnement: ${env.NODE_ENV}`);
  console.log(
    `💳 Stripe configuré en mode: ${env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`,
  );
}
bootstrap();
