-- Non-destructive patch: add contact column to machines and set default status to OFFLINE
-- Safe to run multiple times
BEGIN;
-- 1) Add contact column if it doesn't exist
ALTER TABLE "machines"
ADD COLUMN IF NOT EXISTS "contact" text;
-- 2) Ensure default for status is OFFLINE for future inserts
-- Works whether status is a text column or a PostgreSQL enum
DO $$ BEGIN BEGIN -- Try with enum cast (common when Prisma maps to a PostgreSQL enum type)
EXECUTE 'ALTER TABLE "machines" ALTER COLUMN "status" SET DEFAULT ''OFFLINE''::"MachineStatus"';
EXCEPTION
WHEN undefined_object THEN -- Fallback if status is a text/varchar column
EXECUTE 'ALTER TABLE "machines" ALTER COLUMN "status" SET DEFAULT ''OFFLINE''';
END;
END $$;
COMMIT;