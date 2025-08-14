/*
  Warnings:

  - You are about to drop the `loyalty_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."loyalty_logs" DROP CONSTRAINT "loyalty_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."alerts" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."machines" ALTER COLUMN "last_update" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."order_actions" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "loyalty_applied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "points_earned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points_spent" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payment_events" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "updated_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."pickups" ALTER COLUMN "picked_up_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."products" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."refunds" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."restocks" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."stock_reservations" ALTER COLUMN "reserved_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."stocks" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "updated_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."users" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- DropTable
DROP TABLE "public"."loyalty_logs";
