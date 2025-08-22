## Plan de correction des bogues

Ce document recense les anomalies et régressions détectées durant la recette, leur analyse, et les actions de correction menées pour garantir le bon fonctionnement du logiciel conformément à l’attendu.

Colonnes: ID, Description du bogue, Composant (Mobile/BO/Machine), Gravité, Priorité, Cause racine, Correction prévue / réalisée, Responsable, Statut, Date de correction, Commentaires / Points d’amélioration.

| ID | Description du bogue | Composant (Mobile/BO/Machine) | Gravité | Priorité | Cause racine | Correction prévue / réalisée | Responsable | Statut | Date de correction | Commentaires / Points d’amélioration |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Écran QR: échec de récupération commande + chargement incorrect | Mobile | Bloquant | Haute | Mauvaise gestion du rafraîchissement (setTick) et état de chargement concurrent | Supprimer l’intervalle, restaurer l’état de chargement, ajuster appels GET | andreascastello | Corrigé | 2025-08-21 | Ajouter tests E2E QR + throttling du polling. Commit cd9562f |
| 2 | Manque des providers TRPC/Auth provoquant erreurs runtime | BO (web) | Majeur | Haute | Providers omis après refactorisation Layout | Ajouter `AuthProvider` et `TRPCProvider` au layout | varlopecar | Corrigé | 2025-08-20 | Test d’intégration auth-guard. Commit 8dd72a5 |
| 3 | Erreurs de build du back-office (types/pages) | BO (web) | Majeur | Haute | Incohérences de types et config Next | Corrections de types, ajustements pages, config | varlopecar | Corrigé | 2025-08-20 | Activer CI de type-check strict. Commit d2aaaf5 |
| 4 | Échecs de déploiement backend (pipeline) | Backend | Majeur | Haute | Mauvaise config GHA (caches/steps) | Mettre à jour workflow, corriger étapes install/build | varlopecar | Corrigé | 2025-08-20 | Ajouter smoke test post-deploy. Commit a16f519 |
| 5 | Mobile: problèmes de build et de tests après refactors | Mobile | Majeur | Haute | Config Expo/Jest et imports incohérents | Mettre à jour tests, providers, écrans impactés | varlopecar | Corrigé | 2025-08-20 | Lancer tests sur CI mobile. Commit 64e396d |
| 6 | Accessibilité: contrastes/labels insuffisants (statistiques) | BO (web) | Mineur | Moyenne | Manque d’attributs ARIA et contrastes | Ajuster couleurs, rôles ARIA, structure | EnzoCasalini | Corrigé | 2025-08-17 | Audit a11y automatisé (axe). Commit 36ea9a7 |
| 7 | Barre latérale: overflow provoquant défilement indésirable | BO (web) | Mineur | Moyenne | CSS overflow non contrôlé | Fix CSS sur sidebar / conteneurs | EnzoCasalini | Corrigé | 2025-08-17 | Ajout test visuel. Commit 6afb3e3 |
| 8 | Fichier de tests Stripe manquant (flakiness CI) | Backend | Mineur | Basse | Suppression accidentelle du spec | Restaurer `stripe.service.spec.ts` | andreascastello | Corrigé | 2025-08-18 | Protéger tests critiques. Commit 97a6d4c |
| 9 | Régression: suppression des jobs planifiés | Backend | Majeur | Haute | Lignes supprimées dans serveur TRPC | Réintégrer enregistrement des jobs au démarrage | EnzoCasalini | En cours | 2025-08-15 | Ajouter test de démarrage qui vérifie la planification. Commit 90ad976 |
| 10 | Alertes: incohérences données UI/Backend | Multi (Backend + BO) | Majeur | Haute | Contrats tRPC/Prisma et mapping UI | Harmoniser schémas, services, composants liste | EnzoCasalini | Corrigé | 2025-08-15 | Ajouter tests contrat tRPC. Commit b403245 |
| 11 | Produits/Stocks: divers correctifs (listes/filtrage) | Multi (Backend + BO) | Majeur | Haute | Logique service/typage partiellement alignée | Ajuster routers/services + composants produits | EnzoCasalini | Corrigé | 2025-08-15 | Ajouter tests d’intégration produits. Commit 680a58c |
| 12 | Scalingo: surconsommation mémoire | Backend | Majeur | Haute | Flags Node/Prisma inadéquats | Ajuster dépendances/flags mémoire | varlopecar | Corrigé | 2025-08-15 | Surveiller métriques post-deploy. Commit 8d7510d |
| 13 | Scalingo: génération Prisma Client en échec | Backend | Majeur | Haute | Étapes build Prisma incomplètes | Corriger scripts build et postinstall | varlopecar | Corrigé | 2025-08-14 | Vérifier cache PNPM/Prisma. Commit b12866f |
| 14 | Mobile: crash page fidélité (couleur non exposée) | Mobile | Bloquant | Haute | `colors.buttonText` non exposée par hook thème | Exposer couleurs dans `useTailwindTheme` | EnzoCasalini | Corrigé | 2025-08-08 | Ajouter test rendu fidélité. Commit f0216e5 |
| 15 | Navigation onglets instable (barre/route) | Mobile | Majeur | Moyenne | Problèmes de config `CustomTabBar` | Corriger config et rendu barre | EnzoCasalini | Corrigé | 2025-08-07 | Tests UI navigation. Commits a3e27f2, c4846f8, 0c91ba2 |

### Notes

- Les dates proviennent des commits correspondants. N’hésitez pas à consulter `git log` pour le détail complet (hash complets, diff). 
- Cette liste est construite à partir de l’historique et regroupe certains commits de « fix types/pipeline » en entrées actionnables.
- Pour toute nouvelle anomalie détectée, ajouter une ligne avec le même format et référencer le hash de commit lorsqu’il existe.


