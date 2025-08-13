# Guide des Opérations de Paiement - Production

Ce document décrit les procédures d'exploitation et de maintenance du système de paiements Stripe en production.

## 🚀 Checklist de Mise en Production

### 1. Vérification Automatisée

Exécutez le script de vérification avant chaque déploiement :

```bash
# Vérifier la configuration des paiements
pnpm check:payments

# Vérifier que tous les tests passent
pnpm test
pnpm test:smoke
```

### 2. Variables d'Environnement

Assurez-vous que votre fichier `.env` contient :

```bash
# Production - Clés LIVE
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_API_VERSION=2024-06-20

# Sécurité
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-key
QR_SECRET=your-super-secure-qr-secret
```

### 3. Configuration Stripe Dashboard

#### Webhooks
1. Allez sur https://dashboard.stripe.com/webhooks
2. Créez un webhook pour votre domaine de production
3. URL : `https://votre-domaine.com/webhooks/stripe`
4. Événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`

#### Apple Pay
1. Allez sur https://dashboard.stripe.com/settings/payment_methods
2. Activez Apple Pay
3. Ajoutez votre domaine de production
4. Téléchargez le fichier de vérification

#### Google Pay
1. Allez sur https://dashboard.stripe.com/settings/payment_methods
2. Activez Google Pay
3. Configurez les paramètres de votre pays

## 📱 Support Apple Pay / Google Pay

### Configuration Mobile

#### React Native (iOS)
```typescript
import { useStripe } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// Vérifier la disponibilité
const checkNativePaySupport = async () => {
  const { applePay, googlePay } = await trpc.stripe.checkNativePayAvailability.query({
    domain: 'votre-domaine.com'
  });
  
  return Platform.OS === 'ios' ? applePay : googlePay;
};

// Initialiser le Payment Sheet
const initializePayment = async (clientSecret: string) => {
  const supportsNativePay = await checkNativePaySupport();
  
  const { error } = await initPaymentSheet({
    paymentIntentClientSecret: clientSecret,
    merchantDisplayName: "Votre Boutique",
    applePay: supportsNativePay && Platform.OS === "ios",
    googlePay: supportsNativePay && Platform.OS === "android",
    style: 'automatic',
    defaultBillingDetails: {
      name: 'Nom Client',
    },
  });

  if (error) {
    console.error('Erreur initialisation:', error);
    return false;
  }

  return true;
};

// Présenter le Payment Sheet
const handlePayment = async () => {
  const { error } = await presentPaymentSheet();
  
  if (error) {
    console.error('Erreur paiement:', error);
  } else {
    console.log('Paiement réussi !');
  }
};
```

#### React Native (Android)
```typescript
// Vérifier Google Pay
import { isGooglePaySupportedAsync } from '@stripe/stripe-react-native';

const checkGooglePaySupport = async () => {
  try {
    return await isGooglePaySupportedAsync();
  } catch (error) {
    console.warn('Google Pay non supporté:', error);
    return false;
  }
};
```

### Test des Paiements Natifs

#### Apple Pay (iOS)
1. **Simulateur iOS** :
   - Utilisez une carte de test Stripe
   - Activez Apple Pay dans les paramètres du simulateur
   - Testez avec `4242 4242 4242 4242`

2. **Device iOS** :
   - Ajoutez une carte de test dans Wallet
   - Testez en conditions réelles

#### Google Pay (Android)
1. **Émulateur Android** :
   - Installez Google Play Services
   - Ajoutez une carte de test
   - Testez avec `4242 4242 4242 4242`

2. **Device Android** :
   - Configurez Google Pay
   - Testez avec une vraie carte

## 📊 Monitoring et Observabilité

### Endpoints de Métriques

#### Résumé des Métriques
```bash
GET /metrics/payments
```

Réponse :
```json
{
  "totalPayments": 150,
  "successCount": 142,
  "failureCount": 8,
  "successRate": "94.67%",
  "averageResponseTime": "0.234s",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

#### Métriques Détaillées
```bash
GET /metrics/payments/detailed
```

#### Métriques Prometheus
```bash
GET /metrics/payments/prometheus
```

#### Santé du Système
```bash
GET /metrics/payments/health
```

### Logs Structurés

Les logs de paiement sont au format JSON et incluent :

```json
{
  "requestId": "pay_1705312200000_abc123def",
  "event": "payment_request_completed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "durationSeconds": "0.234",
  "statusCode": 200,
  "path": "/trpc/stripe.createPaymentIntent",
  "method": "POST",
  "responseSize": 245,
  "success": true
}
```

### Alertes Recommandées

Configurez des alertes pour :

1. **Taux d'échec > 5%** sur 1h
2. **Temps de réponse > 2s** sur 1h
3. **Aucun paiement** pendant 30 minutes
4. **Erreurs Stripe** en série

## 🔧 Maintenance et Dépannage

### Vérifications Quotidiennes

```bash
# Vérifier la santé du système
curl https://votre-domaine.com/metrics/payments/health

# Vérifier les métriques
curl https://votre-domaine.com/metrics/payments

# Vérifier les logs d'erreur
grep "payment_request_error" /var/log/app.log
```

### Problèmes Courants

#### Webhook Non Reçu
1. Vérifier l'URL dans le dashboard Stripe
2. Vérifier que le serveur est accessible
3. Vérifier les logs d'erreur
4. Tester avec `stripe listen --forward-to`

#### Apple Pay / Google Pay Non Disponible
1. Vérifier la configuration dans le dashboard Stripe
2. Vérifier que le domaine est autorisé
3. Tester sur un vrai device
4. Vérifier les logs de disponibilité

#### Paiements Lents
1. Vérifier les métriques de temps de réponse
2. Vérifier la charge du serveur
3. Vérifier la connectivité Stripe
4. Analyser les logs de performance

### Procédures d'Urgence

#### Remboursement en Masse
```bash
# Script de remboursement
pnpm qa:refund:total --order-id=order_123
pnpm qa:refund:partial --order-id=order_123 --amount=1000
```

#### Désactivation des Paiements
1. Mettre le serveur en mode maintenance
2. Rediriger vers une page d'information
3. Notifier l'équipe support
4. Analyser la cause racine

## 📈 Métriques de Performance

### KPIs à Surveiller

- **Taux de succès** : > 95%
- **Temps de réponse moyen** : < 500ms
- **Disponibilité** : > 99.9%
- **Erreurs 5xx** : < 0.1%

### Tableaux de Bord Recommandés

1. **Grafana** avec métriques Prometheus
2. **Datadog** pour les logs et métriques
3. **Stripe Dashboard** pour les métriques business
4. **Logs personnalisés** pour le debugging

## 🔒 Sécurité

### Bonnes Pratiques

1. **Jamais** commiter de clés Stripe dans le code
2. **Toujours** utiliser HTTPS en production
3. **Valider** toutes les entrées utilisateur
4. **Logger** toutes les tentatives de paiement
5. **Monitorer** les tentatives de fraude

### Audit et Conformité

1. **PCI DSS** : Stripe gère la conformité
2. **RGPD** : Logs anonymisés, consentement utilisateur
3. **Audit trail** : Toutes les opérations sont tracées
4. **Backup** : Données sauvegardées quotidiennement

## 📞 Support

### Contacts

- **Développement** : équipe-dev@votre-entreprise.com
- **Opérations** : ops@votre-entreprise.com
- **Stripe Support** : https://support.stripe.com

### Escalade

1. **Niveau 1** : Support technique (réponse < 1h)
2. **Niveau 2** : Développeurs (réponse < 4h)
3. **Niveau 3** : Stripe (réponse < 24h)

### Documentation

- [Guide Stripe](https://stripe.com/docs)
- [API Reference](https://stripe.com/docs/api)
- [Webhooks](https://stripe.com/docs/webhooks)
- [Mobile SDKs](https://stripe.com/docs/mobile)
