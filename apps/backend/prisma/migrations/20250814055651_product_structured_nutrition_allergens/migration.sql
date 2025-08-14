-- AlterTable
ALTER TABLE "public"."alerts" ALTER COLUMN "created_at" SET DEFAULT now()::text;

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
ALTER TABLE "public"."products" ADD COLUMN     "allergens_list" TEXT[],
ADD COLUMN     "ingredients_list" TEXT[],
ADD COLUMN     "nutritional" JSONB,
ALTER COLUMN "created_at" SET DEFAULT now()::text;

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
