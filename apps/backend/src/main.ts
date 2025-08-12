import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.schema';

async function bootstrap() {
  // Valider les variables d'environnement au démarrage
  const env = validateEnv();
  
  const app = await NestFactory.create(AppModule);
  
  // Configuration CORS pour Stripe
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  await app.listen(env.PORT);
  
  console.log(`🚀 Serveur démarré sur le port ${env.PORT}`);
  console.log(`🌍 Environnement: ${env.NODE_ENV}`);
  console.log(`💳 Stripe configuré en mode: ${env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
}
bootstrap();
