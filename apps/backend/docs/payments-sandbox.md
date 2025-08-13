# 🧪 Guide QA - Tests Paiements Sandbox Stripe

## 🎯 Objectif

Ce guide permet de tester complètement l'intégration Stripe en environnement sandbox, incluant tous les scénarios de paiement, 3DS, échecs et remboursements.

## 📋 Prérequis

### **1. Installation Stripe CLI**
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
# Télécharger depuis https://github.com/stripe/stripe-cli/releases

# Linux
# Suivre les instructions sur https://stripe.com/docs/stripe-cli
```

### **2. Connexion Stripe**
```bash
stripe login
# Suivre les instructions pour s'authentifier
```

### **3. Variables d'Environnement**
```bash
# .env.local ou .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
QR_SECRET_KEY=qr_secret_key_here
```

### **4. URL Webhook**
```
http://localhost:3000/webhooks/stripe
```

## 🚀 Démarrage Rapide

### **1. Lancer l'Application**
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Webhooks Stripe
stripe listen --forward-to http://localhost:3000/webhooks/stripe
```

### **2. Vérifier la Connexion**
```bash
# Tester la connexion Stripe
stripe balance retrieve

# Vérifier les webhooks
stripe webhook endpoints list
```

## 💳 Cartes de Test Stripe

### **Cartes de Succès**
| Numéro | Type | Comportement |
|---------|------|--------------|
| `4242 4242 4242 4242` | Visa | Succès immédiat, aucun 3DS |
| `4000 0027 6000 3184` | Visa | 3DS requis (authentification) |
| `4000 0000 0000 3220` | Visa | 3DS requis (challenge) |

### **Cartes d'Échec**
| Numéro | Type | Comportement |
|---------|------|--------------|
| `4000 0000 0000 9995` | Visa | Fonds insuffisants |
| `4000 0000 0000 0002` | Visa | Paiement refusé |
| `4000 0000 0000 0341` | Visa | Attachée à un compte fermé |

### **Informations de Test**
- **Date d'expiration** : `12/25`
- **CVC** : `123`
- **Code postal** : `12345`

## 🔄 Scénarios de Test

### **Scénario 1 : Paiement Simple (Aucun 3DS)**

#### **Étapes**
1. **Créer une commande** via l'API ou l'interface
2. **Appeler checkout.createIntent** avec l'ID de commande
3. **Utiliser la carte** `4242 4242 4242 4242`
4. **Confirmer le paiement** dans PaymentSheet

#### **Résultats Attendus**
- ✅ `order.status` devient `PAID`
- ✅ `payment.status` devient `succeeded`
- ✅ QR code généré et affiché
- ✅ Points de fidélité crédités
- ✅ Stock décrémenté

#### **Vérifications**
```bash
# Vérifier le statut de la commande
curl -X GET "http://localhost:3000/api/checkout/status?orderId=ORDER_ID"

# Vérifier les logs de fidélité
curl -X GET "http://localhost:3000/api/loyalty/history"
```

### **Scénario 2 : Paiement 3DS (Authentification Requise)**

#### **Étapes**
1. **Créer une commande** de test
2. **Utiliser la carte** `4000 0027 6000 3184`
3. **Confirmer le paiement** dans PaymentSheet
4. **Compléter l'authentification 3DS** (code SMS : `123456`)
5. **Retourner à l'application** via deep link

#### **Résultats Attendus**
- ✅ Redirection vers page 3DS
- ✅ Retour automatique à l'app
- ✅ Paiement confirmé après authentification
- ✅ QR code généré

#### **Vérifications Deep Link**
```bash
# iOS Simulator
xcrun simctl openurl booted "myapp://stripe-redirect"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://stripe-redirect"
```

### **Scénario 3 : Échec de Paiement**

#### **Étapes**
1. **Créer une commande** de test
2. **Utiliser la carte** `4000 0000 0000 0002`
3. **Tenter le paiement** dans PaymentSheet

#### **Résultats Attendus**
- ❌ Paiement refusé par Stripe
- ❌ `order.status` reste inchangé
- ❌ Stock non décrémenté
- ❌ Aucun QR code généré

#### **Vérifications**
```bash
# Vérifier que la commande n'a pas changé
curl -X GET "http://localhost:3000/api/checkout/status?orderId=ORDER_ID"

# Vérifier les logs d'erreur
tail -f logs/application.log | grep "payment_failed"
```

### **Scénario 4 : Test d'Idempotence**

#### **Étapes**
1. **Effectuer un paiement réussi**
2. **Renvoyer le webhook** `payment_intent.succeeded` deux fois
3. **Vérifier l'absence de doublons**

#### **Résultats Attendus**
- ✅ Points de fidélité crédités une seule fois
- ✅ QR code généré une seule fois
- ✅ Stock décrémenté une seule fois

#### **Test d'Idempotence**
```bash
# Déclencher le webhook deux fois
pnpm stripe:trigger:succeeded
pnpm stripe:trigger:succeeded

# Vérifier les logs
grep "idempotency" logs/application.log
```

### **Scénario 5 : Remboursement (Partiel/Total)**

#### **Remboursement Partiel**
```bash
# Créer un remboursement partiel
pnpm qa:refund:partial PI_ID 1000

# Vérifier le statut
curl -X GET "http://localhost:3000/api/payments/status?pi=PI_ID"
```

#### **Remboursement Total**
```bash
# Créer un remboursement total
pnpm qa:refund:total PI_ID

# Vérifier que la commande devient REFUNDED
curl -X GET "http://localhost:3000/api/checkout/status?orderId=ORDER_ID"
```

#### **Résultats Attendus**
- ✅ Remboursement traité via webhook
- ✅ `order.status` mis à jour selon le montant
- ✅ Logs de remboursement créés

### **Scénario 6 : Stock Insuffisant**

#### **Étapes**
1. **Forcer une quantité insuffisante** en base de données
2. **Tenter un paiement** pour cette commande
3. **Vérifier le rollback transactionnel**

#### **Simulation**
```sql
-- Forcer un stock insuffisant
UPDATE products SET stock_quantity = 0 WHERE id = 'PRODUCT_ID';
```

#### **Résultats Attendus**
- ❌ Transaction annulée (rollback)
- ❌ Stock non décrémenté
- ❌ Log d'alerte créé
- ❌ Erreur retournée à l'utilisateur

## 🛠️ Scripts QA

### **Scripts NPM Disponibles**
```bash
# Écouter les webhooks Stripe
pnpm stripe:listen

# Déclencher des événements de test
pnpm stripe:trigger:succeeded    # Paiement réussi
pnpm stripe:trigger:failed       # Paiement échoué

# Tests de remboursement
pnpm qa:refund:partial PI_ID AMOUNT
pnpm qa:refund:total PI_ID
```

### **Utilisation des Scripts**
```bash
# 1. Lancer l'écoute des webhooks
pnpm stripe:listen

# 2. Dans un autre terminal, déclencher des événements
pnpm stripe:trigger:succeeded

# 3. Vérifier les logs et la base de données
```

## 🔍 Vérifications et Logs

### **Logs à Surveiller**
```bash
# Logs de paiement
tail -f logs/application.log | grep "payment"

# Logs de webhook
tail -f logs/application.log | grep "webhook"

# Logs de fidélité
tail -f logs/application.log | grep "loyalty"

# Logs d'erreur
tail -f logs/application.log | grep "ERROR"
```

### **Vérifications Base de Données**
```sql
-- Vérifier le statut des commandes
SELECT id, status, amount_total_cents FROM orders ORDER BY created_at DESC LIMIT 10;

-- Vérifier les paiements
SELECT id, status, amount, refunded_amount FROM payments ORDER BY created_at DESC LIMIT 10;

-- Vérifier les logs de fidélité
SELECT * FROM loyalty_logs ORDER BY created_at DESC LIMIT 10;
```

## 📱 Tests Mobile

### **Configuration Deep Link**
```json
// iOS - Info.plist
"CFBundleURLSchemes": ["myapp"]

// Android - AndroidManifest.xml
<data android:scheme="myapp" />
```

### **Test Deep Link 3DS**
1. **Lancer un paiement 3DS** avec une carte test
2. **Vérifier la redirection** vers la page 3DS
3. **Compléter l'authentification** (code : `123456`)
4. **Vérifier le retour** automatique à l'app
5. **Confirmer le succès** du paiement

## ✅ Checklist QA Complète

### **Fonctionnalités de Base**
- [ ] `createIntent` renvoie tous les secrets attendus
- [ ] PaymentSheet s'ouvre correctement
- [ ] Paiement simple fonctionne (carte 4242...)
- [ ] QR code généré après paiement réussi
- [ ] Points de fidélité crédités

### **3DS et Deep Linking**
- [ ] Paiement 3DS déclenche l'authentification
- [ ] Redirection vers page 3DS fonctionne
- [ ] Retour automatique à l'app après 3DS
- [ ] Deep link `myapp://stripe-redirect` configuré
- [ ] Test sur iOS et Android

### **Webhooks et Idempotence**
- [ ] Webhook `payment_intent.succeeded` reçu
- [ ] Signature webhook validée
- [ ] Événements de paiement traités
- [ ] Double webhook → pas de doublons
- [ ] Idempotence respectée

### **Gestion des Erreurs**
- [ ] Carte refusée → commande non modifiée
- [ ] Stock insuffisant → rollback transactionnel
- [ ] Logs d'erreur créés
- [ ] Aucun secret exposé dans les logs
- [ ] Messages d'erreur utilisateur appropriés

### **Remboursements**
- [ ] Remboursement partiel traité
- [ ] Remboursement total → `order.REFUNDED`
- [ ] Webhook `refund.updated` traité
- [ ] Montants de remboursement synchronisés

### **Sécurité et Performance**
- [ ] Aucune fuite de secrets
- [ ] Transactions atomiques
- [ ] Timeout de webhook respecté
- [ ] Gestion des erreurs réseau
- [ ] Logs de sécurité appropriés

## 🚨 Dépannage

### **Problèmes Courants**

#### **Webhook non reçu**
```bash
# Vérifier l'écoute Stripe
stripe listen --forward-to http://localhost:3000/webhooks/stripe

# Vérifier les logs du serveur
tail -f logs/application.log | grep "webhook"
```

#### **Erreur de signature webhook**
```bash
# Vérifier la variable STRIPE_WEBHOOK_SECRET
echo $STRIPE_WEBHOOK_SECRET

# Vérifier la configuration webhook
stripe webhook endpoints list
```

#### **Paiement 3DS ne fonctionne pas**
```bash
# Vérifier la configuration deep link
# Tester avec une vraie carte 3DS
# Vérifier les logs de redirection
```

#### **Stock non décrémenté**
```bash
# Vérifier les transactions en base
SELECT * FROM payments WHERE order_id = 'ORDER_ID';

# Vérifier les logs de transaction
grep "transaction" logs/application.log
```

## 📊 Métriques et Monitoring

### **Métriques à Surveiller**
- Taux de succès des paiements
- Temps de traitement des webhooks
- Nombre d'erreurs 3DS
- Performance des transactions
- Utilisation de la base de données

### **Alertes à Configurer**
- Webhook non reçu pendant > 5 minutes
- Taux d'erreur > 5%
- Temps de réponse > 10 secondes
- Échec de transaction critique

## 🔮 Tests Avancés

### **Tests de Charge**
```bash
# Simuler plusieurs paiements simultanés
for i in {1..10}; do
  pnpm stripe:trigger:succeeded &
done
wait
```

### **Tests de Récupération**
```bash
# Simuler une panne de base de données
# Vérifier la gestion des erreurs
# Tester la récupération automatique
```

### **Tests de Sécurité**
- Injection SQL dans les paramètres
- Validation des signatures webhook
- Protection contre la réutilisation des tokens
- Tests de rate limiting

---

## 🎯 Objectif de Test

**Tous les scénarios listés doivent être testables en 10-15 minutes maximum.**

**Aucune fuite de secrets, logs utiles et détaillés.**
