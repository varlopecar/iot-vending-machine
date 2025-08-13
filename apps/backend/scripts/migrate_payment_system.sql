-- Migration: Ajout du système de paiement robuste
-- Date: $(date)
-- Description: Étend le schéma pour supporter Stripe, snapshots et événements de paiement

BEGIN;

-- 1. Ajout de stripe_customer_id à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR NULL;

-- 2. Ajout des nouveaux champs à la table orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS amount_total_cents INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency VARCHAR(3) NOT NULL DEFAULT 'EUR';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS receipt_url TEXT NULL;

-- 3. Ajout de la contrainte unique sur stripe_payment_intent_id
ALTER TABLE orders ADD CONSTRAINT orders_stripe_payment_intent_id_key UNIQUE (stripe_payment_intent_id);

-- 4. Ajout des snapshots immuables à order_items
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_price_cents INT NOT NULL DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS label VARCHAR NULL;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal_cents INT NOT NULL DEFAULT 0;

-- 5. Ajout de la contrainte unique sur (machine_id, slot_number) pour stocks
ALTER TABLE stocks ADD CONSTRAINT stocks_machine_id_slot_number_key UNIQUE (machine_id, slot_number);

-- 6. Ajout de la contrainte CHECK sur quantity >= 0 pour stocks
ALTER TABLE stocks ADD CONSTRAINT stocks_quantity_check CHECK (quantity >= 0);

-- 7. Création de la table payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL UNIQUE,
    stripe_payment_intent_id VARCHAR NOT NULL UNIQUE,
    amount_cents INT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    status VARCHAR NOT NULL,
    last_error_code VARCHAR NULL,
    last_error_message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- 8. Création de la table payment_events
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    stripe_event_id VARCHAR NOT NULL UNIQUE,
    type VARCHAR NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_payment_events_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 9. Création de la table refunds
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL,
    stripe_refund_id VARCHAR NOT NULL UNIQUE,
    amount_cents INT NOT NULL,
    status VARCHAR NOT NULL,
    reason VARCHAR NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    
    CONSTRAINT fk_refunds_payment_id FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

-- 10. Ajout des index pour les performances
CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_stripe_event_id ON payment_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- 11. Ajout de la contrainte de clé étrangère pour la relation Order -> Payment
ALTER TABLE orders ADD CONSTRAINT fk_orders_payment_id FOREIGN KEY (stripe_payment_intent_id) REFERENCES payments(stripe_payment_intent_id) ON DELETE SET NULL;

COMMIT;

-- Vérification des contraintes
DO $$
BEGIN
    -- Vérifier que toutes les contraintes sont en place
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocks_quantity_check'
    ) THEN
        RAISE EXCEPTION 'Contrainte stocks_quantity_check manquante';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stocks_machine_id_slot_number_key'
    ) THEN
        RAISE EXCEPTION 'Contrainte stocks_machine_id_slot_number_key manquante';
    END IF;
    
    RAISE NOTICE 'Migration terminée avec succès - Toutes les contraintes sont en place';
END $$;
