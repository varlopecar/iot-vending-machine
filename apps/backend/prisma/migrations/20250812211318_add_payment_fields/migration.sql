/*
  Warnings:

  - You are about to drop the column `updated_at` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."loyalty_logs" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."machines" ALTER COLUMN "last_update" SET DEFAULT now()::text,
ALTER COLUMN "last_update" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."order_actions" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "updated_at",
ALTER COLUMN "paid_at" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."payment_events" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT,
ALTER COLUMN "updated_at" SET DEFAULT now()::text,
ALTER COLUMN "updated_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."pickups" ALTER COLUMN "picked_up_at" SET DEFAULT now()::text,
ALTER COLUMN "picked_up_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."refunds" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."stock_reservations" ALTER COLUMN "reserved_at" SET DEFAULT now()::text,
ALTER COLUMN "reserved_at" SET DATA TYPE TEXT,
ALTER COLUMN "expires_at" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DATA TYPE TEXT;
