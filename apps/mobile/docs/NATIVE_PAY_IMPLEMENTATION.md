# Implémentation Apple Pay / Google Pay - React Native

Ce document décrit l'implémentation des paiements natifs (Apple Pay / Google Pay) dans l'application mobile React Native.

## 🚀 Installation et Configuration

### 1. Dépendances

```bash
# Installer le SDK Stripe React Native
pnpm add @stripe/stripe-react-native

# Installer les types TypeScript
pnpm add -D @types/react-native
```

### 2. Configuration iOS (Apple Pay)

#### Info.plist
```xml
<key>NSApplePayUsageDescription</key>
<string>Cette application utilise Apple Pay pour sécuriser vos paiements</string>

<key>com.apple.developer.in-app-payments</key>
<array>
    <string>merchant.com.votreentreprise.vending</string>
</array>
```

#### Capacités Xcode
1. Ouvrez votre projet dans Xcode
2. Sélectionnez votre target
3. Allez dans "Signing & Capabilities"
4. Ajoutez "Apple Pay"
5. Configurez votre Merchant ID

#### Merchant ID
1. Allez sur [Apple Developer](https://developer.apple.com/account/)
2. Créez un Merchant ID
3. Configurez-le dans Xcode

### 3. Configuration Android (Google Pay)

#### build.gradle
```gradle
android {
    defaultConfig {
        // ...
    }
    
    buildTypes {
        release {
            // ...
        }
    }
}

dependencies {
    // ...
    implementation 'com.google.android.gms:play-services-wallet:19.2.1'
}
```

#### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

## 🔧 Implémentation

### 1. Configuration du Provider

```typescript
// App.tsx
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_live_votre_cle_publique"
      merchantIdentifier="merchant.com.votreentreprise.vending" // iOS uniquement
      urlScheme="votre-app-scheme" // iOS uniquement
    >
      <YourApp />
    </StripeProvider>
  );
}
```

### 2. Hook de Paiement Natif

```typescript
// hooks/useNativePayment.ts
import { useStripe } from '@stripe/stripe-react-native';
import { Platform } from 'react-native';
import { trpc } from '../lib/trpc';

export const useNativePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const checkNativePaySupport = async () => {
    try {
      const { applePay, googlePay } = await trpc.stripe.checkNativePayAvailability.query({
        domain: 'votre-domaine.com'
      });
      
      return Platform.OS === 'ios' ? applePay : googlePay;
    } catch (error) {
      console.warn('Erreur vérification paiement natif:', error);
      return false;
    }
  };

  const initializePayment = async (clientSecret: string, amount: number) => {
    try {
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
        appearance: {
          colors: {
            primary: '#007AFF',
            background: '#FFFFFF',
            componentBackground: '#F8F9FA',
            componentBorder: '#E1E5E9',
            componentDivider: '#E1E5E9',
            text: '#1D1D1F',
            textSecondary: '#86868B',
            componentText: '#1D1D1F',
            placeholderText: '#86868B',
          },
          shapes: {
            borderRadius: 8,
            shadow: {
              color: '#000000',
              opacity: 0.1,
              blur: 4,
              offset: {
                width: 0,
                height: 2,
              },
            },
          },
        },
      });

      if (error) {
        console.error('Erreur initialisation Payment Sheet:', error);
        throw new Error(`Erreur initialisation: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erreur configuration paiement:', error);
      throw error;
    }
  };

  const handlePayment = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await presentPaymentSheet();
      
      if (error) {
        console.error('Erreur paiement:', error);
        return {
          success: false,
          error: error.message || 'Erreur lors du paiement'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return {
        success: false,
        error: 'Erreur inattendue lors du paiement'
      };
    }
  };

  return {
    checkNativePaySupport,
    initializePayment,
    handlePayment,
  };
};
```

### 3. Composant de Paiement

```typescript
// components/NativePaymentButton.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { useNativePayment } from '../hooks/useNativePayment';

interface NativePaymentButtonProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const NativePaymentButton: React.FC<NativePaymentButtonProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [supportsNativePay, setSupportsNativePay] = useState<boolean | null>(null);
  const { checkNativePaySupport, initializePayment, handlePayment } = useNativePayment();

  React.useEffect(() => {
    checkNativePaySupport().then(setSupportsNativePay);
  }, []);

  const handleNativePayment = async () => {
    if (!supportsNativePay) {
      onError('Paiement natif non supporté sur cet appareil');
      return;
    }

    setIsLoading(true);
    
    try {
      // Initialiser le Payment Sheet
      await initializePayment(clientSecret, amount);
      
      // Présenter le Payment Sheet
      const result = await handlePayment();
      
      if (result.success) {
        onSuccess();
      } else {
        onError(result.error || 'Paiement échoué');
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  if (supportsNativePay === null) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text>Vérification du support...</Text>
      </View>
    );
  }

  if (!supportsNativePay) {
    return null; // Ne pas afficher le bouton si non supporté
  }

  const buttonText = Platform.OS === 'ios' ? 'Payer avec Apple Pay' : 'Payer avec Google Pay';
  const buttonColor = Platform.OS === 'ios' ? '#000000' : '#4285F4';

  return (
    <TouchableOpacity
      style={{
        backgroundColor: buttonColor,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
        opacity: isLoading ? 0.6 : 1,
      }}
      onPress={handleNativePayment}
      disabled={isLoading}
    >
      <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
        {isLoading ? 'Chargement...' : buttonText}
      </Text>
    </TouchableOpacity>
  );
};
```

### 4. Intégration dans le Checkout

```typescript
// screens/CheckoutScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativePaymentButton } from '../components/NativePaymentButton';
import { useCheckout } from '../hooks/useCheckout';

export const CheckoutScreen: React.FC = () => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { createPaymentIntent, isLoading } = useCheckout();

  const handleCreatePaymentIntent = async () => {
    try {
      const result = await createPaymentIntent({
        amount: 2500, // 25.00 EUR
        currency: 'eur',
        supportsNativePay: true,
        platform: Platform.OS,
      });
      
      setClientSecret(result.paymentIntentClientSecret);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'intention de paiement');
    }
  };

  const handlePaymentSuccess = () => {
    Alert.alert('Succès', 'Paiement effectué avec succès !');
    // Navigation vers l'écran de succès
  };

  const handlePaymentError = (error: string) => {
    Alert.alert('Erreur', error);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
        Finaliser votre commande
      </Text>

      {!clientSecret ? (
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center',
          }}
          onPress={handleCreatePaymentIntent}
          disabled={isLoading}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
            {isLoading ? 'Chargement...' : 'Préparer le paiement'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>
            Choisissez votre méthode de paiement :
          </Text>
          
          <NativePaymentButton
            clientSecret={clientSecret}
            amount={2500}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
          
          {/* Bouton de paiement classique en fallback */}
          <TouchableOpacity
            style={{
              backgroundColor: '#34C759',
              padding: 16,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 8,
            }}
            onPress={() => {
              // Logique de paiement classique
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16 }}>
              Payer avec une carte
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
```

## 🧪 Tests

### 1. Tests iOS (Simulateur)

```bash
# Démarrer le simulateur iOS
xcrun simctl boot "iPhone 15"

# Tester Apple Pay
# 1. Activez Apple Pay dans les paramètres du simulateur
# 2. Ajoutez une carte de test
# 3. Testez le paiement
```

### 2. Tests Android (Émulateur)

```bash
# Démarrer l'émulateur Android
emulator -avd Pixel_7_API_34

# Tester Google Pay
# 1. Installez Google Play Services
# 2. Configurez Google Pay
# 3. Testez le paiement
```

### 3. Tests sur Device Réel

#### iOS
1. **Wallet** : Ajoutez une carte de test
2. **Face ID/Touch ID** : Configurez l'authentification
3. **Apple Pay** : Vérifiez l'activation

#### Android
1. **Google Pay** : Configurez l'application
2. **Carte** : Ajoutez une carte de test
3. **Authentification** : Configurez l'empreinte/pattern

## 🐛 Dépannage

### Problèmes Courants

#### Apple Pay Non Disponible
```typescript
// Vérifier la configuration
console.log('Merchant ID:', 'merchant.com.votreentreprise.vending');
console.log('Bundle ID:', 'com.votreentreprise.vending');

// Vérifier les capacités Xcode
// Vérifier le Merchant ID dans Apple Developer
```

#### Google Pay Non Disponible
```typescript
// Vérifier Google Play Services
import { isGooglePaySupportedAsync } from '@stripe/stripe-react-native';

const checkGooglePay = async () => {
  try {
    const supported = await isGooglePaySupportedAsync();
    console.log('Google Pay supporté:', supported);
    return supported;
  } catch (error) {
    console.error('Erreur Google Pay:', error);
    return false;
  }
};
```

#### Erreurs de Configuration
```typescript
// Vérifier les clés Stripe
console.log('Publishable Key:', 'pk_live_...');
console.log('Merchant Identifier:', 'merchant.com.votreentreprise.vending');

// Vérifier les permissions
// Vérifier les capacités
```

### Logs de Debug

```typescript
// Activer les logs Stripe
import { setStripeUrl } from '@stripe/stripe-react-native';

if (__DEV__) {
  setStripeUrl('https://api.stripe.com');
}

// Logs personnalisés
const logPaymentEvent = (event: string, data: any) => {
  console.log(`[PAYMENT] ${event}:`, JSON.stringify(data, null, 2));
};
```

## 📱 Bonnes Pratiques

### 1. UX/UI
- **Bouton natif** : Utilisez les couleurs et styles officiels
- **Feedback visuel** : Indiquez clairement l'état du paiement
- **Fallback** : Proposez toujours une alternative classique

### 2. Performance
- **Lazy loading** : Vérifiez le support au moment opportun
- **Cache** : Mettez en cache les résultats de vérification
- **Optimisation** : Évitez les appels API inutiles

### 3. Sécurité
- **Validation** : Validez toutes les entrées côté client
- **HTTPS** : Utilisez toujours des connexions sécurisées
- **Tokens** : Ne stockez jamais de données sensibles

## 🔗 Ressources

- [Stripe React Native SDK](https://stripe.com/docs/stripe-react-native)
- [Apple Pay Guidelines](https://developer.apple.com/apple-pay/)
- [Google Pay Guidelines](https://developers.google.com/pay/api)
- [React Native Documentation](https://reactnative.dev/)

---

**Dernière mise à jour** : 2024-01-15  
**Version** : 1.0.0  
**Maintenu par** : Équipe Mobile
