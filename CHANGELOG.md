# Changelog

Ce projet suit un format inspiré de Keep a Changelog et Conventional Commits.

## [Unreleased]

- Build/Chore: mise à jour de `turbo` vers `^2.5.6` (staged)
- Build: mise à jour de `pnpm-lock.yaml` (staged)

## [0.0.2] - 2025-08-22

- Backend:
  - feat: bump version to 0.0.2 et ajout du logging d’horodatage de déploiement (`fc15e58`).
- CI/CD & Déploiement (Scalingo):
  - fix: config SSH ED25519 et robustesse déploiement (`56fc539`, `ce49ef4`, `f2deed9`, `68ae2cf`, `e3409a3`, `096dd33`, `87f7ab6`, `30a18d4`, `070b1ed`, `3938d7a`, `6737c12`).
  - chore: configuration et amélioration de la clarté des workflows (`77e6b92`, `b072c96`).
- Mobile:
  - chore: simplification des configs EAS et login (`080adeb`, `77e6b92`).
  - feat: ajout des plateformes cibles et d’un mock Stripe web (`7ca6a09`).
  - fix: remplacement de `EventEmitter` Node par une implémentation compatible React Native (`7166b9c`).
  - fix: déplacement de `react-native-svg-transformer` dans `dependencies` et lockfile mis à jour (`2c79148`, `ac2a27b`).
  - ci: builds iOS rendus optionnels (`58d9537`).

## [0.0.1] - 2025-08-17

- Web (Back-Office):
  - accessibilité: ajustements sur statistiques, détails machine, liste machines, produits, dashboard (`36ea9a7`, `a8e40f1`, `fd2c99c`, `bb7f0a9`, `988efa5`).
  - types: corrections de typage et composants UI/Forms (`924a1cd`, `ba71234`, `066cf0d`).
  - déploiement: corrections de configuration et vercel (`cd41e01`).
- Backend:
  - tests/pipeline: stabilisation et corrections (inventaire, Stripe, jobs) (`b316671`, `f412e8b`).

## [0.0.0] - 2025-08-08

- Mobile:
  - fix: crash page fidélité en exposant `colors.buttonText` dans `useTailwindTheme` (`f0216e5`).
  - fix: stabilité de la barre de navigation/onglets (`a3e27f2`, `c4846f8`, `0c91ba2`).


[Unreleased]: ./
[0.0.2]: ./
[0.0.1]: ./
[0.0.0]: ./
