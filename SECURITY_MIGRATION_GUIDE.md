# Guide de Migration Sécurité OWASP

## 🚨 Actions Immédiates Requises

### 1. Variables d'Environnement Backend

Ajoutez ces variables dans votre `.env` backend :

```bash
# JWT avec durée courte (CRITIQUE)
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars

# Stripe (si pas déjà configuré)
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Variables d'Environnement Mobile

Créez un fichier `.env` dans `apps/mobile/` :

```bash
# Clé publique Stripe pour fallback développement
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here

# URL du backend
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### 3. Redémarrage Requis

**⚠️ IMPORTANT :** Les JWT existants (7 jours) ne fonctionneront plus avec la nouvelle configuration (30 min). 

**Actions :**
1. Redémarrez le backend
2. Les utilisateurs devront se reconnecter
3. Communiquez cette interruption à l'équipe

## 🔄 Changements de Comportement

### Authentification
- **Avant :** JWT valide 7 jours
- **Après :** JWT valide 30 minutes
- **Impact :** Utilisateurs déconnectés plus fréquemment

### Stockage Mobile
- **Avant :** Tokens dans AsyncStorage (non sécurisé)
- **Après :** Tokens dans SecureStore/Keychain (sécurisé)
- **Impact :** Première connexion après mise à jour requise

### CORS Backend
- **Avant :** Toutes origines acceptées (`origin: true`)
- **Après :** Allowlist stricte
- **Impact :** Configurer les origines autorisées dans `main.ts`

## 🛠️ Configuration Production

### 1. CORS Production

Modifiez `apps/backend/src/main.ts` ligne 25 :

```typescript
const allowedOrigins = [
  'https://votre-backoffice-prod.com',
  'https://votre-app-mobile.com', // Si applicable
  // Retirez les URLs localhost pour la production
];
```

### 2. Headers CSP Production

Modifiez `apps/web/next.config.js` ligne 22 :

```javascript
"connect-src 'self' https://votre-backend-prod.com https://api.stripe.com",
```

### 3. Rate Limiting (Recommandé)

Installez et configurez le rate limiting :

```bash
cd apps/backend
npm install @nestjs/throttler
```

## 🧪 Tests de Validation

### 1. Test Authentification
```bash
# Doit retourner 401 sans token
curl http://localhost:3000/trpc/orders.getOrderById?input={"id":"test"}

# Doit retourner 403 avec token d'un autre utilisateur
curl -H "Authorization: Bearer <token>" http://localhost:3000/trpc/orders.getOrderById?input={"id":"other-user-order"}
```

### 2. Test CORS
```bash
# Doit être bloqué depuis une origine non autorisée
curl -H "Origin: https://malicious-site.com" http://localhost:3000/trpc/auth.login
```

### 3. Test Headers Sécurité
```bash
# Vérifier la présence des headers
curl -I http://localhost:3001/
# Doit contenir : Content-Security-Policy, Strict-Transport-Security, etc.
```

## 🔍 Monitoring à Mettre en Place

### 1. Logs à Surveiller
- Tentatives d'authentification échouées
- Requêtes CORS bloquées  
- Tokens JWT expirés
- Erreurs webhook Stripe

### 2. Alertes Recommandées
- Plus de 10 erreurs 401/403 par minute
- Échec webhook Stripe
- QR codes invalides répétés

## 🚀 Déploiement Étape par Étape

### Étape 1 : Backend
1. Mettre à jour les variables d'environnement
2. Déployer le backend
3. Vérifier les logs de démarrage

### Étape 2 : Back-office
1. Déployer le back-office
2. Tester les headers avec `curl -I`
3. Vérifier l'authentification admin

### Étape 3 : Mobile
1. Créer le build de production
2. Tester la récupération de clé Stripe
3. Vérifier le stockage sécurisé

## ⚠️ Points d'Attention

### 1. Tokens Existants
Tous les tokens JWT existants seront invalidés. Prévoyez une communication utilisateurs.

### 2. Développement Local
Les développeurs devront mettre à jour leurs `.env` locaux avec les nouvelles variables.

### 3. Tests E2E
Mettre à jour les tests automatisés pour gérer la durée JWT plus courte.

## 🆘 Rollback d'Urgence

En cas de problème critique :

### Backend
```typescript
// Dans jwt.module.ts, revenir temporairement à :
signOptions: { expiresIn: '7d' }
```

### CORS
```typescript
// Dans main.ts, revenir temporairement à :
app.enableCors({ origin: true, credentials: true });
```

### Mobile
Supprimer temporairement l'appel API Stripe et utiliser la clé hardcodée.

## 📞 Support

En cas de problème durant la migration :
1. Vérifier les logs backend
2. Tester les endpoints avec curl
3. Vérifier les variables d'environnement
4. Consulter le rapport de sécurité complet

---

**✅ Une fois cette migration terminée, votre application sera conforme aux standards OWASP de sécurité.**
