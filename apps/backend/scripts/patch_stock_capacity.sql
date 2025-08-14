-- Harmonise les capacités de slots et corrige les quantités dépassant la capacité
-- 1) Mettre max_capacity à 20 pour les slots laissés à 4 (héritage ancien code)
UPDATE "stocks"
SET "max_capacity" = 20
WHERE "max_capacity" = 4;
-- 2) S'assurer que quantity <= max_capacity
UPDATE "stocks"
SET "quantity" = "max_capacity"
WHERE "quantity" > "max_capacity";