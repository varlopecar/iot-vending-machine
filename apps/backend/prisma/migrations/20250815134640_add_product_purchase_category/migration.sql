/*
  Warnings:

  - The values [EMPTY] on the enum `AlertType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchase_price` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."AlertType_new" AS ENUM ('LOW_STOCK', 'CRITICAL', 'INCOMPLETE', 'MACHINE_OFFLINE', 'MAINTENANCE_REQUIRED');
ALTER TABLE "public"."alerts" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."alerts" ALTER COLUMN "type" TYPE "public"."AlertType_new" USING ("type"::text::"public"."AlertType_new");
ALTER TYPE "public"."AlertType" RENAME TO "AlertType_old";
ALTER TYPE "public"."AlertType_new" RENAME TO "AlertType";
DROP TYPE "public"."AlertType_old";
ALTER TABLE "public"."alerts" ALTER COLUMN "type" SET DEFAULT 'LOW_STOCK';
COMMIT;

-- AlterTable
ALTER TABLE "public"."alerts" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."loyalty_logs" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."machines" ADD COLUMN     "contact" TEXT,
ALTER COLUMN "status" SET DEFAULT 'OFFLINE',
ALTER COLUMN "last_update" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."order_actions" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "loyalty_applied" BOOLEAN,
ADD COLUMN     "points_earned" INTEGER,
ADD COLUMN     "points_spent" INTEGER,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payment_events" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."payments" ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "updated_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."pickups" ALTER COLUMN "picked_up_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "purchase_price" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT now()::text,
ALTER COLUMN "allergens_list" SET DEFAULT ARRAY[]::TEXT[];

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

-- CreateIndex
CREATE INDEX "alerts_machine_id_type_is_active_idx" ON "public"."alerts"("machine_id", "type", "is_active");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "public"."products"("category");
