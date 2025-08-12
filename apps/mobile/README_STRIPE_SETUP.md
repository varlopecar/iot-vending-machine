# Configuration et Test de Stripe - Mobile

## 🚀 Configuration Rapide

### 1. Clés Stripe à Obtenir

Rendez-vous sur https://dashboard.stripe.com/test/apikeys et récupérez :

```bash
# Clés de TEST (commencent par pk_test_ et sk_test_)
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_ici  # Pour le backend uniquement
```

### 2. Configuration de l'App Mobile

Dans `apps/mobile/app/_layout.tsx`, remplacez la clé par la vôtre :

```typescript
<StripeProvider
  publishableKey="pk_test_VOTRE_CLE_ICI" // ← Remplacez ici
  merchantIdentifier="merchant.com.votreentreprise.vending"
  urlScheme="your-app-scheme"
>
```

### 3. Configuration du Backend

Dans `apps/backend/.env` :

```bash
STRIPE_SECRET_KEY=sk_test_VOTRE_CLE_ICI
STRIPE_PUBLISHABLE_KEY=pk_test_VOTRE_CLE_ICI
STRIPE_WEBHOOK_SECRET=whsec_VOTRE_SECRET_ICI
STRIPE_API_VERSION=2024-06-20
```

## 🧪 Test avec Expo Go

### 1. Démarrer le Backend
```bash
cd apps/backend
pnpm dev
```

### 2. Démarrer l'App Mobile
```bash
cd apps/mobile
npx expo start
```

### 3. Tester le Paiement

1. **Ouvrez l'app dans Expo Go**
2. **Ajoutez des produits au panier**
3. **Cliquez sur "💳 Payer maintenant"**
4. **Utilisez une carte de test** :
   - `4242 4242 4242 4242` (succès)
   - `4000 0000 0000 0002` (déclinée)
   - Date d'expiration : toute date future
   - CVC : n'importe quel code à 3 chiffres

## 💳 Cartes de Test Stripe

### Cartes de Succès
```
4242 4242 4242 4242  # Visa - Succès standard
4000 0566 5566 5556  # Visa - Succès standard
5555 5555 5555 4444  # Mastercard - Succès standard
```

### Cartes d'Échec
```
4000 0000 0000 0002  # Carte déclinée
4000 0000 0000 9995  # Fonds insuffisants
4000 0000 0000 9987  # Perdue/volée
```

### Cartes 3D Secure
```
4000 0025 0000 3155  # 3D Secure requis
4000 0000 0000 3220  # 3D Secure 2
```

## 📱 Test des Paiements Natifs (Apple Pay / Google Pay)

### ⚠️ Limitation Expo Go

**Apple Pay et Google Pay ne fonctionnent PAS dans Expo Go** - ils nécessitent un build natif.

### Pour Tester les Paiements Natifs

#### Option 1 : Build de Développement
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

#### Option 2 : Simuler dans Expo Go
Les hooks et composants sont conçus pour dégrader gracieusement - les boutons de paiement natif ne s'afficheront simplement pas dans Expo Go.

## 🔧 Endpoints de Test

### Vérifier que le Backend Fonctionne
```bash
curl http://localhost:3000/metrics/payments/health
```

### Créer une Intention de Paiement (Manuel)
```bash
curl -X POST http://localhost:3000/trpc/stripe.createPaymentIntent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2500,
    "currency": "eur", 
    "metadata": {
      "order_id": "test_order_123",
      "user_id": "test_user_456",
      "machine_id": "test_machine_789"
    },
    "supportsNativePay": true,
    "platform": "ios"
  }'
```

## 🐛 Dépannage

### Erreur "Invalid API Key"
- Vérifiez que vous utilisez les bonnes clés de **TEST** (pk_test_ et sk_test_)
- Assurez-vous que les clés sont bien configurées dans _layout.tsx et .env

### Backend Non Accessible
```bash
# Vérifiez que le backend tourne
curl http://localhost:3000/health

# Vérifiez les logs du backend
cd apps/backend && pnpm dev
```

### App Ne Se Lance Pas
```bash
# Nettoyez le cache Expo
npx expo start --clear

# Vérifiez les dépendances
cd apps/mobile && pnpm install
```

### Payment Sheet Ne S'Affiche Pas
1. Vérifiez que la clé publique Stripe est correcte
2. Vérifiez que le backend renvoie un client_secret valide
3. Regardez les logs React Native Dev Tools

## 📋 Checklist de Test

### Tests Expo Go ✅
- [ ] App se lance sans erreur
- [ ] Produits s'affichent
- [ ] Panier fonctionne
- [ ] Bouton "Payer maintenant" apparaît
- [ ] Écran de checkout s'ouvre
- [ ] Payment Sheet Stripe s'affiche
- [ ] Paiement avec carte de test réussit
- [ ] QR code s'affiche après paiement

### Tests Build Natif (Optionnel)
- [ ] Bouton Apple Pay/Google Pay s'affiche
- [ ] Paiement natif fonctionne
- [ ] Authentification biométrique

## 🔗 Ressources

- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Stripe React Native SDK](https://stripe.com/docs/stripe-react-native)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)

## 💡 Conseils

1. **Toujours tester avec des clés de TEST en développement**
2. **Utiliser des cartes de test Stripe uniquement**
3. **Ne jamais commiter les vraies clés dans le code**
4. **Tester sur de vrais devices pour les paiements natifs**

---

**Prêt à tester !** 🎉

Votre intégration Stripe est maintenant fonctionnelle. Commencez par tester dans Expo Go avec les cartes de test, puis passez à un build natif si vous voulez tester Apple Pay/Google Pay.
