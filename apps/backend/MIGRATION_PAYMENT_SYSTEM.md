# Guide de Migration - Système de Paiement

Ce document guide la migration vers le nouveau système de paiement robuste avec Stripe.

## 🎯 Objectifs de la Migration

- Ajouter le support des paiements Stripe
- Implémenter des snapshots immuables pour la stabilité des prix
- Créer un audit trail complet des transactions
- Maintenir la compatibilité avec les données existantes

## 📋 Prérequis

- Base de données PostgreSQL accessible
- Prisma CLI installé
- Variables d'environnement configurées
- Sauvegarde de la base de données (recommandé)

## 🚀 Étapes de Migration

### 1. Préparation

```bash
# Vérifier que le schéma Prisma compile
npx prisma validate

# Créer une sauvegarde (optionnel mais recommandé)
pg_dump your_database > backup_before_migration.sql
```

### 2. Application de la Migration

```bash
# Appliquer la migration Prisma
pnpm migrate:dev

# Ou appliquer manuellement le script SQL
psql your_database < scripts/migrate_payment_system.sql
```

### 3. Backfill des Données

```bash
# Remplir les nouvelles colonnes avec les données existantes
pnpm db:backfill:payments
```

### 4. Vérification

```bash
# Vérifier que toutes les contraintes sont en place
pnpm db:verify:constraints

# Régénérer le client Prisma
npx prisma generate
```

## 🔍 Vérifications Post-Migration

### Contraintes de Base de Données

- ✅ `stocks.quantity >= 0` (CHECK constraint)
- ✅ `stocks(machine_id, slot_number)` (UNIQUE constraint)
- ✅ `orders(stripe_payment_intent_id)` (UNIQUE constraint)
- ✅ `payments(stripe_payment_intent_id)` (UNIQUE constraint)

### Données

- ✅ Tous les `order_items` ont `unit_price_cents > 0`
- ✅ Tous les `order_items` ont `subtotal_cents > 0`
- ✅ Tous les `orders` ont `amount_total_cents > 0`
- ✅ Tous les `orders` ont `currency` défini

### Index

- ✅ `orders(user_id, created_at DESC)`
- ✅ `orders(stripe_payment_intent_id)`
- ✅ `payment_events(stripe_event_id)`
- ✅ `payments(stripe_payment_intent_id)`

## 🚨 Gestion des Erreurs

### Erreurs de Contraintes

Si des erreurs de contraintes surviennent :

```bash
# Vérifier les données problématiques
pnpm db:verify:constraints

# Corriger manuellement si nécessaire
# Puis relancer le backfill
pnpm db:backfill:payments
```

### Conflits de Slots

Si des conflits de slots sont détectés :

```sql
-- Identifier les conflits
SELECT machine_id, slot_number, COUNT(*) 
FROM stocks 
GROUP BY machine_id, slot_number 
HAVING COUNT(*) > 1;

-- Résoudre en modifiant les slot_number
UPDATE stocks SET slot_number = new_slot_number WHERE id = 'stock_id';
```

### Quantités Négatives

Si des quantités négatives sont détectées :

```sql
-- Corriger les quantités négatives
UPDATE stocks SET quantity = 0 WHERE quantity < 0;
```

## 🔄 Rollback (si nécessaire)

### Annuler la Migration

```bash
# Restaurer la sauvegarde
psql your_database < backup_before_migration.sql

# Ou utiliser la migration de rollback Prisma
npx prisma migrate reset
```

## 📊 Impact sur les Performances

### Avantages

- **Requêtes optimisées** : Index sur les colonnes fréquemment utilisées
- **Snapshots immuables** : Pas de jointures complexes pour les prix historiques
- **Audit trail** : Traçabilité complète sans impact sur les performances

### Considérations

- **Taille des tables** : Les nouvelles tables peuvent augmenter la taille de la DB
- **Index** : Les nouveaux index peuvent ralentir légèrement les insertions
- **Contraintes** : Les CHECK constraints ajoutent une validation côté base

## 🧪 Tests Post-Migration

### Tests Automatiques

```bash
# Tests unitaires
pnpm test

# Tests d'intégration
pnpm test:e2e

# Tests spécifiques au système de paiement
pnpm test stripe
```

### Tests Manuels

1. **Créer une commande** et vérifier les snapshots
2. **Simuler un paiement** Stripe
3. **Vérifier les événements** dans `payment_events`
4. **Tester les remboursements**

## 📚 Documentation

- **Schéma Prisma** : `prisma/schema.prisma`
- **Documentation des paiements** : `docs/payments.md`
- **Scripts de migration** : `scripts/`
- **Guide d'utilisation** : `src/stripe/README.md`

## 🆘 Support

En cas de problème :

1. Vérifiez les logs de migration
2. Consultez `pnpm db:verify:constraints`
3. Vérifiez la documentation Prisma
4. Contactez l'équipe de développement

## ✅ Checklist de Migration

- [ ] Sauvegarde de la base de données
- [ ] Migration Prisma appliquée
- [ ] Backfill des données terminé
- [ ] Vérification des contraintes
- [ ] Client Prisma régénéré
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] Équipe formée au nouveau système
