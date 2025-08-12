# Guide de Test - Intégration Stripe

## 🎯 Objectif
Ce document décrit comment tester l'intégration Stripe côté mobile avec PaymentSheet, 3DS et le système de QR codes.

## 🧪 Prérequis
- Application mobile compilée et installée
- Compte Stripe de test configuré
- Cartes de test Stripe disponibles

## 💳 Cartes de Test Stripe

### Carte de Succès
- **Numéro** : 4242 4242 4242 4242
- **Date** : 12/25
- **CVC** : 123
- **Comportement** : Paiement réussi immédiat

### Carte 3DS (3D Secure)
- **Numéro** : 4000 0025 0000 3155
- **Date** : 12/25
- **CVC** : 123
- **Comportement** : Redirection vers page 3DS, puis succès

### Carte d'Échec
- **Numéro** : 4000 0000 0000 0002
- **Date** : 12/25
- **CVC** : 123
- **Comportement** : Paiement refusé

### Carte Insuffisante
- **Numéro** : 4000 0000 0000 9995
- **Date** : 12/25
- **CVC** : 123
- **Comportement** : Fonds insuffisants

## 🔄 Scénarios de Test

### 1. Test du Flow Complet
1. **Lancer l'application** → Vérifier que Stripe s'initialise
2. **Naviguer vers le checkout** → Vérifier l'état "loading" puis "ready"
3. **Taper une carte de test** → Vérifier l'état "processing"
4. **Confirmer le paiement** → Vérifier l'état "confirming"
5. **Attendre le polling** → Vérifier la transition vers "paid"
6. **Vérifier l'affichage du QR** → QR code visible avec instructions

### 2. Test 3DS
1. **Utiliser la carte 3DS** : 4000 0025 0000 3155
2. **Vérifier la redirection** → Doit ouvrir le navigateur
3. **Compléter l'authentification** → Code SMS ou autre méthode
4. **Vérifier le retour** → Doit revenir à l'app
5. **Vérifier le succès** → Paiement confirmé

### 3. Test des Erreurs
1. **Carte refusée** → Vérifier le message d'erreur
2. **Carte insuffisante** → Vérifier le message approprié
3. **Annulation utilisateur** → Vérifier le retour à l'état "ready"
4. **Timeout réseau** → Simuler une perte de connexion

### 4. Test du Polling
1. **Démarrer un paiement** → Attendre le succès UI
2. **Vérifier le polling** → Logs toutes les 2 secondes
3. **Attendre la confirmation** → Jusqu'à 60 secondes max
4. **Vérifier le timeout** → Message d'erreur après 60s

## 🐛 Dépannage

### Stripe ne s'initialise pas
- Vérifier la clé publishable dans le code
- Vérifier la connexion internet
- Vérifier les logs de console

### PaymentSheet ne s'affiche pas
- Vérifier que `initPaymentSheet` a réussi
- Vérifier les paramètres de configuration
- Vérifier que StripeProvider est bien monté

### 3DS ne fonctionne pas
- Vérifier le schéma d'URL dans app.json
- Vérifier la configuration iOS/Android
- Tester avec une vraie carte 3DS

### Polling infini
- Vérifier que le webhook Stripe fonctionne
- Vérifier que `checkout.getStatus` retourne le bon statut
- Vérifier les logs côté serveur

## 📱 Configuration Technique

### Deep Linking
```json
// iOS
"CFBundleURLSchemes": ["mobile"]

// Android
"intentFilters": [
  {
    "scheme": "mobile"
  }
]
```

### StripeProvider
```typescript
<StripeProvider
  publishableKey={publishableKey}
  urlScheme="mobile"
  merchantIdentifier="merchant.com.vendingmachine"
>
  {children}
</StripeProvider>
```

### PaymentSheet Config
```typescript
{
  merchantDisplayName: 'Vending Machine',
  paymentIntentClientSecret: 'pi_..._secret_...',
  customerId: 'cus_...',
  customerEphemeralKeySecret: 'ek_...',
  allowsDelayedPaymentMethods: false,
  returnURL: 'mobile://stripe-redirect'
}
```

## 🔍 Logs et Debug

### Côté Mobile
```typescript
console.log('Stripe init:', { error });
console.log('Payment result:', { error });
console.log('Polling status:', status);
```

### Côté Serveur
```typescript
console.log('Webhook received:', event.type);
console.log('Order status updated:', orderStatus);
console.log('Payment confirmed:', paymentIntentId);
```

## ✅ Checklist de Validation

- [ ] Stripe s'initialise sans erreur
- [ ] PaymentSheet s'affiche correctement
- [ ] Paiement avec carte de succès fonctionne
- [ ] 3DS redirige et revient correctement
- [ ] Polling détecte la confirmation
- [ ] QR code s'affiche après paiement
- [ ] Gestion des erreurs fonctionne
- [ ] Deep linking 3DS fonctionne
- [ ] Timeout de 60s est respecté
- [ ] Aucun secret n'est exposé côté mobile

## 🚀 Prochaines Étapes

1. **Remplacer les mocks** par de vrais appels tRPC
2. **Intégrer la vraie clé publishable** depuis le serveur
3. **Tester avec de vrais webhooks** Stripe
4. **Optimiser le polling** selon les besoins
5. **Ajouter des analytics** et métriques
6. **Implémenter la gestion offline** et retry
