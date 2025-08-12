# Sandbox de Test - Webhooks Stripe

Ce document décrit comment tester les webhooks Stripe en local avec Stripe CLI.

## 🚀 **Prérequis**

### **Installation de Stripe CLI**

```bash
# macOS avec Homebrew
brew install stripe/stripe-cli/stripe

# Ou téléchargement direct
# https://github.com/stripe/stripe-cli/releases
```

### **Authentification Stripe CLI**

```bash
# Se connecter à votre compte Stripe
stripe login

# Vérifier la connexion
stripe config --list
```

## 🧪 **Test des Webhooks en Local**

### **1. Démarrer l'écoute des Webhooks**

```bash
# Écouter les webhooks et les rediriger vers votre serveur local
stripe listen --forward-to localhost:3000/webhooks/stripe

# Output attendu:
# > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
# > Forwarding events to http://localhost:3000/webhooks/stripe
```

**⚠️ Important** : Copiez le `webhook signing secret` affiché et mettez-le dans votre `.env` :

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### **2. Déclencher des Événements de Test**

#### **Paiement Réussi**
```bash
# Déclencher un payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Avec des métadonnées personnalisées
stripe trigger payment_intent.succeeded \
  --add payment_intent:metadata.orderId=order_test_123 \
  --add payment_intent:metadata.userId=user_test_456
```

#### **Échec de Paiement**
```bash
# Déclencher un payment_intent.payment_failed
stripe trigger payment_intent.payment_failed

# Avec des métadonnées personnalisées
stripe trigger payment_intent.payment_failed \
  --add payment_intent:metadata.orderId=order_test_123 \
  --add payment_intent:metadata.userId=user_test_456
```

#### **Autres Événements**
```bash
# Remboursement
stripe trigger charge.refunded

# Mise à jour de remboursement
stripe trigger refund.updated

# Événements de dispute
stripe trigger charge.dispute.created
```

### **3. Vérifier les Logs du Serveur**

```bash
# Dans votre terminal de serveur
pnpm dev

# Vous devriez voir des logs comme :
# [WebhooksModule] Webhook Stripe reçu: evt_xxx (payment_intent.succeeded) pour la commande order_test_123
# [WebhooksModule] Événement evt_xxx traité avec succès
```

## 🔍 **Vérification des Résultats**

### **1. Vérifier la Base de Données**

```bash
# Connecter à votre base de données
npx prisma studio

# Vérifier les tables :
# - payments : statut mis à jour
# - orders : statut et QR code généré
# - payment_events : événement enregistré
# - loyalty_logs : points crédités
# - stocks : quantités décrémentées
```

### **2. Vérifier les Réponses HTTP**

```bash
# Les webhooks doivent retourner 200 OK
# Exemple de réponse attendue :
{
  "received": true,
  "eventId": "evt_test_123",
  "eventType": "payment_intent.succeeded"
}
```

## 🛠️ **Débogage des Problèmes**

### **Erreur 400 - Signature Invalide**

```bash
# Vérifier que STRIPE_WEBHOOK_SECRET est correct
echo $STRIPE_WEBHOOK_SECRET

# Redémarrer l'écoute Stripe CLI
stripe listen --forward-to localhost:3000/webhooks/stripe
```

### **Erreur 500 - Traitement Échoué**

```bash
# Vérifier les logs du serveur
# Vérifier que la base de données est accessible
# Vérifier que les tables existent avec le bon schéma
```

### **Webhook Non Reçu**

```bash
# Vérifier que le serveur écoute sur le bon port
# Vérifier que l'URL est correcte
# Vérifier les logs Stripe CLI
```

## 📊 **Scénarios de Test Recommandés**

### **Scénario 1 : Paiement Complet Réussi**
1. Créer une commande via `checkout.createIntent`
2. Déclencher `payment_intent.succeeded`
3. Vérifier :
   - Order → `PAID`
   - Payment → `succeeded`
   - Stock décrémenté
   - QR code généré
   - Points fidélité crédités

### **Scénario 2 : Échec de Paiement**
1. Créer une commande via `checkout.createIntent`
2. Déclencher `payment_intent.payment_failed`
3. Vérifier :
   - Order → `FAILED`
   - Payment → `failed` avec erreurs
   - Stock non modifié

### **Scénario 3 : Déduplication d'Événements**
1. Déclencher le même événement plusieurs fois
2. Vérifier qu'il n'est traité qu'une seule fois
3. Vérifier que `payment_events` contient l'événement

## 🔧 **Configuration Avancée**

### **Variables d'Environnement de Test**

```env
# Mode test Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
STRIPE_API_VERSION=2024-06-20

# Base de données de test
DATABASE_URL="postgresql://..."
```

### **Filtrage des Événements**

```bash
# Écouter seulement certains types d'événements
stripe listen --forward-to localhost:3000/webhooks/stripe \
  --events payment_intent.succeeded,payment_intent.payment_failed

# Écouter avec un compte spécifique
stripe listen --forward-to localhost:3000/webhooks/stripe \
  --account acct_xxxxxxxxxxxxx
```

## 📱 **Test avec l'Interface Mobile**

### **1. Créer une Commande de Test**

```typescript
// Via votre API checkout.createIntent
const paymentData = await trpc.checkout.createIntent.mutate({
  orderId: "order_test_123"
});
```

### **2. Déclencher le Webhook**

```bash
stripe trigger payment_intent.succeeded \
  --add payment_intent:metadata.orderId=order_test_123
```

### **3. Vérifier le Statut**

```typescript
// Via votre API checkout.getStatus
const status = await trpc.checkout.getStatus.query({
  orderId: "order_test_123"
});

// status.orderStatus devrait être "PAID"
// status.qrCodeToken devrait être généré
```

## 🚨 **Limitations et Considérations**

### **Événements de Test**
- Les événements déclenchés par Stripe CLI sont des **simulations**
- Ils ne créent pas de vraies transactions
- Les métadonnées peuvent être limitées

### **Base de Données**
- Assurez-vous d'avoir des données de test valides
- Les commandes et produits doivent exister
- Les relations entre tables doivent être correctes

### **Sécurité**
- Ne jamais utiliser les clés de production en test
- Les webhooks de test ne sont pas signés de la même manière
- Utiliser uniquement en environnement de développement

## 📚 **Ressources Utiles**

- [Documentation Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Guide des Webhooks](https://stripe.com/docs/webhooks)
- [Événements de Test](https://stripe.com/docs/testing#events)
- [Débogage des Webhooks](https://stripe.com/docs/webhooks/debugging)

---

**Note** : Ce sandbox est conçu pour le développement et les tests. En production, utilisez les vrais webhooks Stripe avec les clés live appropriées.
