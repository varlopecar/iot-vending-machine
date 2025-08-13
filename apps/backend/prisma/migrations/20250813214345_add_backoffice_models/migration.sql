/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `products` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CUSTOMER', 'OPERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."AlertType" AS ENUM ('LOW_STOCK', 'EMPTY', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED');

-- CreateEnum
CREATE TYPE "public"."AlertLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "public"."AlertStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');

-- AlterTable
ALTER TABLE "public"."loyalty_logs" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."machines" ADD COLUMN     "created_at" TEXT NOT NULL DEFAULT now()::text,
ADD COLUMN     "last_sync_at" TEXT,
ALTER COLUMN "last_update" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."order_actions" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."orders" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payment_events" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "updated_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."pickups" ALTER COLUMN "picked_up_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "created_at" TEXT NOT NULL DEFAULT now()::text,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "public"."refunds" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."stock_reservations" ALTER COLUMN "reserved_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."stocks" ADD COLUMN     "created_at" TEXT NOT NULL DEFAULT now()::text,
ADD COLUMN     "low_threshold" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "max_capacity" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "updated_at" TEXT NOT NULL DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'CUSTOMER',
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- CreateTable
CREATE TABLE "public"."restocks" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TEXT NOT NULL DEFAULT now()::text,
    "notes" TEXT,

    CONSTRAINT "restocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."restock_items" (
    "id" TEXT NOT NULL,
    "restock_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "quantity_before" INTEGER NOT NULL,
    "quantity_after" INTEGER NOT NULL,
    "quantity_added" INTEGER NOT NULL,

    CONSTRAINT "restock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "machine_id" TEXT NOT NULL,
    "type" "public"."AlertType" NOT NULL DEFAULT 'LOW_STOCK',
    "message" TEXT NOT NULL,
    "level" "public"."AlertLevel" NOT NULL DEFAULT 'WARNING',
    "status" "public"."AlertStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TEXT NOT NULL DEFAULT now()::text,
    "resolved_at" TEXT,
    "metadata" JSONB,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "restocks_machine_id_created_at_idx" ON "public"."restocks"("machine_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "restock_items_restock_id_idx" ON "public"."restock_items"("restock_id");

-- CreateIndex
CREATE INDEX "alerts_machine_id_status_created_at_idx" ON "public"."alerts"("machine_id", "status", "created_at" DESC);

-- CreateIndex
CREATE INDEX "alerts_type_status_idx" ON "public"."alerts"("type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "public"."products"("sku");

-- AddForeignKey
ALTER TABLE "public"."restocks" ADD CONSTRAINT "restocks_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restocks" ADD CONSTRAINT "restocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restock_items" ADD CONSTRAINT "restock_items_restock_id_fkey" FOREIGN KEY ("restock_id") REFERENCES "public"."restocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."restock_items" ADD CONSTRAINT "restock_items_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "public"."machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
