# Guide de Test - Remboursements Stripe

Ce document décrit comment tester la fonctionnalité de remboursements en local avec Stripe CLI.

## 🚀 **Prérequis**

- Stripe CLI installé et authentifié
- Serveur backend en cours d'exécution
- Base de données configurée avec des commandes de test

## 🧪 **Tests des Remboursements**

### **1. Test de la Mutation tRPC**

#### **Remboursement Total**
```bash
# Via votre client tRPC (exemple avec curl)
curl -X POST http://localhost:3000/trpc/payments.refund \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-test-uuid",
    "reason": "requested_by_customer"
  }'
```

#### **Remboursement Partiel**
```bash
# Remboursement de 10.00 EUR (1000 centimes)
curl -X POST http://localhost:3000/trpc/payments.refund \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order-test-uuid",
    "amountCents": 1000,
    "reason": "duplicate"
  }'
```

### **2. Test des Webhooks de Remboursement**

#### **Écouter les Webhooks**
```bash
# Démarrer l'écoute des webhooks
stripe listen --forward-to localhost:3000/webhooks/stripe

# Output attendu:
# > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### **Déclencher des Événements de Test**

##### **Remboursement Réussi**
```bash
# Créer un remboursement via Stripe CLI
stripe refunds create \
  --payment_intent pi_test_xxx \
  --amount 1000 \
  --reason duplicate

# Déclencher l'événement webhook
stripe trigger charge.refunded
```

##### **Mise à Jour de Remboursement**
```bash
# Déclencher l'événement de mise à jour
stripe trigger refund.updated
```

##### **Remboursement Échoué**
```bash
# Simuler un échec de remboursement
stripe trigger refund.updated \
  --add refund:status=failed \
  --add refund:amount=1000
```

### **3. Vérification des Résultats**

#### **Base de Données**
```bash
# Connecter à votre base de données
npx prisma studio

# Vérifier les tables :
# - refunds : remboursements créés
# - orders : statut mis à jour si remboursement total
# - payment_events : événements webhook enregistrés
```

#### **Logs du Serveur**
```bash
# Dans votre terminal de serveur
# Vous devriez voir des logs comme :
# [PaymentsService] Remboursement créé: refund-xxx pour la commande order-xxx
# [WebhooksModule] Événement charge.refunded traité pour refund-xxx
# [WebhooksModule] Commande order-xxx marquée comme remboursée
```

## 📊 **Scénarios de Test Recommandés**

### **Scénario 1 : Remboursement Total**
1. Créer une commande et la payer
2. Appeler `payments.refund` sans `amountCents`
3. Vérifier que la commande passe au statut `REFUNDED`
4. Vérifier que le total remboursé égale le montant payé

### **Scénario 2 : Remboursement Partiel**
1. Créer une commande et la payer
2. Appeler `payments.refund` avec `amountCents` partiel
3. Vérifier que la commande reste en statut `PAID`
4. Vérifier que le montant remboursable est correctement calculé

### **Scénario 3 : Remboursements Multiples**
1. Créer une commande et la payer
2. Effectuer un premier remboursement partiel
3. Effectuer un second remboursement partiel
4. Vérifier que la commande passe au statut `REFUNDED` après le total

### **Scénario 4 : Gestion des Erreurs**
1. Tenter un remboursement sur une commande non payée
2. Tenter un remboursement d'un montant trop élevé
3. Vérifier que les erreurs appropriées sont retournées

## 🔧 **Commandes Stripe CLI Utiles**

### **Lister les Remboursements**
```bash
# Lister tous les remboursements
stripe refunds list

# Lister les remboursements d'un payment intent
stripe refunds list --payment_intent pi_test_xxx
```

### **Obtenir les Détails d'un Remboursement**
```bash
# Obtenir les détails d'un remboursement
stripe refunds retrieve re_test_xxx
```

### **Annuler un Remboursement**
```bash
# Annuler un remboursement
stripe refunds cancel re_test_xxx
```

## 📱 **Test avec l'Interface Mobile**

### **1. Créer une Commande de Test**
```typescript
// Via votre API checkout.createIntent
const paymentData = await trpc.checkout.createIntent.mutate({
  orderId: "order_test_123"
});
```

### **2. Effectuer le Paiement**
```typescript
// Simuler le paiement via Stripe
await initPaymentSheet({
  paymentIntentClientSecret: paymentData.paymentIntentClientSecret,
  customerId: paymentData.customerId,
  ephemeralKey: paymentData.ephemeralKey,
});
```

### **3. Tester le Remboursement**
```typescript
// Via votre API payments.refund
const refund = await trpc.payments.refund.mutate({
  orderId: "order_test_123",
  amountCents: 1000, // Remboursement partiel
  reason: "duplicate"
});
```

### **4. Vérifier le Statut**
```typescript
// Via votre API checkout.getStatus
const status = await trpc.checkout.getStatus.query({
  orderId: "order_test_123"
});

// status.orderStatus devrait être "PAID" ou "REFUNDED" selon le cas
```

## 🚨 **Limitations et Considérations**

### **Événements de Test**
- Les événements déclenchés par Stripe CLI sont des **simulations**
- Ils ne créent pas de vraies transactions
- Les métadonnées peuvent être limitées

### **Base de Données**
- Assurez-vous d'avoir des données de test valides
- Les commandes et paiements doivent exister
- Les relations entre tables doivent être correctes

### **Sécurité**
- Ne jamais utiliser les clés de production en test
- Les webhooks de test ne sont pas signés de la même manière
- Utiliser uniquement en environnement de développement

## 📚 **Ressources Utiles**

- [Documentation Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Guide des Remboursements](https://stripe.com/docs/refunds)
- [Événements de Test](https://stripe.com/docs/testing#events)
- [API Remboursements](https://stripe.com/docs/api/refunds)

---

**Note** : Ce guide est conçu pour le développement et les tests. En production, utilisez les vrais webhooks Stripe avec les clés live appropriées.
