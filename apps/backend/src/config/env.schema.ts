import { z } from 'zod';

export const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(1),

  // Server
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default(() => 3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Stripe
  STRIPE_SECRET_KEY: z
    .string()
    .min(1)
    .regex(/^sk_(test|live)_/),
  STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1)
    .regex(/^pk_(test|live)_/),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1)
    .regex(/^whsec_/),
  STRIPE_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .default('2024-06-20'),

  // QR Code Security
  QR_SECRET: z.string().min(1),
  QR_TTL_SECONDS: z
    .string()
    .transform(Number)
    .pipe(z.number().positive())
    .default(() => 600),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((e) => e.path.join('.')).join(', ');
      throw new Error(
        `❌ Variables d'environnement manquantes ou invalides: ${missingVars}`,
      );
    }
    throw error;
  }
}
