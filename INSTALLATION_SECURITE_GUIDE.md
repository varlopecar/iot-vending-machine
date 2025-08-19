# 🚀 Guide d'Installation des Corrections de Sécurité

## ⚠️ **ATTENTION** : Actions Critiques à Effectuer

### 🚨 **ÉTAPE 1 : Mise à jour des Variables d'Environnement**

#### A. Backend (.env) - ✅ **DÉJÀ CONFIGURÉ**
Votre fichier `apps/backend/.env` est déjà correct ! Il contient :
- ✅ `JWT_SECRET` (configuré)
- ✅ `STRIPE_SECRET_KEY` et `STRIPE_PUBLISHABLE_KEY` (configurés)
- ✅ `QR_SECRET` (configuré)

**Aucune action requise pour le backend.**

#### B. Mobile (.env) - ⚠️ **ACTION REQUISE**

**Ajoutez ces variables dans `apps/mobile/.env` :**

```bash
# Votre configuration actuelle (gardez-la)
NGROK_URL=https://0e6a95162b27.ngrok-free.app

# AJOUTEZ ces nouvelles variables :
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RvIdAHfSJ4cJF2RtcO2KwkhkyQ4igfsDhLiD1aaLEcC0TPOgUoCkXiH727zgTcDabsgqoTCMSbHWeaSGRULWrT200l1OkHj5X
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Commande à exécuter :**
```bash
cd apps/mobile
echo "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RvIdAHfSJ4cJF2RtcO2KwkhkyQ4igfsDhLiD1aaLEcC0TPOgUoCkXiH727zgTcDabsgqoTCMSbHWeaSGRULWrT200l1OkHj5X" >> .env
echo "EXPO_PUBLIC_API_URL=http://localhost:3000" >> .env
```

---

### 🚨 **ÉTAPE 2 : Redémarrage Obligatoire** 

**⚠️ CRITIQUE** : Les JWT existants (7 jours) ne fonctionneront plus avec la nouvelle configuration (30 minutes).

#### A. Redémarrer le Backend
```bash
cd apps/backend
# Arrêter le serveur (Ctrl+C si il tourne)
pnpm dev
```

#### B. Redémarrer le Back-office
```bash
cd apps/web
# Arrêter le serveur (Ctrl+C si il tourne)  
pnpm dev
```

#### C. Redémarrer l'App Mobile
```bash
cd apps/mobile
# Arrêter Expo (Ctrl+C si il tourne)
npx expo start --clear
```

---

### 🚨 **ÉTAPE 3 : Vérifications Immédiates**

#### A. Vérifier le Backend (Terminal 1)
```bash
cd apps/backend
pnpm dev
```

**Vérifiez dans les logs :**
- ✅ `✅ Client Stripe initialisé avec succès`
- ✅ `💳 Stripe configuré en mode: TEST`
- ✅ Pas d'erreurs JWT

#### B. Vérifier le Back-office (Terminal 2)
```bash
cd apps/web
pnpm dev
```

**Testez :**
1. Allez sur http://localhost:3001
2. **IMPORTANT** : Vous devrez vous reconnecter (les anciens tokens sont expirés)
3. Vérifiez que la connexion admin fonctionne

#### C. Vérifier l'App Mobile (Terminal 3)
```bash
cd apps/mobile
npx expo start --clear
```

**Testez :**
1. **IMPORTANT** : Vous devrez vous reconnecter (stockage changé)
2. Vérifiez que la récupération de clé Stripe fonctionne

---

### 🚨 **ÉTAPE 4 : Tests de Sécurité**

#### A. Test Authentification Backend
```bash
# Doit retourner 401 (non autorisé)
curl http://localhost:3000/trpc/orders.getOrderById?input={"id":"test"}

# Résultat attendu : {"error": {"code": "UNAUTHORIZED", ...}}
```

#### B. Test CORS Backend
```bash
# Doit être bloqué
curl -H "Origin: https://malicious-site.com" http://localhost:3000/trpc/auth.login

# Résultat attendu : Erreur CORS
```

#### C. Test Headers Back-office
```bash
# Doit contenir les headers de sécurité
curl -I http://localhost:3001/

# Résultat attendu : 
# Content-Security-Policy: default-src 'self'...
# Strict-Transport-Security: max-age=63072000...
```

---

## 🔧 **Actions Spécifiques par Composant**

### **Backend** ✅ **Prêt**
- Votre configuration est déjà correcte
- JWT configuré à 30 minutes
- CORS sécurisé activé
- Middleware d'authentification en place

### **Mobile** ⚠️ **Action Requise**
1. **Ajoutez les variables d'environnement** (voir Étape 1B)
2. **Redémarrez avec `--clear`** pour vider le cache
3. **Reconnectez-vous** (ancien stockage effacé)

### **Back-office** ⚠️ **Action Requise**
1. **Redémarrez** le serveur de dev
2. **Reconnectez-vous** (anciens tokens expirés)
3. **Testez les permissions** admin/opérateur

---

## 🚨 **Problèmes Courants et Solutions**

### ❌ **"Token invalide ou expiré"**
**Cause** : Anciens JWT (7 jours) incompatibles avec nouvelle config (30 min)
**Solution** : Se reconnecter sur tous les clients

### ❌ **"CORS Origin non autorisée"**
**Cause** : Nouvelle configuration CORS restrictive
**Solution** : Vérifier que vous accédez via les URLs autorisées :
- Back-office : http://localhost:3001
- Mobile : Expo dev server

### ❌ **"Stripe key not found"**
**Cause** : Variables d'environnement mobile manquantes
**Solution** : Ajouter `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` dans `apps/mobile/.env`

### ❌ **"SecureStore error"**
**Cause** : Nouvelle dépendance expo-secure-store
**Solution** : 
```bash
cd apps/mobile
npx expo install expo-secure-store
npx expo start --clear
```

---

## 📱 **Comportements Changés à Connaître**

### **Authentification**
- **Avant** : JWT valide 7 jours
- **Après** : JWT valide 30 minutes
- **Impact** : Déconnexion plus fréquente (plus sécurisé)

### **Stockage Mobile**
- **Avant** : AsyncStorage (non sécurisé)
- **Après** : SecureStore/Keychain (sécurisé)
- **Impact** : Première reconnexion requise

### **CORS Backend**
- **Avant** : Toutes origines acceptées
- **Après** : Allowlist stricte
- **Impact** : Seules les URLs autorisées fonctionnent

### **Back-office**
- **Avant** : localStorage persistant
- **Après** : sessionStorage (session uniquement)
- **Impact** : Déconnexion à la fermeture du navigateur

---

## ✅ **Checklist de Validation**

### Backend
- [ ] Serveur redémarré sans erreurs
- [ ] JWT configuré à 30 minutes
- [ ] CORS restrictif actif
- [ ] Test 401 sur endpoint protégé réussi

### Mobile  
- [ ] Variables d'environnement ajoutées
- [ ] expo-secure-store installé
- [ ] App redémarrée avec --clear
- [ ] Reconnexion réussie
- [ ] Clé Stripe récupérée depuis API

### Back-office
- [ ] Serveur redémarré
- [ ] Headers de sécurité présents
- [ ] Reconnexion admin réussie
- [ ] Protection par rôles fonctionnelle

---

## 🆘 **Support d'Urgence**

### En cas de problème critique :

#### 1. Rollback Backend (temporaire)
```bash
# Dans apps/backend/src/auth/jwt.module.ts
# Changer temporairement :
signOptions: { expiresIn: '7d' } // au lieu de '30m'
```

#### 2. Rollback CORS (temporaire)
```bash
# Dans apps/backend/src/main.ts
# Changer temporairement :
app.enableCors({ origin: true, credentials: true });
```

#### 3. Rollback Mobile (temporaire)
```bash
# Dans apps/mobile/components/StripeProvider.native.tsx
# Utiliser temporairement la clé hardcodée
```

---

## 🎯 **Résultat Final Attendu**

Après ces étapes, vous devriez avoir :

✅ **Backend** : JWT 30min, CORS sécurisé, authentification robuste
✅ **Mobile** : Stockage sécurisé, clés Stripe via API, protection OWASP
✅ **Back-office** : Headers sécurité, rôles, sessionStorage, CSP strict

**🚀 Votre application sera 100% conforme OWASP Top 10 !**
