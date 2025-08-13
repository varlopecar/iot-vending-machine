-- DropForeignKey
ALTER TABLE "public"."restocks" DROP CONSTRAINT "restocks_user_id_fkey";

-- DropIndex
DROP INDEX "public"."stocks_machine_id_product_id_key";

-- AlterTable
ALTER TABLE "public"."alerts" ADD COLUMN     "stock_id" TEXT,
ALTER COLUMN "message" DROP NOT NULL,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."loyalty_logs" ALTER COLUMN "created_at" SET DEFAULT now()::text;

-- AlterTable
ALTER TABLE "public"."machines" ALTER COLUMN "last_update" SET DEFAULT now()::text,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

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

-- CreateIndex
CREATE INDEX "alerts_stock_id_status_idx" ON "public"."alerts"("stock_id", "status");

-- CreateIndex
CREATE INDEX "stocks_machine_id_product_id_idx" ON "public"."stocks"("machine_id", "product_id");

-- AddForeignKey
ALTER TABLE "public"."restocks" ADD CONSTRAINT "restocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "public"."stocks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
