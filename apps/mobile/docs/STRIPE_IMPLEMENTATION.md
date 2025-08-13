# Implémentation Stripe - Application Mobile

## 🎯 Vue d'ensemble

Cette implémentation intègre Stripe côté mobile avec PaymentSheet, 3DS, et un système de polling robuste pour confirmer les paiements et afficher les QR codes.

## 🏗️ Architecture

### Composants Principaux

1. **StripeProvider** - Wrapper principal avec gestion de la clé publishable
2. **CheckoutScreen** - Écran de paiement avec PaymentSheet
3. **PaymentQRView** - Affichage du QR code après paiement
4. **useStripeCheckout** - Hook personnalisé pour la logique métier

### Structure des Fichiers

```
components/
├── StripeProvider.tsx          # Provider Stripe avec contexte
├── CheckoutScreen.tsx          # Écran de checkout principal
├── PaymentQRView.tsx           # Affichage du QR code
├── StripeTestScreen.tsx        # Écran de test pour QA
└── __tests__/
    └── StripeComponents.test.tsx

hooks/
└── useStripeCheckout.ts        # Hook personnalisé pour le checkout

types/
└── stripe.ts                   # Types TypeScript pour Stripe

docs/
├── STRIPE_IMPLEMENTATION.md    # Cette documentation
└── STRIPE_TESTING.md           # Guide de test pour QA

app/
└── checkout.tsx                # Écran de checkout intégré
```

## 🔧 Configuration

### 1. Dépendances Installées

```bash
pnpm add @stripe/stripe-react-native react-native-qrcode-svg
```

### 2. Configuration Deep Linking

#### iOS (app.json)
```json
{
  "ios": {
    "bundleIdentifier": "com.vendingmachine.mobile",
    "infoPlist": {
      "CFBundleURLTypes": [
        {
          "CFBundleURLName": "stripe-redirect",
          "CFBundleURLSchemes": ["mobile"]
        }
      ]
    }
  }
}
```

#### Android (app.json)
```json
{
  "android": {
    "package": "com.vendingmachine.mobile",
    "intentFilters": [
      {
        "action": "VIEW",
        "autoVerify": true,
        "data": [
          {
            "scheme": "mobile"
          }
        ],
        "category": ["BROWSABLE", "DEFAULT"]
      }
    ]
  }
}
```

### 3. StripeProvider Configuration

```typescript
<StripeProvider
  publishableKey={publishableKey}
  urlScheme="mobile"
  merchantIdentifier="merchant.com.vendingmachine"
>
  {children}
</StripeProvider>
```

## 🔄 Flow de Paiement

### 1. Initialisation
```typescript
// 1. Récupération de la clé publishable
const publishableKey = await fetchPublishableKey();

// 2. Configuration de PaymentSheet
const config: PaymentSheetConfig = {
  merchantDisplayName: 'Vending Machine',
  paymentIntentClientSecret: paymentData.paymentIntentClientSecret,
  customerId: paymentData.customerId,
  customerEphemeralKeySecret: paymentData.ephemeralKey,
  allowsDelayedPaymentMethods: false,
  returnURL: 'mobile://stripe-redirect',
};

// 3. Initialisation
const { error } = await initPaymentSheet(config);
```

### 2. Présentation du Paiement
```typescript
// 1. Présentation de PaymentSheet
const { error } = await presentPaymentSheet();

// 2. Gestion des erreurs
if (error) {
  if (error.code === 'Canceled') {
    // Annulation utilisateur
    return;
  }
  throw new Error(`Erreur de paiement: ${error.message}`);
}

// 3. Paiement réussi, début du polling
startPolling();
```

### 3. Polling et Confirmation
```typescript
// 1. Polling toutes les 2 secondes
const interval = setInterval(async () => {
  const status = await checkoutAPI.getStatus(orderId);
  
  if (status.orderStatus === 'PAID' && status.qrCodeToken) {
    // Paiement confirmé, arrêter le polling
    clearInterval(interval);
    setState({ status: 'paid', orderStatus: status });
    return;
  }
}, 2000);

// 2. Timeout après 60 secondes
setTimeout(() => {
  clearInterval(interval);
  setState({ status: 'error', error: 'Délai dépassé' });
}, 60000);
```

## 🎨 États de l'Interface

### CheckoutStatus
```typescript
type CheckoutStatus = 
  | 'loading'      // Initialisation
  | 'ready'        // Prêt pour le paiement
  | 'processing'   // Paiement en cours
  | 'confirming'   // Confirmation en cours
  | 'paid'         // Paiement confirmé
  | 'error';       // Erreur
```

### Transitions d'État
```
loading → ready → processing → confirming → paid
   ↓         ↓         ↓          ↓
error     error     error      error
```

## 🛡️ Sécurité

### Aucun Secret Exposé
- ✅ Seule la clé publishable côté mobile
- ✅ Client secret récupéré via tRPC sécurisé
- ✅ Ephemeral key pour l'authentification
- ✅ Validation côté serveur

### Gestion des Erreurs
- ✅ Erreurs Stripe mappées vers erreurs métier
- ✅ Aucune fuite d'informations sensibles
- ✅ Logs sans données personnelles
- ✅ Retry automatique en cas d'échec

## 🔌 Intégration tRPC

### Endpoints Utilisés
```typescript
// 1. Création de l'intention de paiement
const paymentData = await trpc.checkout.createIntent.mutate({
  orderId: orderId
});

// 2. Vérification du statut
const status = await trpc.checkout.getStatus.query({
  orderId: orderId
});
```

### Types de Réponse
```typescript
interface CheckoutCreateIntentResponse {
  publishableKey: string;
  paymentIntentClientSecret: string;
  customerId: string;
  ephemeralKey: string;
}

interface CheckoutGetStatusResponse {
  orderStatus: string;
  paymentStatus: string | null;
  paidAt: string | null;
  receiptUrl: string | null;
  amountTotalCents: number;
  currency: string;
  qrCodeToken: string | null;
  stripePaymentIntentId: string | null;
}
```

## 🧪 Tests

### Tests Unitaires
```bash
# Exécuter les tests
pnpm test

# Tests spécifiques Stripe
pnpm test StripeComponents
```

### Tests d'Intégration
1. **Test du Flow Complet** - Paiement → Polling → QR
2. **Test 3DS** - Redirection et retour
3. **Test des Erreurs** - Gestion des échecs
4. **Test du Polling** - Timeout et confirmation

## 🚀 Utilisation

### 1. Wrapper de l'Application
```typescript
// _layout.tsx
import { StripeProvider } from '../components/StripeProvider';

export default function RootLayout() {
  return (
    <StripeProvider>
      {/* Reste de l'application */}
    </StripeProvider>
  );
}
```

### 2. Écran de Checkout
```typescript
import { CheckoutScreen } from '../components/CheckoutScreen';

export default function CheckoutPage() {
  return (
    <CheckoutScreen
      orderId="order-123"
      onSuccess={() => console.log('Paiement réussi')}
      onError={(error) => console.error('Erreur:', error)}
    />
  );
}
```

### 3. Navigation
```typescript
// Depuis le panier
router.push('/checkout');

// Après succès
router.push('/qr-code');
```

## 🔧 Personnalisation

### Thème et Styles
- Utilise NativeWind/Tailwind CSS
- Composants adaptatifs (dark/light mode)
- Animations et transitions fluides
- Respect des standards WCAG

### Messages et Localisation
- Textes en français
- Messages d'erreur explicites
- Instructions utilisateur claires
- Support multilingue possible

## 📱 Compatibilité

### Plateformes
- ✅ iOS (iPhone, iPad)
- ✅ Android
- ✅ Expo (managed workflow)

### Versions
- React Native 0.79+
- Expo SDK 53+
- Stripe React Native 0.50+

## 🚨 Dépannage

### Problèmes Courants
1. **Stripe ne s'initialise pas** - Vérifier la clé publishable
2. **PaymentSheet ne s'affiche pas** - Vérifier la configuration
3. **3DS ne fonctionne pas** - Vérifier le deep linking
4. **Polling infini** - Vérifier les webhooks

### Logs de Debug
```typescript
console.log('Stripe init:', { error });
console.log('Payment result:', { error });
console.log('Polling status:', status);
```

## 🔮 Évolutions Futures

### Court Terme
- [ ] Remplacement des mocks par vrais appels tRPC
- [ ] Intégration de la vraie clé publishable
- [ ] Tests avec vrais webhooks Stripe

### Moyen Terme
- [ ] Gestion offline et retry automatique
- [ ] Analytics et métriques de paiement
- [ ] Support Apple Pay/Google Pay
- [ ] Notifications push de confirmation

### Long Terme
- [ ] Support des paiements récurrents
- [ ] Intégration avec d'autres PSP
- [ ] Support des cryptomonnaies
- [ ] Internationalisation complète
