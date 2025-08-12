# Module Stripe - Guide d'Utilisation

Ce module implémente l'intégration Stripe pour les paiements in-app dans notre plateforme de machines à vendre.

## 🚀 Démarrage Rapide

### 1. Configuration des Variables d'Environnement

Créez un fichier `.env` basé sur `env.example` :

```bash
cp env.example .env
```

Configurez vos clés Stripe :

```bash
# Clés de test (développement)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-06-20
```

### 2. Test de la Configuration

```bash
# Vérifier la compilation
pnpm build

# Démarrer le serveur
pnpm dev
```

Vous devriez voir :
```
✅ Client Stripe initialisé avec succès
📊 Version API: 2024-06-20
🔑 Mode: TEST
💳 Stripe configuré en mode: TEST
```

## 📡 Utilisation des Endpoints

### Créer une Intention de Paiement

```typescript
// Via tRPC
const result = await trpc.stripe.createPaymentIntent.mutate({
  amount: 2500, // 25.00 EUR
  currency: "eur",
  metadata: {
    order_id: "order_123",
    user_id: "user_456", 
    machine_id: "machine_789"
  }
});

// Résultat
{
  id: "pi_...",
  client_secret: "pi_..._secret_...",
  amount: 2500,
  currency: "eur",
  status: "requires_payment_method",
  metadata: { ... }
}
```

### Gérer un Paiement

```typescript
// Récupérer le statut
const payment = await trpc.stripe.getPaymentIntent.query({ id: "pi_..." });

// Confirmer le paiement
await trpc.stripe.confirmPaymentIntent.mutate({ id: "pi_..." });

// Annuler le paiement
await trpc.stripe.cancelPaymentIntent.mutate({ id: "pi_..." });
```

## 🔧 Intégration avec les Commandes

### Flux Complet

1. **Création de commande** → Statut "PENDING"
2. **Création intention de paiement** → Stripe
3. **Paiement client** → Application mobile
4. **Webhook Stripe** → Mise à jour statut
5. **Confirmation** → Statut "ACTIVE", stock décrementé

### Exemple d'Intégration

```typescript
// Dans OrdersService
async createOrderWithPayment(orderData: CreateOrderInput) {
  // 1. Créer la commande
  const order = await this.createOrder(orderData);
  
  // 2. Créer l'intention de paiement
  const paymentIntent = await this.stripeService.createPaymentIntent({
    amount: await this.calculateOrderTotal(order.items),
    currency: 'eur',
    metadata: {
      order_id: order.id,
      user_id: order.user_id,
      machine_id: order.machine_id
    }
  });
  
  // 3. Retourner la commande avec le client_secret
  return {
    ...order,
    payment: {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id
    }
  };
}
```

## 🧪 Tests

### Tests Unitaires

```bash
# Tester le module Stripe
pnpm test stripe

# Tester un service spécifique
pnpm test stripe.service
```

### Tests d'Intégration

```bash
# Tests end-to-end
pnpm test:e2e stripe
```

### Données de Test Stripe

Utilisez les cartes de test Stripe :

- **Succès** : `4242 4242 4242 4242`
- **Échec** : `4000 0000 0000 0002`
- **3D Secure** : `4000 0025 0000 3155`

## 🛡️ Sécurité

### Validation des Données

- Toutes les entrées sont validées avec Zod
- Les montants sont vérifiés côté serveur
- Les métadonnées sont validées avant envoi à Stripe

### Gestion des Erreurs

- Erreurs Stripe standardisées
- Logs détaillés pour le debugging
- Gestion gracieuse des échecs

## 📱 Intégration Mobile

### React Native

```bash
# Installer le package Stripe
pnpm add @stripe/stripe-react-native
```

### Configuration

```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

// Dans votre App.tsx
<StripeProvider publishableKey="pk_test_...">
  <YourApp />
</StripeProvider>
```

### Utilisation

```typescript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// Initialiser le paiement
const { error } = await initPaymentSheet({
  paymentIntentClientSecret: clientSecret,
});

// Présenter l'interface
const { error } = await presentPaymentSheet();
```

## 🔍 Debugging

### Logs Stripe

Le module logge automatiquement :
- Initialisation du client
- Création d'intentions de paiement
- Erreurs et exceptions

### Mode Développement

En mode développement, vous verrez :
- Détails des requêtes Stripe
- Validation des variables d'environnement
- Statut de la configuration

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Testing Guide](https://stripe.com/docs/testing)
- [Webhooks](https://stripe.com/docs/webhooks)

## 🆘 Support

En cas de problème :

1. Vérifiez les variables d'environnement
2. Consultez les logs du serveur
3. Testez avec les cartes de test Stripe
4. Vérifiez la configuration webhook
