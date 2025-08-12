# 🧪 Boîte à Outils QA - Paiements Stripe

## 🎯 Vue d'ensemble

Cette boîte à outils QA permet de tester complètement l'intégration Stripe en environnement sandbox, incluant tous les scénarios de paiement, 3DS, échecs et remboursements.

## 🚀 Démarrage Rapide

### **1. Prérequis**
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter à Stripe
stripe login

# Vérifier la connexion
stripe balance retrieve
```

### **2. Lancer les Tests**
```bash
# Terminal 1 - Backend
cd apps/backend
pnpm dev

# Terminal 2 - Webhooks Stripe
pnpm stripe:listen

# Terminal 3 - Tests
pnpm test:smoke
```

## 🛠️ Scripts QA Disponibles

### **Scripts Stripe**
```bash
# Écouter les webhooks
pnpm stripe:listen

# Déclencher des événements de test
pnpm stripe:trigger:succeeded    # Paiement réussi
pnpm stripe:trigger:failed       # Paiement échoué
```

### **Scripts de Remboursement**
```bash
# Remboursement partiel
pnpm qa:refund:partial PI_ID AMOUNT
# Exemple: pnpm qa:refund:partial pi_test_123 1000

# Remboursement total
pnpm qa:refund:total PI_ID
# Exemple: pnpm qa:refund:total pi_test_123
```

### **Tests Automatiques**
```bash
# Tests smoke (chemins critiques)
pnpm test:smoke

# Tests smoke en mode watch
pnpm test:smoke:watch

# Tests complets
pnpm test
```

## 💳 Cartes de Test

### **Cartes de Succès**
| Numéro | Type | Comportement |
|---------|------|--------------|
| `4242 4242 4242 4242` | Visa | Succès immédiat, aucun 3DS |
| `4000 0027 6000 3184` | Visa | 3DS requis (authentification) |

### **Cartes d'Échec**
| Numéro | Type | Comportement |
|---------|------|--------------|
| `4000 0000 0000 9995` | Visa | Fonds insuffisants |
| `4000 0000 0000 0002` | Visa | Paiement refusé |

## 🔄 Scénarios de Test

### **Scénario 1 : Paiement Simple**
1. **Créer une commande** via l'API
2. **Appeler checkout.createIntent**
3. **Utiliser la carte** `4242 4242 4242 4242`
4. **Vérifier** : order → PAID, QR généré, points crédités

### **Scénario 2 : Paiement 3DS**
1. **Créer une commande** de test
2. **Utiliser la carte** `4000 0027 6000 3184`
3. **Compléter l'authentification** (code : `123456`)
4. **Vérifier** : retour app, paiement confirmé

### **Scénario 3 : Test d'Idempotence**
1. **Effectuer un paiement réussi**
2. **Renvoyer le webhook** deux fois
3. **Vérifier** : pas de doublons, idempotence respectée

### **Scénario 4 : Remboursement**
```bash
# Remboursement partiel
pnpm qa:refund:partial pi_test_123 1000

# Remboursement total
pnpm qa:refund:total pi_test_123
```

## 🧪 Tests Smoke

### **Exécution**
```bash
# Tests complets
pnpm test:smoke

# Mode watch
pnpm test:smoke:watch

# Avec coverage
pnpm test:smoke --coverage
```

### **Tests Inclus**
- ✅ Création d'intention de paiement
- ✅ Validation des permissions
- ✅ Traitement des webhooks
- ✅ Gestion de l'idempotence
- ✅ Gestion des échecs
- ✅ Gestion du stock
- ✅ Système de fidélité
- ✅ Gestion des erreurs

### **Configuration**
- **Fichier** : `test/jest-smoke.json`
- **Setup** : `test/jest-smoke.setup.ts`
- **Timeout** : 30 secondes
- **Base de données** : Vérification automatique

## 📊 Vérifications et Logs

### **Logs à Surveiller**
```bash
# Logs de paiement
tail -f logs/application.log | grep "payment"

# Logs de webhook
tail -f logs/application.log | grep "webhook"

# Logs de fidélité
tail -f logs/application.log | grep "loyalty"
```

### **Vérifications Base de Données**
```sql
-- Statut des commandes
SELECT id, status, amount_total_cents FROM orders ORDER BY created_at DESC LIMIT 10;

-- Paiements
SELECT id, status, amount, refunded_amount FROM payments ORDER BY created_at DESC LIMIT 10;

-- Logs de fidélité
SELECT * FROM loyalty_logs ORDER BY created_at DESC LIMIT 10;
```

## 🔍 Dépannage

### **Problèmes Courants**

#### **Webhook non reçu**
```bash
# Vérifier l'écoute Stripe
pnpm stripe:listen

# Vérifier les logs du serveur
tail -f logs/application.log | grep "webhook"
```

#### **Erreur de signature webhook**
```bash
# Vérifier STRIPE_WEBHOOK_SECRET
echo $STRIPE_WEBHOOK_SECRET

# Vérifier la configuration webhook
stripe webhook endpoints list
```

#### **Tests smoke qui échouent**
```bash
# Vérifier la base de données
pnpm db:studio

# Vérifier les variables d'environnement
cat .env.local

# Relancer les tests
pnpm test:smoke --verbose
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

## ✅ Checklist QA

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
- [ ] Deep link configuré et fonctionnel

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

### **Remboursements**
- [ ] Remboursement partiel traité
- [ ] Remboursement total → `order.REFUNDED`
- [ ] Webhook `refund.updated` traité
- [ ] Montants synchronisés

## 🚨 Sécurité

### **Aucune Fuite de Secrets**
- ✅ Seule la clé publishable côté mobile
- ✅ Client secret récupéré via tRPC sécurisé
- ✅ Ephemeral key pour authentification
- ✅ Validation côté serveur

### **Tests de Sécurité**
- Injection SQL dans les paramètres
- Validation des signatures webhook
- Protection contre la réutilisation des tokens
- Tests de rate limiting

## 📊 Métriques et Monitoring

### **Métriques à Surveiller**
- Taux de succès des paiements
- Temps de traitement des webhooks
- Nombre d'erreurs 3DS
- Performance des transactions

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
- Simuler une panne de base de données
- Vérifier la gestion des erreurs
- Tester la récupération automatique

## 📚 Documentation Complète

- `docs/payments-sandbox.md` - Guide QA détaillé
- `docs/STRIPE_IMPLEMENTATION.md` - Implémentation côté mobile
- `docs/STRIPE_TESTING.md` - Tests côté mobile

---

## 🎯 Objectif de Test

**Tous les scénarios listés doivent être testables en 10-15 minutes maximum.**

**Aucune fuite de secrets, logs utiles et détaillés.**

## 🚀 Utilisation Immédiate

1. **Installer Stripe CLI** et se connecter
2. **Lancer le backend** avec `pnpm dev`
3. **Écouter les webhooks** avec `pnpm stripe:listen`
4. **Exécuter les tests smoke** avec `pnpm test:smoke`
5. **Tester les scénarios** manuellement avec les cartes de test
6. **Utiliser les scripts QA** pour les remboursements

**L'application est prête pour les tests en environnement de production ! 🎉**
