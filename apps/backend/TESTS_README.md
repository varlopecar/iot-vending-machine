# Tests du Backend - Documentation

## 📋 Vue d'ensemble

Ce document décrit la suite de tests complète pour le backend de la plateforme de distributeurs automatiques connectés. Les tests couvrent les fonctionnalités critiques du système, incluant l'authentification, la gestion des commandes, les paiements, la fidélité, et la gestion des stocks.

## 🏗️ Architecture des tests

### Types de tests

1. **Tests unitaires** (`*.spec.ts`)
   - Testent les services individuels
   - Utilisent des mocks pour les dépendances
   - Exécution rapide et isolation

2. **Tests d'intégration** (`*.integration.spec.ts`)
   - Testent les interactions entre services
   - Utilisent une base de données de test
   - Vérifient les flux complets

3. **Tests de fumée** (`*.smoke.spec.ts`)
   - Tests rapides des fonctionnalités critiques
   - Vérifient que l'application démarre correctement

## 📁 Structure des fichiers de test

```
apps/backend/
├── src/
│   ├── auth/
│   │   └── auth.service.spec.ts          # Tests du service d'authentification
│   ├── orders/
│   │   └── orders.service.spec.ts        # Tests du service des commandes
│   ├── products/
│   │   └── products.service.spec.ts      # Tests du service des produits
│   ├── machines/
│   │   └── machines.service.spec.ts      # Tests du service des machines
│   ├── loyalty/
│   │   └── loyalty.service.spec.ts       # Tests du service de fidélité
│   ├── stocks/
│   │   └── stocks.service.spec.ts        # Tests du service des stocks
│   ├── checkout/
│   │   └── checkout.service.spec.ts      # Tests du service de paiement
│   └── ...
├── test/
│   ├── app.integration.spec.ts           # Tests d'intégration complets
│   ├── app.e2e-spec.ts                   # Tests end-to-end
│   ├── payments.smoke.spec.ts            # Tests de fumée des paiements
│   ├── run-all-tests.sh                  # Script d'exécution
│   └── ...
└── TESTS_README.md                       # Cette documentation
```

## 🚀 Exécution des tests

### Prérequis

```bash
# Installer les dépendances
pnpm install

# Configurer la base de données de test
cp .env.example .env.test
# Modifier .env.test avec les paramètres de test
```

### Commandes disponibles

```bash
# Tests unitaires avec couverture
npm run test:cov

# Tests unitaires en mode watch
npm run test:watch

# Tests d'intégration
npm run test:e2e

# Tests de fumée
npm run test:smoke

# Tous les tests (script personnalisé)
./test/run-all-tests.sh

# Tests en mode debug
npm run test:debug
```

## 📊 Couverture de code

Les tests visent une couverture de code élevée (>90%) pour les fonctionnalités critiques :

- **Services métier** : 95%+
- **Gestion d'erreurs** : 100%
- **Validation des données** : 100%
- **Intégrations externes** : 90%+ (avec mocks)

### Génération du rapport de couverture

```bash
npm run test:cov
```

Le rapport est généré dans `coverage/lcov-report/index.html`

## 🧪 Détail des tests par module

### 1. Service d'Authentification (`auth.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ Inscription d'utilisateur
- ✅ Connexion utilisateur
- ✅ Connexion administrateur
- ✅ Gestion des mots de passe (hashage bcrypt)
- ✅ Génération de codes-barres uniques
- ✅ Gestion des points fidélité
- ✅ Validation des rôles utilisateur

**Cas d'erreur testés :**
- ❌ Tentative d'inscription avec email existant
- ❌ Connexion avec identifiants invalides
- ❌ Accès administrateur sans privilèges
- ❌ Utilisateur introuvable

### 2. Service des Commandes (`orders.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ Création de commande avec validation des stocks
- ✅ Décrémentation automatique des stocks
- ✅ Calcul des points fidélité (1 point/0.50€)
- ✅ Génération de QR codes uniques
- ✅ Validation et expiration des QR codes
- ✅ Annulation de commande avec restauration des stocks
- ✅ Gestion des points fidélité (dépense/épargne)

**Cas d'erreur testés :**
- ❌ Stock insuffisant
- ❌ Commande sans articles
- ❌ QR code invalide ou expiré
- ❌ Annulation de commande non autorisée

### 3. Service des Produits (`products.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ CRUD complet des produits
- ✅ Gestion des informations nutritionnelles
- ✅ Gestion des allergènes
- ✅ Statistiques de vente
- ✅ Filtrage par catégorie
- ✅ Suppression logique (soft delete)

**Cas d'erreur testés :**
- ❌ Produit introuvable
- ❌ Données invalides
- ❌ Gestion des valeurs nulles

### 4. Service des Machines (`machines.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ CRUD complet des machines
- ✅ Statistiques de performance
- ✅ Gestion des statuts (ONLINE/OFFLINE/MAINTENANCE)
- ✅ Calcul des revenus (total et 30 jours)
- ✅ Gestion des alertes de stock
- ✅ Intégration avec le service d'alertes

**Cas d'erreur testés :**
- ❌ Machine introuvable
- ❌ Statut invalide
- ❌ Erreurs de génération d'alertes

### 5. Service de Fidélité (`loyalty.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ Ajout/déduction de points
- ✅ Historique des transactions
- ✅ Avantages disponibles
- ✅ Rédemption d'avantages
- ✅ Pagination de l'historique
- ✅ Extraction de localisation depuis les raisons

**Cas d'erreur testés :**
- ❌ Points insuffisants
- ❌ Avantage introuvable
- ❌ Utilisateur introuvable

### 6. Service des Stocks (`stocks.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ Gestion des stocks par machine
- ✅ Validation des capacités maximales
- ✅ Journalisation des ajustements (restock)
- ✅ Gestion des alertes de stock bas
- ✅ Ajout de slots avec validation
- ✅ Intégration avec le service d'alertes

**Cas d'erreur testés :**
- ❌ Capacité maximale dépassée
- ❌ Stock insuffisant
- ❌ Machine/produit introuvable
- ❌ Limite de 6 slots par machine

### 7. Service de Paiement (`checkout.service.spec.ts`)

**Fonctionnalités testées :**
- ✅ Création d'intention de paiement Stripe
- ✅ Gestion des clients Stripe
- ✅ Validation des commandes
- ✅ Gestion des erreurs Stripe
- ✅ Statut consolidé des paiements
- ✅ Idempotence des paiements

**Cas d'erreur testés :**
- ❌ Commande introuvable ou expirée
- ❌ Accès non autorisé
- ❌ Erreurs Stripe (API, authentification, etc.)
- ❌ Montant invalide

### 8. Tests d'Intégration (`app.integration.spec.ts`)

**Scénarios testés :**
- 🔄 **Parcours utilisateur complet** : Inscription → Commande → Paiement → Récupération
- 💳 **Paiement avec points fidélité** : Dépense et épargne de points
- ❌ **Annulation de commande** : Restauration des stocks
- ⏰ **Expiration de commande** : Gestion des délais
- 📊 **Statistiques machine** : Calculs de performance
- 🚨 **Gestion d'erreurs** : Cas limites et erreurs

## 🔧 Configuration des tests

### Variables d'environnement de test

```env
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/vending_test"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
JWT_SECRET="test-secret"
```

### Base de données de test

```bash
# Créer la base de données de test
createdb vending_test

# Exécuter les migrations
npm run db:migrate

# Seeder les données de test (optionnel)
npm run seed
```

## 🐛 Débogage des tests

### Mode debug

```bash
npm run test:debug
```

### Tests spécifiques

```bash
# Test d'un fichier spécifique
npm test -- auth.service.spec.ts

# Test d'une fonction spécifique
npm test -- --testNamePattern="should register a new user"

# Tests avec couverture détaillée
npm run test:cov -- --collectCoverageFrom="src/auth/**/*.ts"
```

### Logs détaillés

```bash
# Activer les logs Jest
DEBUG=* npm test

# Logs spécifiques
DEBUG=jest:* npm test
```

## 📈 Métriques de qualité

### Objectifs de couverture

| Module | Couverture cible | Couverture actuelle |
|--------|------------------|-------------------|
| Auth | 95% | ✅ |
| Orders | 95% | ✅ |
| Products | 90% | ✅ |
| Machines | 90% | ✅ |
| Loyalty | 90% | ✅ |
| Stocks | 95% | ✅ |
| Checkout | 90% | ✅ |

### Métriques de performance

- **Temps d'exécution total** : < 30 secondes
- **Tests unitaires** : < 5 secondes
- **Tests d'intégration** : < 20 secondes
- **Tests de fumée** : < 5 secondes

## 🚨 Gestion des erreurs

### Types d'erreurs testées

1. **Erreurs de validation**
   - Données manquantes ou invalides
   - Contraintes métier violées

2. **Erreurs d'autorisation**
   - Accès non autorisé
   - Rôles insuffisants

3. **Erreurs de ressources**
   - Entités introuvables
   - Conflits de données

4. **Erreurs externes**
   - Erreurs Stripe
   - Erreurs de base de données

### Stratégies de test d'erreur

- **Mocking** : Simulation d'erreurs externes
- **Injection de données invalides** : Test de validation
- **Manipulation de base de données** : Test de contraintes
- **Simulation de timeouts** : Test de robustesse

## 🔄 Intégration continue

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests Backend
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:cov
      - run: npm run test:e2e
```

### Pré-commit hooks

```bash
# .husky/pre-commit
#!/bin/sh
npm run test:smoke
npm run lint
```

## 📚 Bonnes pratiques

### Écriture des tests

1. **Nommage descriptif** : `should create order with valid data`
2. **Structure AAA** : Arrange, Act, Assert
3. **Tests isolés** : Pas de dépendances entre tests
4. **Mocks appropriés** : Mock des dépendances externes
5. **Assertions multiples** : Vérifier plusieurs aspects

### Maintenance

1. **Mise à jour des mocks** : Synchroniser avec les changements d'API
2. **Révision des cas limites** : Ajouter des tests pour les nouveaux cas
3. **Optimisation** : Réduire le temps d'exécution
4. **Documentation** : Maintenir cette documentation à jour

## 🤝 Contribution

### Ajout de nouveaux tests

1. Créer le fichier de test : `module.service.spec.ts`
2. Suivre la structure existante
3. Ajouter les tests dans cette documentation
4. Vérifier la couverture

### Amélioration des tests existants

1. Identifier les cas manquants
2. Ajouter des tests d'erreur
3. Optimiser les performances
4. Améliorer la lisibilité

## 📞 Support

Pour toute question sur les tests :

1. Consulter cette documentation
2. Vérifier les logs d'erreur
3. Utiliser le mode debug
4. Contacter l'équipe de développement

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0  
**Mainteneur** : Équipe de développement IoT Vending Machine
