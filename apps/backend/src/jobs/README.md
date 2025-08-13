# 🔄 Module Jobs - Tâches Planifiées

Ce module gère les tâches planifiées automatiques pour la maintenance et le nettoyage du système de vente automatique.

## 🎯 Vue d'ensemble

Le module Jobs implémente deux tâches principales planifiées :

1. **Expiration des commandes non payées** - Exécuté toutes les 5 minutes
2. **Nettoyage des PaymentIntents obsolètes** - Exécuté tous les dimanches à 03:00

## 🏗️ Architecture

### Composants

- **JobsModule** - Module principal avec configuration des tâches planifiées
- **JobsService** - Service principal gérant l'exécution des jobs
- **ExpireStaleOrdersJob** - Job d'expiration des commandes
- **CleanupStalePaymentIntentsJob** - Job de nettoyage des paiements
- **JobsRouter** - Endpoints tRPC pour l'exécution manuelle
- **MetricsService** - Service de métriques pour le monitoring
- **utils.ts** - Utilitaires pour le traitement par lots

### Dépendances

- **@nestjs/schedule** - Planification des tâches
- **PrismaModule** - Accès à la base de données
- **StripeModule** - Gestion des paiements Stripe
- **InventoryModule** - Gestion des réservations de stock

## ⚙️ Configuration

### Planification

```typescript
// Expiration des commandes - Toutes les 5 minutes
@Cron(CronExpression.EVERY_5_MINUTES, {
  name: 'expire-stale-orders',
  timeZone: 'Europe/Paris',
})

// Nettoyage des PIs - Dimanche 03:00
@Cron('0 3 * * 0', {
  name: 'cleanup-stale-payment-intents',
  timeZone: 'Europe/Paris',
})
```

### Fuseau horaire

Tous les jobs utilisent le fuseau **Europe/Paris** pour la cohérence avec l'exploitation.

## 🔧 Utilisation

### Exécution automatique

Les jobs s'exécutent automatiquement selon leur planification. Aucune intervention manuelle n'est requise.

### Exécution manuelle

#### Via tRPC

```typescript
// Récupérer le statut des jobs
const status = await trpc.jobs.getJobsStatus.query();

// Exécuter manuellement le job d'expiration
const result = await trpc.jobs.runExpireStaleOrdersManually.mutate();

// Récupérer les métriques
const metrics = await trpc.jobs.getJobMetrics.query();
```

#### Via scripts NPM

```bash
# Job d'expiration
pnpm jobs:run:expire

# Job de nettoyage
pnpm jobs:run:cleanup
```

## 📊 Monitoring

### Métriques disponibles

- `paymentsExpiredTotal` - Nombre total de commandes expirées
- `paymentIntentsCanceledTotal` - Nombre total de PIs annulés
- `stockReleasedTotal` - Nombre total d'unités de stock libérées
- `jobExecutionTime` - Temps d'exécution du dernier job
- `lastExecutionTime` - Timestamp de la dernière exécution

### Logs structurés

Chaque exécution de job génère des logs détaillés incluant :
- Nombre d'éléments traités
- Temps d'exécution
- Erreurs rencontrées
- Actions effectuées

## 🧪 Tests

### Tests unitaires

```bash
# Tous les tests du module
pnpm test src/jobs

# Tests spécifiques
pnpm test src/jobs/metrics.service.spec.ts
pnpm test src/jobs/jobs.router.spec.ts
```

### Tests d'intégration

```bash
# Tests des jobs complets
pnpm test src/jobs/__tests__/expire-stale-orders.job.spec.ts
pnpm test src/jobs/__tests__/cleanup-stale-payment-intents.job.spec.ts
```

## 🚨 Gestion des erreurs

### Stratégies de retry

- **Erreurs temporaires** : Retry automatique avec backoff exponentiel
- **Erreurs permanentes** : Logging et notification
- **Erreurs Stripe** : Synchronisation manuelle si nécessaire

### Monitoring des échecs

- Logs d'erreur structurés
- Métriques d'échec
- Alertes en cas de problème répété

## 🔒 Sécurité

### Contrôles d'accès

- Les endpoints tRPC sont protégés par l'authentification
- Seuls les utilisateurs autorisés peuvent exécuter les jobs manuellement
- Validation des entrées et sorties avec Zod

### Protection des données

- Traitement par lots pour éviter la surcharge
- Transactions Prisma pour la cohérence
- Rollback automatique en cas d'erreur

## 📚 Documentation

- **payments-ops.md** - Documentation d'exploitation complète
- **API_ROUTES.md** - Documentation des endpoints tRPC
- **README.md** - Ce fichier

## 🆘 Support

### En cas de problème

1. **Vérifier les logs** : `tail -f logs/application.log | grep "jobs"`
2. **Tester manuellement** : Utiliser les endpoints tRPC
3. **Vérifier la base** : Contrôler l'intégrité des données
4. **Contacter l'équipe** : En cas de problème persistant

### Maintenance

- **Surveillance quotidienne** : Vérifier l'exécution normale
- **Surveillance hebdomadaire** : Analyser les performances
- **Surveillance mensuelle** : Optimiser et ajuster
