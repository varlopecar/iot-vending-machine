# Setup Back-Office - Récapitulatif

## ✅ Fonctionnalités implémentées

### 1. Authentification Admin
- **Route backend** : `auth.adminLogin` avec vérification du rôle (ADMIN/OPERATOR)
- **Context d'authentification** côté web avec localStorage
- **AuthGuard** pour protéger les routes
- **Page de login** `/login` avec interface moderne
- **Déconnexion** dans le header

### 2. Configuration tRPC
- **Client tRPC** configuré côté web avec transformation superjson
- **Headers d'authentification** automatiques (Bearer token)
- **URL backend** pointant vers `http://localhost:3001/trpc`
- **Provider tRPC** avec React Query intégré

### 3. Navigation et Layout
- **4 pages principales** configurées :
  - Dashboard (`/`)
  - Produits (`/products`)
  - Machines (`/machines`)
  - Statistiques (`/analytics`)
- **Sidebar responsive** avec animations
- **Header** avec informations utilisateur et déconnexion

### 4. Pages implémentées

#### Dashboard
- **Cartes de vue d'ensemble** : nombre de machines, produits, revenus
- **État des machines** en temps réel via tRPC
- **Indicateurs de statut** visuels (en ligne, hors ligne, maintenance)

#### Machines
- **Liste des machines** avec statuts colorés
- **Filtrage et sélection** d'une machine
- **Interface pour voir les détails** (placeholder pour futur développement)
- **Boutons d'actions** (ravitailler, modifier)

#### Produits
- **Liste des produits** avec images et prix
- **Statut actif/inactif** visible
- **Badges d'allergènes** affichés
- **Boutons d'import CSV** et ajout manuel

#### Statistiques
- **Page placeholder** avec zones pour :
  - Produits populaires
  - Revenus par machine
  - Évolution des ventes
  - Horaires de pointe

## 🔐 Comptes de test

### Admin principal
- **Email** : `admin@vendingmachine.com`
- **Mot de passe** : `admin123`
- **Rôle** : ADMIN

### Opérateur
- **Email** : `operator@vendingmachine.com`
- **Mot de passe** : `password123`
- **Rôle** : OPERATOR

## 🚀 Pour démarrer

1. **Backend** (port 3001)
```bash
cd apps/backend
pnpm dev
```

2. **Frontend** (port 3000)
```bash
cd apps/web
pnpm dev
```

3. **Accès au back-office**
- Aller sur `http://localhost:3000/login`
- Se connecter avec un compte admin
- Naviguer dans les différentes sections

## 📝 Données disponibles

Le système utilise les données seedées :
- **Machines** : 3 distributeurs dans différents emplacements
- **Produits** : 5 produits avec images, prix et informations nutritionnelles
- **Stocks** : Configuration des slots par machine
- **Utilisateurs** : Admin et opérateur

## 🔄 Routes tRPC utilisées

- `machines.getAllMachines` - Liste des machines
- `products.getAllProducts` - Liste des produits
- `auth.adminLogin` - Authentification admin

## ⚡ Fonctionnalités en cours

### Prochaines étapes recommandées :
1. **Détails des machines** avec gestion des stocks par slot
2. **Formulaires d'ajout/modification** des produits et machines
3. **Import CSV** pour les produits
4. **Bouton "Ravitailler"** pour remettre les stocks au maximum
5. **Graphiques et statistiques** détaillées
6. **Gestion des alertes** de stock faible

### Architecture technique
- ✅ Authentication avec JWT
- ✅ tRPC pour l'API type-safe
- ✅ Prisma ORM avec PostgreSQL
- ✅ React avec TypeScript
- ✅ Tailwind CSS pour le styling
- ✅ Framer Motion pour les animations

Le back-office est maintenant fonctionnel avec une base solide pour l'extension future !
