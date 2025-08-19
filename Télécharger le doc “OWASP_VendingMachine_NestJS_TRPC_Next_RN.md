
# Couverture OWASP — IoT Vending Machine (NestJS / tRPC / Next.js / RN-Expo / Prisma)

**Version :** 1.0 — _19 août 2025_  
**Périmètre :** Backend **NestJS 11** (tRPC 11, Prisma 6.13, PostgreSQL, JWT/Passport, Stripe), **Next.js 15** (App Router) pour le back‑office, **React Native 0.79 + Expo 53** pour le mobile, monorepo **Turborepo**/**pnpm**.

---

## 0) Architecture & principes de sécurité

- **Auth** : JWT (access court + refresh), **bcrypt** pour les mots de passe, rôles `CUSTOMER` / `OPERATOR` / `ADMIN`.  
- **Validation** : **Zod** partout (tRPC, DTOs), schémas partagés `@/packages/schemas`.  
- **API** : tRPC (type‑safe) servi depuis NestJS (adaptor), Prisma (transactions, contraintes uniques, vérifs côté serveur).  
- **Web** : Next.js App Router + **CSP/HSTS**, cookies `HttpOnly+Secure+SameSite` pour l’admin.  
- **Mobile** : Expo + **SecureStore/Keychain** pour le refresh token (jamais en clair), pas de secrets embarqués.  
- **Paiements** : Stripe (webhooks signés, idempotence, allow‑list d’événements).  
- **Ops** : Scalingo, jobs de nettoyage (réservations expirées), CI (tests, SCA/SAST, SBOM), Renovate/Dependabot.

> Objectif : montrer, pour chaque risque OWASP Top 10 (2021) + API (2023) + Mobile (2024), **ce que ça veut dire chez nous**, les **mesures concrètes** (par couche), et les **preuves** à collecter.

---

## 1) A01 — Broken Access Control (Contrôles d’accès défaillants)

**Chez nous** : BOLA/BOPLA sur `Orders`, `StockReservation`, `Loyalty`, `Machines`.  
**Mesures** :  
- **NestJS/tRPC** : Guards `AuthGuard` + `RolesGuard`, policy d’accès par ressource. Filtrer **serveur‑side** par propriétaire/tenant :

```ts
// trpc/router/orders.ts
export const ordersRouter = t.router({
  getById: t.procedure
    .use(requireAuth())
    .input(z.object({ id: z.string().cuid() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.order.findFirstOrThrow({
        where: { id: input.id, userId: ctx.user.id }, // BOLA hard stop
      });
    }),
});
```

- **Prisma** : toujours joindre le **contexte utilisateur** (`userId`, `role`) dans `where`.  
- **Next.js back‑office** : cacher l’UI ≠ sécurité ; le serveur tranche. Rôles granulaires (vue/écriture, remboursements, restocks).  
- **Mobile** : n’expose pas d’IDs sensibles dans le QR ; utiliser des **tokens opaques** à usage unique et TTL court.  
**Preuves** : tests Jest/Supertest d’accès interdits (`403`), matrice rôles×routes, journaux d’accès refusés.

---

## 2) A02 — Cryptographic Failures (Défaillances cryptographiques)

**Mesures** :  
- **Mots de passe** : `bcrypt` avec facteur de coût calibré (p. ex. 12).  
- **JWT** : Access **15–30 min**, Refresh **≤ 7–14 j**, rotation et invalidation côté serveur (table `RevokedToken` ou versioning).  
- **Transport** : TLS partout, **HSTS**.  
- **Repos** : pas de cartes bancaires (Stripe only), secrets **via env** (Scalingo).  
- **Mobile** : refresh token dans **SecureStore/Keychain** (jamais AsyncStorage), pas de hard‑coding.  
- **Next.js** : cookies admin `Secure; HttpOnly; SameSite=Strict`.  
**Preuves** : snippets de config, capture headers HSTS, politiques de rotation, audit secrets.

---

## 3) A03 — Injection (inclut XSS)

**Mesures** :  
- **Prisma** : requêtes paramétrées by design ; **jamais** de SQL brut concaténé ; si SQL brut → placeholders.  
- **Zod** : valider inputs/params/headers strictement ; listes blanches pour tri/filtre.  
- **Next.js** : **CSP** + éviter `dangerouslySetInnerHTML`; si nécessaire → `nonce`.  
- **tRPC** : renvoyer des erreurs normalisées (pas de fuite de stack).  
**Preuves** : tests d’injection Supertest, rapport ZAP (DAST), CSP active.

---

## 4) A04 — Insecure Design

**Mesures** :  
- **Threat modeling** (STRIDE) sur flux sensibles : réservation (décrément stock), pickup via **QR à usage unique**, remboursements Stripe.  
- **Double‑validation** & confirmations pour opérations critiques admin (remboursement, restock).  
- **Rate‑limiting** par IP/utilisateur pour login, réservations, webhooks.  
**Preuves** : compte‑rendu de workshops, critères d’acceptation sécurité, tests d’acceptation.

---

## 5) A05 — Security Misconfiguration

**Mesures** :  
- **CORS (NestJS)** : origins **allow‑list** (back‑office prod + app Expo EAS only), méthodes/headers minimaux.  
- **Headers (Next.js)** : CSP, HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, `frame-ancestors 'none'`.  
- **Debug** off en prod, sourcemaps non publics ou protégés.  
**Preuves** : `next.config.js` headers, capture Observatory, config CORS.

```ts
// next.config.js
const csp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-__CSP_NONCE__'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.example.com",
  "frame-ancestors 'none'",
].join('; ');

module.exports = {
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "no-referrer" },
        { key: "Permissions-Policy", value: "geolocation=(), camera=()" },
      ],
    }];
  },
};
```

---

## 6) A06 — Vulnerable & Outdated Components

**Mesures** :  
- **pnpm** : `pnpm audit`, Renovate/Dependabot, **lockfiles** commités.  
- **SBOM** : CycloneDX pour monorepo.  
- **SLA patch** : criticité CVSS → délai de correction documenté.  
**Preuves** : rapports SCA, SBOM versionné, PRs de mises à jour.

---

## 7) A07 — Identification & Authentication Failures

**Mesures** :  
- **Login** : anti‑bruteforce + cooldown.  
- **Admin** : **MFA** (TOTP/OTP via e‑mail au minimum), session courte.  
- **Reset** : liens expirable + jeton **one‑time**.  
- **JWT** : rotation refresh, liste de révocation.  
- **CSRF** : si cookies pour back‑office → CSRF token synchronizer.  
**Preuves** : tests E2E des flux d’auth, captures MFA, revocation list.

```ts
// nest rate limit (ex: @nestjs/throttler)
@UseInterceptors(ThrottlerGuard)
@Throttle(5, 60) // 5 req/min sur login
login() {/* ... */}
```

---

## 8) A08 — Software & Data Integrity Failures

**Mesures** :  
- **CI/CD** : branches protégées, **reviews obligatoires**, builds reproductibles, vérif d’intégrité artefacts.  
- **Webhooks Stripe** : vérifier `Stripe-Signature` + tolérance temporelle + **allow‑list** des types d’événements.  
- **Idempotence** : table `OrderAction` (clé unique) pour éviter doubles exécutions.  
**Preuves** : log de signature Stripe, screenshots des protections de branche, tests d’idempotence.

```ts
// Stripe webhook (NestJS)
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: '2024-06-20' });
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
// vérifier event.type contre une allow-list
```

---

## 9) A09 — Security Logging & Monitoring Failures

**Mesures** :  
- **Logs structurés** (JSON) avec `requestId`, **audit trail** pour : création/suppression produits, restocks, remboursements, pickup.  
- **Alerting** : pics 401/403, échecs webhook Stripe, échecs DB, taux de réservations expirées.  
- **Vie privée** : pas de PII/Secrets dans les logs, rétention limitée.  
**Preuves** : extraits de logs (anonymisés), règles d’alerte, tableaux de bord.

---

## 10) A10 — Server‑Side Request Forgery (SSRF)

**Mesures** :  
- **Interdiction par défaut** des fetch serveurs vers des URLs utilisateur. Si besoin : **allow‑list** de domaines, blocage IP privées/metadata, timeouts.  
- **Uploads** : préférer **pre‑signed URLs** vers le stockage (upload direct depuis client).  
**Preuves** : tests SSRF (ZAP/Burp), config deny‑list/allow‑list.

---

## 11) Spécifiques OWASP **API Security Top 10 (2023)**

- **API1 BOLA**/**API3 BOPLA** : filtrage par propriétaire + whitelists de champs modifiables ; Zod `strip()` et `readonly()` côté server.  
- **API4 Unrestricted Resource Consumption** : rate‑limits, pagination obligatoire, taille max payload.  
- **API5 Broken Function Level Auth** : routes admin sous `/admin/*` + `RolesGuard`.  
- **API6 Unrestricted Access to Business Flows** : protéger les **réservations/pickup/remboursements** contre l’automatisation (cooldown, limites/jour).  
- **API9 Improper Inventory Management** : inventaire des routes tRPC (génération OpenAPI si exposée), versions dépréciées désactivées.  
- **API10 Unsafe Consumption of APIs** : valider schémas des réponses tiers (Stripe SDK ok), gérer timeouts/erreurs/retries.

---

## 12) Spécifiques **Mobile (Expo/React Native)**

- **Stockage** : refresh token via **SecureStore/Keychain** ; pas de secret dans le bundle.  
- **Réseau** : TLS obligatoire ; optionnel **SSL pinning** si menace élevée (EAS build + lib compatible).  
- **QR codes** : données **opaques**, TTL court, usage unique ; pas d’ID utilisateur/PII en clair.  
- **Build** : **release** signée, logs verbeux désactivés, permissions minimales.  
- **Vie privée** : minimisation des données, purge locale à la déconnexion.

---

## 13) Extraits pratiques (copier/coller)

**CORS restrictif (NestJS)**
```ts
app.enableCors({
  origin: ['https://iot-vending-machine-web.vercel.app', 'exp://exp.host...'], // origins exacts
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true,
});
```

**Guard rôles (NestJS)**
```ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    const required = this.reflector.get<Role[]>('roles', ctx.getHandler()) || [];
    return required.length === 0 || required.includes(user.role);
  }
}
```

**tRPC middleware auth + role**
```ts
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { user: ctx.user } });
});

const requireRole = (roles: Role[]) => t.middleware(({ ctx, next }) => {
  if (!roles.includes(ctx.user.role)) throw new TRPCError({ code: 'FORBIDDEN' });
  return next();
});
```

**Prisma : idempotence et concurrence**  
- Clé unique `(orderId, action)` dans `OrderAction`.  
- Utiliser transactions `prisma.$transaction` pour décrément stock + créer réservation atomiquement.

```ts
await prisma.$transaction(async (tx) => {
  await tx.orderAction.create({ data: { orderId, action: 'RESERVE' } }); // unique
  const slot = await tx.slot.update({
    where: { id: slotId, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });
  if (!slot) throw new Error('Out of stock');
  await tx.stockReservation.create({ data: { orderId, slotId, expiresAt } });
});
```

**Next.js : éviter le XSS (App Router)**  
- Utiliser `metadata`/`generateMetadata` plutôt que injecter du HTML.  
- CSP avec **nonce** passé via `headers()` + `unstable_headers()` au render si besoin d’inline script contrôlé.

---

## 14) Checklist de sortie (prête à cocher)

- [ ] BOLA/BOPLA testés (403 sur accès cross‑user).  
- [ ] **Rate‑limiting** en place sur login, réservations, webhooks.  
- [ ] **CSP/HSTS** + **CORS allow‑list** + headers sécurité actifs.  
- [ ] **JWT** courts + refresh avec rotation + liste de révocation.  
- [ ] **MFA** activée pour `ADMIN`.  
- [ ] **Stripe** : webhooks vérifiés + allow‑list d’événements + idempotence testée.  
- [ ] **SBOM** générée ; dépendances à jour (pnpm audit/Renovate).  
- [ ] **Logs structurés** + alerting ; audit trail sur actions critiques.  
- [ ] **Mobile** : SecureStore/Keychain, pas de secrets en dur, build release signé.  
- [ ] **QR** : tokens opaques, TTL court, usage unique.  

---

## 15) Preuves à annexer

- Rapports de tests (Jest/Supertest, ZAP/DAST), captures headers, extraits de logs (anonymisés), screenshots Stripe (signatures), règles d’alerte, SBOM, PRs de hardening.

