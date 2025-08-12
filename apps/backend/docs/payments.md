# Système de Paiements - Intégration Stripe

Ce document décrit l'implémentation du système de paiements in-app utilisant Stripe dans notre plateforme de machines à vendre connectées.

## 🏗️ Architecture

Le système de paiements est construit autour de Stripe et s'intègre parfaitement avec notre architecture tRPC et NestJS existante.

### Composants

- **StripeService** : Service principal gérant les interactions avec l'API Stripe
- **StripeRouter** : Router tRPC exposant les endpoints de paiement
- **StripeClient** : Client Stripe singleton configuré
- **Validation d'environnement** : Schéma Zod pour valider les variables d'environnement

### Schéma de Base de Données

Le système utilise un schéma robuste avec des snapshots immuables :

```
Order (1:1) Payment (1:N) PaymentEvent
     |              |              |
     |              |              |
     |              |              |
  OrderItem      Refund         JSON Payload
     |
  Snapshot immuable
  (prix, nom produit)
```

#### Tables Principales

- **orders** : Commandes avec montants et statuts de paiement
- **order_items** : Items avec snapshots immuables des prix
- **payments** : Transactions Stripe avec statuts détaillés
- **payment_events** : Historique complet des événements Stripe
- **refunds** : Gestion des remboursements

## 🔑 Variables d'Environnement Requises

### Configuration Stripe

```bash
# Clé secrète Stripe (obligatoire)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...

# Clé publique Stripe (obligatoire)
STRIPE_PUBLISHABLE_KEY=pk_test_... ou pk_live_...

# Secret webhook Stripe (obligatoire)
STRIPE_WEBHOOK_SECRET=whsec_...

# Version API Stripe (optionnel, défaut: 2024-06-20)
STRIPE_API_VERSION=2024-06-20
```

### Obtention des Clés

1. **Dashboard Stripe** : https://dashboard.stripe.com/apikeys
2. **Mode Test** : Utilisez les clés commençant par `sk_test_` et `pk_test_`
3. **Mode Production** : Utilisez les clés commençant par `sk_live_` et `pk_live_`
4. **Webhook Secret** : Configurez un webhook dans votre dashboard Stripe

## 📡 Endpoints tRPC Disponibles

### Création d'Intention de Paiement

```typescript
// POST /trpc/stripe.createPaymentIntent
{
  amount: 2500, // 25.00 EUR en centimes
  currency: "eur",
  metadata: {
    order_id: "order_123",
    user_id: "user_456",
    machine_id: "machine_789"
  }
}
```

### Gestion des Paiements

- `stripe.createPaymentIntent` - Crée une intention de paiement
- `stripe.getPaymentIntent` - Récupère le statut d'un paiement
- `stripe.confirmPaymentIntent` - Confirme un paiement
- `stripe.cancelPaymentIntent` - Annule un paiement

## 🔄 Flux de Paiement

### 1. Création de la Commande
1. L'utilisateur sélectionne des produits
2. Le système crée une commande avec statut "PENDING"
3. **Snapshots immuables** : Les prix et noms des produits sont sauvegardés
4. Une intention de paiement Stripe est créée

### 2. Paiement Client
1. L'application mobile récupère le `client_secret`
2. Le client confirme le paiement via Stripe
3. Stripe traite le paiement et envoie un webhook

### 3. Confirmation
1. Le webhook Stripe met à jour le statut de la commande
2. Le stock est décrementé
3. La commande passe au statut "PAID"

### 4. Gestion des Événements
- **PaymentEvent** : Chaque événement Stripe est enregistré avec le payload complet
- **Refunds** : Gestion automatique des remboursements
- **Audit Trail** : Traçabilité complète de toutes les opérations

### Statuts de Commande Supportés
- `PENDING` : Commande créée, en attente de paiement
- `REQUIRES_PAYMENT` : Paiement initié, en attente de confirmation
- `PAID` : Paiement confirmé, commande active
- `FAILED` : Échec du paiement
- `CANCELLED` : Commande annulée
- `EXPIRED` : Commande expirée
- `REFUNDED` : Commande remboursée

## 🛡️ Sécurité

### Validation des Données
- Toutes les entrées sont validées avec Zod
- Les montants sont vérifiés côté serveur
- Les métadonnées sont validées avant envoi à Stripe

### Gestion des Erreurs
- Erreurs Stripe standardisées et localisées
- Logs détaillés pour le debugging
- Gestion gracieuse des échecs de paiement

### Webhooks
- Validation des signatures webhook Stripe
- Protection contre les attaques de rejeu
- Traitement asynchrone des événements

## 🧪 Tests

### Tests Unitaires
```bash
pnpm test stripe
```

### Tests d'Intégration
```bash
pnpm test:e2e stripe
```

### Tests Stripe
- Utilisez les cartes de test Stripe
- Testez les différents scénarios d'échec
- Vérifiez la gestion des webhooks

## 🗄️ Gestion de la Base de Données

### Migration et Backfill

```bash
# Appliquer la migration
pnpm migrate:dev

# Remplir les nouvelles colonnes avec les données existantes
pnpm db:backfill:payments

# Vérifier les contraintes
pnpm db:verify:constraints
```

### Snapshots Immuables

Les `order_items` conservent des **snapshots immuables** des produits :
- **unit_price_cents** : Prix unitaire au moment de la commande (en centimes)
- **label** : Nom du produit au moment de la commande
- **subtotal_cents** : Sous-total calculé (prix × quantité)

**Avantages** :
- Stabilité des prix même si le produit change
- Audit trail complet des transactions
- Calculs de remboursement précis
- Conformité réglementaire

## 📱 Intégration Mobile

### React Native
```typescript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// Initialiser le paiement
const { error } = await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
});

// Présenter l'interface de paiement
const { error } = await presentPaymentSheet();
```

### Configuration Mobile
- Installez `@stripe/stripe-react-native`
- Configurez les clés publiques
- Gérez les callbacks de paiement

## 🚀 Déploiement

### Prérequis
1. Compte Stripe actif
2. Clés API configurées
3. Webhooks configurés
4. Variables d'environnement définies

### Étapes
1. Configurez les variables d'environnement
2. Testez avec les clés de test
3. Passez en production avec les clés live
4. Configurez les webhooks de production

## 📊 Monitoring

### Métriques à Surveiller
- Taux de succès des paiements
- Temps de traitement des webhooks
- Erreurs de paiement fréquentes
- Performance des API Stripe

### Logs
- Tous les événements de paiement sont loggés
- Erreurs détaillées avec contexte
- Traçabilité complète des transactions

## 🔧 Maintenance

### Mises à Jour Stripe
- Surveillez les changements d'API
- Testez les nouvelles versions
- Mettez à jour `STRIPE_API_VERSION` si nécessaire

### Rotation des Clés
- Changez régulièrement les clés secrètes
- Mettez à jour les webhooks
- Testez après chaque rotation

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Testing](https://stripe.com/docs/testing)
- [Security](https://stripe.com/docs/security)
