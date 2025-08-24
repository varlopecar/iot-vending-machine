# Changelog

This project follows a format inspired by Keep a Changelog and Conventional Commits.

## [Unreleased]

- Build/Chore: update `turbo` to `^2.5.6` (staged)
- Build: update `pnpm-lock.yaml` (staged)

## [0.0.3] - 2025-01-27

- Documentation:
  - feat: comprehensive README.md update with Stripe integration details
  - feat: create CONTRIBUTING.md with detailed contribution guidelines
  - feat: update CHANGELOG.md to English format
- Backend:
  - feat: robust Stripe payment integration with webhook handling
  - feat: payment idempotency to prevent duplicate transactions
  - feat: comprehensive payment event logging and audit trails
  - feat: refund support with partial and full refunds
  - feat: enhanced error handling for payment processing
- CI/CD & Deployment (Scalingo):
  - fix: SSH ED25519 configuration and deployment robustness
  - chore: workflow configuration and clarity improvements
- Mobile:
  - chore: EAS configuration and login simplification
  - feat: target platforms and Stripe web mock implementation
  - fix: replace Node EventEmitter with React Native compatible implementation
  - fix: move react-native-svg-transformer to dependencies and update lockfile
  - ci: make iOS builds optional

## [0.0.2] - 2025-08-22

- Backend:
  - feat: bump version to 0.0.2 and add deployment timestamp logging (`fc15e58`).
- CI/CD & Deployment (Scalingo):
  - fix: SSH ED25519 configuration and deployment robustness (`56fc539`, `ce49ef4`, `f2deed9`, `68ae2cf`, `e3409a3`, `096dd33`, `87f7ab6`, `30a18d4`, `070b1ed`, `3938d7a`, `6737c12`).
  - chore: workflow configuration and clarity improvements (`77e6b92`, `b072c96`).
- Mobile:
  - chore: EAS configuration and login simplification (`080adeb`, `77e6b92`).
  - feat: add target platforms and Stripe web mock (`7ca6a09`).
  - fix: replace Node EventEmitter with React Native compatible implementation (`7166b9c`).
  - fix: move react-native-svg-transformer to dependencies and update lockfile (`2c79148`, `ac2a27b`).
  - ci: make iOS builds optional (`58d9537`).

## [0.0.1] - 2025-08-17

- Web (Back-Office):
  - accessibility: adjustments on statistics, machine details, machine list, products, dashboard (`36ea9a7`, `a8e40f1`, `fd2c99c`, `bb7f0a9`, `988efa5`).
  - types: typing corrections and UI/Forms components (`924a1cd`, `ba71234`, `066cf0d`).
  - deployment: configuration and Vercel corrections (`cd41e01`).
- Backend:
  - tests/pipeline: stabilization and corrections (inventory, Stripe, jobs) (`b316671`, `f412e8b`).

## [0.0.0] - 2025-08-08

- Mobile:
  - fix: loyalty page crash by exposing `colors.buttonText` in `useTailwindTheme` (`f0216e5`).
  - fix: navigation bar/tabs stability (`a3e27f2`, `c4846f8`, `0c91ba2`).

[Unreleased]: ./
[0.0.3]: ./
[0.0.2]: ./
[0.0.1]: ./
[0.0.0]: ./
