# VendingAdmin - Back-office

Interface d'administration pour la gestion des machines de distribution connectées.

## 🚀 Fonctionnalités

### Tableau de bord
- Vue d'ensemble des statistiques globales
- Aperçu des commandes récentes
- État en temps réel des machines
- Indicateurs de performance clés

### Gestion des produits
- Catalogue complet des produits
- Édition des prix et informations
- Gestion des catégories
- Suivi des stocks par produit

### Gestion des machines
- Liste de toutes les machines
- Statut de connectivité et fonctionnement
- Informations de localisation
- Métriques de performance par machine

### Gestion des stocks
- Vue globale des niveaux de stock
- Alertes de stock faible et ruptures
- Prévisions de consommation
- Gestion des ravitaillements

### Commandes
- Liste complète des commandes
- Filtrage par statut et période
- Détails des transactions
- Gestion des QR codes

### Statistiques avancées
- Revenus et tendances
- Produits les plus vendus
- Performance comparative des machines
- Analyses de conversion

## 🛠 Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderne et responsive
- **Framer Motion** - Animations fluides
- **tRPC** - Communication type-safe avec le backend
- **Lucide React** - Icônes modernes

## 🎨 Design

Le design s'inspire de l'application mobile avec :
- **Palette de couleurs cohérente** (thèmes clair/sombre)
- **Animations fluides** respectant les préférences d'accessibilité
- **Interface responsive** pour tous les écrans
- **Navigation intuitive** avec sidebar

### Thème clair
- Primaire: `#F9F4EC` (beige doux)
- Secondaire: `#5B715F` (vert sauge)
- Tertiaire: `#E3E8E4` (gris vert)

### Thème sombre
- Primaire: `#2C2221` (brun foncé)
- Secondaire: `#FD9BD9` (rose)
- Tertiaire: `#FECDEC` (rose clair)

## 📱 Pages disponibles

- `/` - Tableau de bord principal
- `/products` - Gestion des produits
- `/machines` - Gestion des machines
- `/stocks` - Gestion des stocks
- `/orders` - Liste des commandes
- `/analytics` - Statistiques et analyses
- `/settings` - Paramètres du système

## 🚀 Démarrage rapide

```bash
# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev

# Accéder au back-office
http://localhost:3001
```

## 🔧 Configuration

### Variables d'environnement
```env
NEXT_PUBLIC_TRPC_URL=http://localhost:3000/api/trpc
```

### Communication avec le backend
Le back-office communique avec le backend NestJS via tRPC pour :
- Récupérer les données des produits, machines, stocks
- Gérer les commandes et transactions
- Obtenir les statistiques et métriques
- Synchroniser les données en temps réel



- [ ] Connecter les endpoints tRPC réels du backend
- [ ] Implémenter l'authentification admin
- [ ] Ajouter la validation des formulaires
- [ ] Intégrer les données temps réel via WebSockets
- [ ] Ajouter la pagination pour les grandes listes
- [ ] Implémenter les exports CSV/PDF
- [ ] Ajouter les tests unitaires et e2e

## 🎯 Prochaines étapes

1. **Authentification** : Système de login sécurisé pour les administrateurs
2. **Temps réel** : WebSockets pour les mises à jour live
3. **Notifications** : Système d'alertes push
4. **Rapports** : Génération de rapports PDF/Excel
5. **Multi-tenant** : Support de plusieurs clients

## 🤝 Contribution

Ce back-office fait partie du projet IoT Vending Machine. Consultez le README principal pour les guidelines de contribution.