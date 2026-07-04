# SONA Boutique — Master Implementation Plan v1.1

> **Status:** Production-Ready Blueprint (Review-Update)
> **Projekt:** Luxusartikel-Reselling (Fokus: Luxushandtaschen)
> **Stack:** Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS v4 · shadcn/ui · Prisma · PostgreSQL/SQLite
> **Geschätzter Gesamtaufwand:** ≈ 67 Personentage (≈ 13 Kalenderwochen)
> **Letzte Aktualisierung:** 2026-07-04 (v1.1 — siehe Appendix H für Review-Notizen)

> **Changelog v1.0 → v1.1:**
> - ➕ TASK 05B (Premium Motion- & Scroll-Animation-System) ergänzt — verbindliche Grundlage für alle Scroll-Effekte/Animationen in TASK 06–08
> - ➕ TASK 20B (Ankaufs- & Konsignations-Flow „Verkaufen") ergänzt — bildet das im Geschäftsmodell (0.2) beschriebene Konsignationsgeschäft technisch ab, das im ursprünglichen Plan fehlte
> - 🔧 Prisma-Schema (TASK 02) um `Consignor`, `ConsignmentRequest`, `ProductSourceType`, `ConsignmentRequestStatus` erweitert
> - 🔧 TASK 06, 07, 08 um Motion-/Scroll-Anforderungen ergänzt (siehe jeweilige Subtasks)
> - 📄 Appendix H (Review-Notizen & offene Empfehlungen) hinzugefügt

---

## 0. Projekt-Übersicht

### 0.1 Vision

SONA Boutique ist ein Online-Marktplatz für authentifizierte, gebrauchte Luxushandtaschen (Louis Vuitton, Chanel, Hermès, Gucci, Prada, MCM, Bottega Veneta, Dior, Saint Laurent, Goyard). Jedes Stück wird vor Verkauf von zertifizierten Gutachtern geprüft und mit einem Echtheitszertifikat ausgeliefert. Die Plattform richtet sich an zahlungskräftige Endkunden in der DACH-Region und EU mit einem durchschnittlichen Warenkorbwert von 1.500–25.000 €.

### 0.2 Geschäftsmodell

- **Angebotsmodell:** Konsignation + Eigenankauf (B2C)
- **Umsatzquelle:** Marge zwischen Ankaufspreis und Verkaufspreis (durchschnittlich 25–40 %)
- **Zielgruppe:** 28–55 Jahre, Haushaltseinkommen >100k €/Jahr
- **Vertriebskanäle:** Primär sona-boutique.de, sekundär Vestiaire Collective / eBay (Multi-Channel)
- **Logistik:** DHL Express mit Versicherung bis 25.000 € Sendungswert

### 0.3 Tech-Stack

| Layer | Technologie | Begründung |
|---|---|---|
| Framework | Next.js 16 (App Router) | Modernste React-Features, RSC, Edge-Ready |
| Sprache | TypeScript 5 (strict) | Type-Safety end-to-end |
| Styling | Tailwind CSS v4 | Atomic CSS, Purging, kleines Bundle |
| UI-Komponenten | shadcn/ui (New York) | Quellcode im Repo, volle Kontrolle, WAI-ARIA |
| Icons | lucide-react | Filigran, baumartig, luxus-tauglich |
| Animationen | Framer Motion | Page-Transitions, Drawer-Effekte |
| ORM | Prisma 6 | Type-safe SQL, Migrationen, SQLite + Postgres |
| Datenbank Dev | SQLite | Sofort lauffähig, keine Infrastruktur nötig |
| Datenbank Prod | PostgreSQL (Supabase/Neon) | Connection-Pooling, PITR, Skalierbarkeit |
| State Client | Zustand + Context API | Flache Lernkurve, performant |
| State Server | TanStack Query v5 | Caching, Refetching, Optimistic Updates |
| Validierung | Zod | Schema-Validierung, type-inference |
| Auth | Custom (argon2 + DB-Sessions) | Volle Kontrolle, keine Vendor-Lock-in |
| Zahlung | Stripe Checkout + Webhooks | PCI-DSS ausgelagert, SCA-konform |
| E-Mail | Resend + React Email | Next.js-native, DKIM/SPF/DMARC-konform |
| Hosting | Vercel | Edge-CDN, Preview-URLs, Auto-SSL |
| Error-Tracking | Sentry | Real-time Exceptions Client + Server |
| Analytics | PostHog (self-hosted) | DSGVO-konform, Funnel-Tracking |
| Suche | Meilisearch | Tippfehler-tolerant, Instant-Search |
| Testing | Vitest + Playwright | Unit + E2E |
| CI/CD | GitHub Actions + Vercel | Branch-Protection, Preview-Deploys |

### 0.4 Architektur-Übersicht

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │  Storefront │  │   Admin     │  │  Account    │  │ Checkout  │  │
│  │  (Public)   │  │   Console   │  │  (Customer) │  │  (Flow)   │  │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘  │
│         │                │                │               │         │
│         └────────────────┴────────────────┴───────────────┘         │
│                              │ fetch()                              │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS (Same-Origin)
┌──────────────────────────────┼──────────────────────────────────────┐
│                    NEXT.JS APP ROUTER (Vercel)                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Middleware (Auth, CSRF, Rate-Limit, Security-Headers)      │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│  ┌─────────────────────────────┴───────────────────────────────┐   │
│  │   /app/api/*  (REST API Routes)                             │   │
│  │   • /api/auth/*      • /api/products/*                       │   │
│  │   • /api/cart/*      • /api/checkout                         │   │
│  │   • /api/orders/*    • /api/admin/*                          │   │
│  │   • /api/webhooks/stripe                                    │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│  ┌─────────────────────────────┴───────────────────────────────┐   │
│  │   /app/*  (Server Components & Pages)                       │   │
│  │   • SSR + ISR + SSG via App Router                          │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│  ┌─────────────────────────────┴───────────────────────────────┐   │
│  │   Business Logic (src/lib/*)                                │   │
│  │   • auth.ts  • cart.ts  • stripe.ts  • email.ts             │   │
│  │   • tax.ts   • promo.ts • search.ts  • pdf.ts               │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
└────────────────────────────────┼────────────────────────────────────┘
                                 │ Prisma Client
┌────────────────────────────────┼────────────────────────────────────┐
│                    DATENBANK (PostgreSQL)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Customer  │ │ Product  │ │  Cart    │ │  Order   │ │ Payment  │ │
│  │ Session  │ │ Variant  │ │ CartItem │ │ OrderItem│ │ Shipment │ │
│  │ Address  │ │ Image    │ │ PromoCode│ │ Review   │ │ Favorite │ │
│  │ Brand    │ │ Category │ │Collection│ │ ProductColl│ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼─────────────────────────┐
        │                        │                         │
   ┌────┴────┐            ┌──────┴──────┐           ┌──────┴──────┐
   │ Stripe  │            │   Resend    │           │ Cloudinary  │
   │ (Pay)   │            │   (Email)   │           │  (Images)   │
   └─────────┘            └─────────────┘           └─────────────┘
```

### 0.5 Verzeichnisstruktur ( finales Repo )

```
sona-boutique/
├── .github/workflows/         # CI/CD Pipelines
├── .env.example               # Template für Env-Variablen
├── .env.local                 # Dev-Secrets (gitignored)
├── next.config.ts             # Next.js Konfiguration
├── tailwind.config.ts         # Tailwind v4 Config
├── tsconfig.json              # TypeScript Strict Mode
├── package.json
├── prisma/
│   ├── schema.prisma          # Datenmodell
│   ├── migrations/            # Auto-generiert
│   └── seed.ts                # Demo-Daten
├── public/
│   ├── robots.txt
│   ├── favicon.ico
│   └── og-default.png
├── src/
│   ├── app/
│   │   ├── (storefront)/      # Öffentliche Shop-Routen
│   │   │   ├── page.tsx                    # Home
│   │   │   ├── catalog/page.tsx            # Katalog
│   │   │   ├── product/[slug]/page.tsx     # Produktdetail
│   │   │   ├── cart/page.tsx               # Warenkorb
│   │   │   ├── checkout/page.tsx           # Checkout
│   │   │   ├── order/[id]/page.tsx         # Bestellbestätigung
│   │   │   ├── account/page.tsx            # Kundenkonto
│   │   │   ├── impressum/page.tsx
│   │   │   ├── datenschutz/page.tsx
│   │   │   ├── agb/page.tsx
│   │   │   └── widerruf/page.tsx
│   │   ├── admin/             # Admin-Console
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── products/page.tsx
│   │   │   ├── products/new/page.tsx
│   │   │   ├── products/[id]/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── orders/[id]/page.tsx
│   │   │   └── promo-codes/page.tsx
│   │   ├── api/               # REST API Routes
│   │   │   ├── auth/{login,register,logout,me,reset}/route.ts
│   │   │   ├── products/route.ts
│   │   │   ├── products/[slug]/route.ts
│   │   │   ├── brands/route.ts
│   │   │   ├── categories/route.ts
│   │   │   ├── collections/route.ts
│   │   │   ├── cart/route.ts
│   │   │   ├── cart/items/[itemId]/route.ts
│   │   │   ├── cart/promo/route.ts
│   │   │   ├── checkout/route.ts
│   │   │   ├── orders/route.ts
│   │   │   ├── orders/[id]/route.ts
│   │   │   ├── favorites/route.ts
│   │   │   ├── favorites/[productId]/route.ts
│   │   │   ├── admin/products/route.ts
│   │   │   ├── admin/products/[id]/route.ts
│   │   │   ├── admin/orders/route.ts
│   │   │   ├── admin/orders/[id]/route.ts
│   │   │   ├── admin/promo-codes/route.ts
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   └── health/route.ts
│   │   ├── layout.tsx         # Root Layout
│   │   ├── globals.css        # Tailwind + Theme
│   │   ├── sitemap.ts         # Dynamische Sitemap
│   │   └── robots.ts          # Dynamische robots.txt
│   ├── components/
│   │   ├── ui/                # shadcn/ui (Button, Card, …)
│   │   ├── luxury/            # Custom Luxus-Komponenten
│   │   ├── storefront/        # Header, Footer, ProductCard, CartDrawer
│   │   └── admin/             # AdminTable, AdminForm, …
│   ├── lib/
│   │   ├── db.ts              # Prisma Client (Singleton)
│   │   ├── auth.ts            # Session-Handling, Argon2
│   │   ├── cart.ts            # Cart-Logik, Cookie-Handling
│   │   ├── stripe.ts          # Stripe SDK Wrapper
│   │   ├── email.ts           # Resend Client
│   │   ├── tax.ts             # EU-OSS Steuerlogik
│   │   ├── promo.ts           # Promo-Code-Validierung
│   │   ├── search.ts          # Meilisearch Client
│   │   ├── pdf.ts             # PDF-Generierung (Authenticity Cert)
│   │   ├── format.ts          # Currency/Date Helpers
│   │   ├── rate-limit.ts      # In-Memory Rate-Limiter
│   │   ├── csrf.ts            # CSRF-Token-Validation
│   │   ├── validators/        # Zod-Schemas
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   ├── checkout.ts
│   │   │   └── product.ts
│   │   └── types.ts           # Shared TypeScript Types
│   ├── store/                 # Zustand Stores
│   │   ├── ui-store.ts
│   │   ├── cart-store.ts
│   │   └── auth-store.ts
│   ├── hooks/                 # Custom React Hooks
│   │   ├── use-cart.ts
│   │   ├── use-customer.ts
│   │   └── use-favorites.ts
│   ├── middleware.ts          # Auth + Security Headers
│   └── emails/                # React Email Templates
│       ├── order-confirmation.tsx
│       ├── shipping-update.tsx
│       ├── password-reset.tsx
│       └── welcome.tsx
├── tests/
│   ├── unit/                  # Vitest Unit-Tests
│   ├── integration/           # API-Route Tests
│   └── e2e/                   # Playwright Scenarios
└── docs/
    ├── ARCHITECTURE.md
    ├── SECURITY.md
    ├── DEPLOYMENT.md
    └── LEGAL.md
```

### 0.6 Coding-Conventions

#### 0.6.1 TypeScript
- **Strict Mode** aktiviert (`strict: true`, `noUncheckedIndexedAccess: true`)
- **Kein `any`** — wenn nötig, mit Begründung kommentieren
- **`type` für Typen, `interface` für Objekte** die erweitert werden
- **Branded Types** für IDs: `type CustomerId = string & { __brand: "Customer" }`
- **Zod-Schema = Source of Truth** für API-Payloads, daraus TypeScript-Typen inferieren

#### 0.6.2 React / Next.js
- **Server Components by default**, `'use client'` nur wenn nötig (State, Events, Browser-APIs)
- **`'use server'`** für Server Actions
- **Kein `dangerouslySetInnerHTML`** — niemals
- **`<Image>` aus `next/image`** statt `<img>` — immer
- **`next/link`** für interne Navigation — immer
- **`next/font`** für Fonts (kein CSS @import von Google Fonts)

#### 0.6.3 Styling
- **Tailwind-Klassen direkt** im JSX (kein `styled-components`)
- **`cn()` Utility** für konditionale Klassen (clsx + tailwind-merge)
- **CSS-Variablen** für Theme-Farben in `globals.css`
- **Mobile-First** Responsive Design (`sm:`, `md:`, `lg:`)
- **Min. 44px Touch-Targets** für interaktive Elemente

#### 0.6.4 API-Routen
- **RESTful Konventionen**: GET (read), POST (create), PATCH (update), DELETE (remove)
- **Zod-Validierung** auf JEDER Route vor der Business-Logik
- **Try-Catch** mit strukturierter Fehlerbehandlung
- **HTTP-Status-Codes** korrekt verwenden (200, 201, 400, 401, 403, 404, 409, 422, 429, 500)
- **Keine sensiblen Daten** in Response-Body (logs included)

#### 0.6.5 Datenbank
- **Prisma Migrations** für jede Schema-Änderung (`prisma migrate dev`)
- **Kein direktes SQL** außerhalb von Prisma (Ausnahme: Performance-kritische Raw-Queries mit Kommentarerklärung)
- **Transaktionen** für Multi-Write-Operationen (Cart-Checkout, Inventory-Update)
- **Indexes** auf allen Foreign Keys und häufig gefilterten Spalten
- **Soft-Deletes** nur wo explizit gewünscht (sonst physisches Löschen)

#### 0.6.6 Git-Workflow
- **`main`**: Production-Branch, geschützt, nur via PR merges
- **`develop`**: Integration-Branch für Features
- **`feature/TASK-XX-kurzname`**: Feature-Branches (z.B. `feature/TASK-04-auth-system`)
- **`fix/TASK-XX-kurzname`**: Bugfix-Branches
- **Conventional Commits**: `feat(auth): add login route`, `fix(cart): handle merge edge case`, `chore(deps): bump next to 16.1`
- **PR-Template** mit Checklist (Tests, Docs, Security-Check)
- **Squash-Merge** für saubere History

### 0.7 Definition of Done (DoD)

Eine Task gilt als "Done", wenn ALLE folgenden Punkte erfüllt sind:

- [ ] Funktionalität implementiert gemäß Akzeptanzkriterien
- [ ] Unit-Tests geschrieben (Coverage >80% für neue Logik)
- [ ] Integration-Tests für API-Routen (wo anwendbar)
- [ ] TypeScript strict, kein `any`, keine `@ts-ignore`
- [ ] ESLint + Prettier clean (`bun run lint` exits 0)
- [ ] Responsive Design getestet (320px, 768px, 1280px, 1920px)
- [ ] Accessibility-Check (axe devtools, Keyboard-Navigation)
- [ ] Security-Review durchgeführt (Input-Validierung, Auth-Check)
- [ ] Keine Secrets im Code, `.env.example` aktualisiert
- [ ] Dokumentation (JSDoc für Public Functions, README-Updates)
- [ ] PR erstellt, Review eingeholt, mindestens 1 Approval
- [ ] In `develop` gemerged, CI/CD grün
- [ ] Manueller Smoke-Test auf Preview-URL erfolgreich

---

## PHASE 1: FUNDAMENT & MVP (18 Personentage)

**Ziel:** Vollständig funktionsfähiger Shop mit Katalog, Warenkorb, Mock-Checkout und Admin-Console. Lokal lauffähig, bereit für Stripe-Integration in Phase 2.

---

### TASK 01: Projekt-Initialisierung & Tooling
**Phase:** 1 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** keine

#### Ziel
Sauber initialisiertes Next.js 16 Projekt mit allen Dependencies, Linting, Formatierung und Git-Hooks.

#### Subtasks

**1.1 Next.js Projekt erstellen**
```bash
npx create-next-app@latest sona-boutique \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-bun
```

**1.2 Dependencies installieren**
```bash
# Core
bun add @prisma/client zod @tanstack/react-query @tanstack/react-query-devtools
bun add zustand argon2 crypto clsx tailwind-merge class-variance-authority
bun add lucide-react framer-motion next-themes

# Dev
bun add -D prisma @types/node @types/react @types/react-dom
bun add -D eslint @eslint/js eslint-config-next eslint-plugin-react-hooks
bun add -D prettier prettier-plugin-tailwindcss
bun add -D husky lint-staged
bun add -D vitest @testing-library/react @testing-library/jest-dom
bun add -D @playwright/test
bun add -D @types/argon2
```

**1.3 shadcn/ui initialisieren**
```bash
npx shadcn@latest init -d
# Style: New York
# Base color: Stone
# CSS variables: yes
```

**1.4 shadcn/ui Komponenten hinzufügen**
```bash
npx shadcn@latest add button card input label textarea select
npx shadcn@latest add dialog sheet dropdown-menu popover tooltip
npx shadcn@latest add table badge avatar separator
npx shadcn@latest add form toast sonner command
npx shadcn@latest add tabs accordion alert-dialog
npx shadcn@latest add breadcrumb pagination scroll-area
```

**1.5 ESLint-Konfiguration erweitern**
```javascript
// eslint.config.mjs
import next from "eslint-config-next";
export default [
  ...next,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
];
```

**1.6 Prettier-Konfiguration**
```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**1.7 Git-Hooks (Husky)**
```bash
bunx husky init
echo "bunx lint-staged" > .husky/pre-commit
```

```json
// package.json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,css}": ["prettier --write"]
}
```

**1.8 TypeScript Strict erweitern**
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": false
  }
}
```

**1.9 `.env.example` erstellen**
```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
AUTH_SECRET="<generierter-64-char-string>"
SESSION_COOKIE_NAME="sona_session"
SESSION_TTL_DAYS=30

# Stripe (Phase 2)
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
STRIPE_PUBLIC_KEY=""

# Resend (Phase 2)
RESEND_API_KEY=""
EMAIL_FROM="SONA Boutique <noreply@sona-boutique.de>"

# Cloudinary (Phase 3)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Sentry (Phase 3)
SENTRY_DSN=""

# PostHog (Phase 3)
NEXT_PUBLIC_POSTHOG_KEY=""
NEXT_PUBLIC_POSTHOG_HOST=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

**1.10 `.gitignore` erweitern**
```
# Env
.env
.env.local
.env.*.local

# DB
prisma/dev.db
prisma/*.db-journal

# Builds
.next/
out/
dist/

# Editor
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
dev.log
server.log
```

**1.11 README.md initialisieren**
Mit Sektionen: Setup, Dev-Start, DB-Migration, Seed, Tests, Deployment.

#### Akzeptanzkriterien
- [ ] `bun dev` startet ohne Fehler auf `localhost:3000`
- [ ] `bun run lint` exits mit Code 0
- [ ] `bun run typecheck` (tsc --noEmit) exits mit Code 0
- [ ] shadcn/ui Button wird korrekt gerendert auf `/`
- [ ] Git-Repo initialisiert, erster Commit "chore: project initialization"
- [ ] `.env.example` ist committed, `.env.local` ist gitignored
- [ ] Husky pre-commit hook läuft (prüft Linting)

#### Dateien erstellt
- `package.json`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`
- `tailwind.config.ts`, `postcss.config.mjs`
- `next.config.ts`, `components.json`
- `.env.example`, `.gitignore`, `README.md`
- `.husky/pre-commit`

---

### TASK 02: Prisma Schema & Datenbank
**Phase:** 1 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 01

#### Ziel
Vollständiges, typsicheres Prisma-Schema mit allen 22 Models, das alle fachlichen Anforderungen des Luxus-Resellings (inkl. Konsignations-/Ankaufsgeschäft) abbildet.

#### Subtasks

**2.1 Prisma initialisieren**
```bash
bunx prisma init --datasource-provider sqlite
```

**2.2 Vollständiges Schema in `prisma/schema.prisma` schreiben**

Siehe separater Code-Block unten — der vollständige Schema-Code wird hier als verbindliche Vorgabe definiert:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// === ENUMS ===

enum Role {
  CUSTOMER
  ADMIN
}

enum ProductStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum Condition {
  PRISTINE    // Neuwertig, keine Gebrauchsspuren
  EXCELLENT   // Minimalste Gebrauchsspuren
  VERY_GOOD   // Leichte, sichtbare Gebrauchsspuren
  GOOD        // Deutliche Gebrauchsspuren
}

enum Hardware {
  GOLD
  SILVER
  PALLADIUM
  RUTHENIUM
  ROSE_GOLD
}

enum PromoType {
  PERCENTAGE
  FIXED
}

enum CartStatus {
  ACTIVE
  MERGED
  ABANDONED
  COMPLETED
}

enum FulfillmentStatus {
  PENDING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  REFUNDED
  PARTIALLY_REFUNDED
  FAILED
}

enum PaymentProvider {
  MOCK
  STRIPE
}

enum ProductSourceType {
  OWNED         // Eigenankauf – SONA Boutique ist wirtschaftlicher Eigentümer
  CONSIGNMENT   // Kommissionsware – Eigentümer ist der Consignor bis zum Verkauf
}

enum ConsignmentRequestStatus {
  SUBMITTED      // Formular abgeschickt
  UNDER_REVIEW   // Fotos/Angaben werden geprüft
  OFFER_MADE     // Ankaufs- oder Kommissionsangebot unterbreitet
  ACCEPTED       // Kunde hat Angebot angenommen
  REJECTED       // Abgelehnt
  ITEM_RECEIVED  // Tasche physisch eingegangen & geprüft
  LISTED         // Als Produkt online gestellt
  SOLD           // Verkauft, Payout fällig/erfolgt
  RETURNED       // Nicht angenommen, an Kunden zurückgesendet
  CANCELLED      // Vom Kunden zurückgezogen
}

// === AUTH & CUSTOMER ===

model Customer {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  role            Role      @default(CUSTOMER)
  isVerified      Boolean   @default(false)
  lastLoginAt     DateTime?
  // Stripe (Phase 2)
  stripeCustomerId String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sessions        Session[]
  addresses       Address[]
  reviews         Review[]
  favorites       Favorite[]
  carts           Cart[]
  orders          Order[]
  consignorProfile Consignor?

  @@index([email])
  @@index([role])
}

model Session {
  id           String   @id @default(uuid())
  token        String   @unique
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([customerId])
  @@index([token])
}

model PasswordResetToken {
  id           String   @id @default(uuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique
  expiresAt    DateTime
  usedAt       DateTime?
  createdAt    DateTime @default(now())

  @@index([customerId])
}

model Address {
  id           String   @id @default(uuid())
  customerId   String
  customer     Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  firstName    String
  lastName     String
  company      String?
  street1      String
  street2      String?
  city         String
  postalCode   String
  country      String   @default("DE")
  phone        String?
  isDefault    Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([customerId])
}

// === CATALOG ===

model Brand {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  description String?
  country     String?   // Origin country: "FR", "IT", "DE"
  logoUrl     String?
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]

  @@index([slug])
}

model Category {
  id            String      @id @default(uuid())
  name          String      @unique
  slug          String      @unique
  description   String?
  parentId      String?
  parent        Category?   @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  subCategories Category[]  @relation("CategoryHierarchy")
  sortOrder     Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  products      Product[]

  @@index([slug])
  @@index([parentId])
}

model Collection {
  id          String              @id @default(uuid())
  name        String              @unique
  slug        String              @unique
  description String?
  imageUrl    String?
  isActive    Boolean             @default(true)
  sortOrder   Int                 @default(0)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  products    ProductCollection[]

  @@index([slug])
  @@index([isActive])
}

model ProductCollection {
  productId    String
  product      Product    @relation(fields: [productId], references: [id], onDelete: Cascade)
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([productId, collectionId])
  @@index([collectionId])
}

model Product {
  id                      String              @id @default(uuid())
  slug                    String              @unique
  title                   String
  subtitle                String?
  description             String
  status                  ProductStatus       @default(DRAFT)

  // Relations
  brandId                 String
  brand                   Brand               @relation(fields: [brandId], references: [id])
  categoryId              String?
  category                Category?           @relation(fields: [categoryId], references: [id])
  collections             ProductCollection[]

  // Luxury Attributes
  material                String?
  color                   String?
  hardware                Hardware?
  originCountry           String?
  manufacturingYear       Int?
  condition               Condition           @default(VERY_GOOD)
  conditionNotes          String?
  isAuthenticityVerified  Boolean             @default(false)
  authenticityCertNo      String?

  // Inclusions
  includesOriginalBox     Boolean             @default(false)
  includesDustBag         Boolean             @default(false)
  includesReceipt         Boolean             @default(false)
  includesAuthenticityCard Boolean            @default(false)

  // Pricing (Cents)
  retailPriceCents        Int?
  resalePriceCents        Int
  compareAtPriceCents     Int?
  currencyCode            String              @default("EUR")

  // Inventory & Logistics
  sku                     String              @unique
  barcode                 String?
  inventoryQuantity       Int                 @default(1)
  weightGrams             Int?
  dimensions              String?
  tags                    String?
  isFeatured              Boolean             @default(false)
  featuredRank            Int                 @default(0)

  // Multi-Channel-Inventory-Locking (Task 20)
  lockedUntil             DateTime?
  lockedBy                String?             // Cart-ID or Session-ID

  publishedAt             DateTime?
  createdAt               DateTime            @default(now())
  updatedAt               DateTime            @updatedAt

  // Herkunft (Eigenankauf vs. Kommission) — siehe TASK 20B
  sourceType              ProductSourceType   @default(OWNED)
  consignorId             String?
  consignor               Consignor?          @relation(fields: [consignorId], references: [id])
  consignmentCommissionRate Float?
  consignorPayoutCents    Int?

  variants                ProductVariant[]
  images                  ProductImage[]
  reviews                 Review[]
  cartItems               CartItem[]
  orderItems              OrderItem[]
  favorites               Favorite[]
  consignmentRequest      ConsignmentRequest?

  @@index([brandId])
  @@index([categoryId])
  @@index([status])
  @@index([isFeatured])
  @@index([condition])
  @@index([lockedUntil])
  @@index([consignorId])
}

model ProductVariant {
  id                String      @id @default(uuid())
  productId         String
  product           Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  sku               String      @unique
  title             String
  priceCents        Int
  inventoryQty      Int         @default(1)
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  cartItems         CartItem[]
  orderItems        OrderItem[]

  @@index([productId])
}

model ProductImage {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  altText   String?
  position  Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([productId])
  @@index([position])
}

model Review {
  id          String   @id @default(uuid())
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  authorName  String
  rating      Int      // 1-5
  title       String?
  body        String
  isVerified  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([productId])
  @@index([customerId])
}

// === CART ===

model Cart {
  id            String     @id @default(uuid())
  customerId    String?
  customer      Customer?  @relation(fields: [customerId], references: [id], onDelete: Cascade)
  status        CartStatus @default(ACTIVE)
  currencyCode  String     @default("EUR")
  subtotalCents Int        @default(0)
  shippingCents Int        @default(0)
  taxCents      Int        @default(0)
  discountCents Int        @default(0)
  totalCents    Int        @default(0)
  promoCode     String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  items         CartItem[]

  @@index([customerId])
  @@index([status])
}

model CartItem {
  id                String          @id @default(uuid())
  cartId            String
  cart              Cart            @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId         String
  product           Product         @relation(fields: [productId], references: [id])
  productVariantId  String?
  productVariant    ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: Cascade)
  quantity          Int             @default(1)
  unitPriceCents    Int
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([cartId])
  @@index([productId])
}

// === ORDER ===

model Order {
  id                  String            @id @default(uuid())
  number              String            @unique
  customerId          String?
  customer            Customer?         @relation(fields: [customerId], references: [id], onDelete: SetNull)
  email               String
  firstName           String
  lastName            String
  phone               String?

  // Shipping Address (Snapshot)
  shippingFirstName   String
  shippingLastName    String
  shippingStreet1     String
  shippingStreet2     String?
  shippingCity        String
  shippingPostalCode  String
  shippingCountry     String
  shippingPhone       String?

  // Billing Address (Snapshot)
  billingFirstName    String
  billingLastName     String
  billingStreet1      String
  billingStreet2      String?
  billingCity         String
  billingPostalCode   String
  billingCountry      String

  // Financials (Snapshot)
  subtotalCents       Int
  shippingCents       Int
  taxCents            Int
  taxRate             Float             @default(0.19)  // For audit
  discountCents       Int               @default(0)
  totalCents          Int
  partialRefundCents Int               @default(0)
  currencyCode        String            @default("EUR")
  promoCode           String?

  // Status
  fulfillmentStatus   FulfillmentStatus @default(PENDING)
  paymentStatus       PaymentStatus     @default(PENDING)

  // Lifecycle
  placedAt            DateTime          @default(now())
  paidAt              DateTime?
  shippedAt           DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  refundReason        String?

  items               OrderItem[]
  payments            Payment[]
  shipments           Shipment[]

  @@index([customerId])
  @@index([fulfillmentStatus])
  @@index([paymentStatus])
  @@index([number])
}

model OrderItem {
  id                String          @id @default(uuid())
  orderId           String
  order             Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId         String?
  product           Product?        @relation(fields: [productId], references: [id], onDelete: SetNull)
  productVariantId  String?
  productVariant    ProductVariant? @relation(fields: [productVariantId], references: [id], onDelete: SetNull)

  // Snapshots
  title             String
  brandName         String
  sku               String
  quantity          Int
  unitPriceCents    Int
  totalCents        Int
  authenticityCertNo String?

  createdAt         DateTime        @default(now())

  @@index([orderId])
}

model Payment {
  id            String          @id @default(uuid())
  orderId       String
  order         Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  provider      PaymentProvider
  providerRef   String          // Stripe PaymentIntent ID / Charge ID
  amountCents   Int
  currencyCode  String          @default("EUR")
  status        PaymentStatus   @default(PENDING)
  failureReason String?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@index([orderId])
  @@index([providerRef])
}

model Shipment {
  id          String    @id @default(uuid())
  orderId     String
  order       Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  carrier     String    // "DHL Express", "UPS", "FedEx"
  trackingNo  String?
  shippedAt   DateTime  @default(now())
  deliveredAt DateTime?
  notes       String?

  @@index([orderId])
}

// === PROMO CODES ===

model PromoCode {
  id             String    @id @default(uuid())
  code           String    @unique
  description    String?
  type           PromoType @default(PERCENTAGE)
  value          Int       // Percentage (1-100) or fixed amount in cents
  minOrderCents  Int       @default(0)
  usageLimit     Int?
  usageCount     Int       @default(0)
  perCustomerLimit Int?
  startsAt       DateTime?
  endsAt         DateTime?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([code])
  @@index([isActive])
}

// === CUSTOMER FAVORITES (Watchlist) ===

model Favorite {
  id          String   @id @default(uuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  productId   String
  product     Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())

  @@unique([customerId, productId])
  @@index([customerId])
}

// === CONSIGNMENT / ANKAUF ("Verkaufen") — siehe TASK 20B ===

model Consignor {
  id                String    @id @default(uuid())
  customerId        String?   @unique
  customer          Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
  firstName         String
  lastName          String
  email             String
  phone             String?
  ibanEncrypted     String?     // AES-256 verschlüsselt, niemals im Klartext
  bankAccountHolder String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  requests          ConsignmentRequest[]
  products          Product[]

  @@index([email])
}

model ConsignmentRequest {
  id                  String                    @id @default(uuid())
  consignorId         String
  consignor           Consignor                 @relation(fields: [consignorId], references: [id], onDelete: Cascade)
  status              ConsignmentRequestStatus  @default(SUBMITTED)

  brandName           String
  modelName            String
  estimatedCondition  Condition
  description         String
  photos              String                    // JSON-Array von Bild-URLs (Kunden-Erstupload)

  desiredType         String?                   // "SALE" (Eigenankauf) oder "CONSIGNMENT"
  offeredPriceCents   Int?                       // Angebotener Ankaufspreis (bei OWNED)
  commissionRate      Float?                     // Kommissionssatz (bei CONSIGNMENT), z.B. 0.30
  finalPayoutCents    Int?                       // Tatsächliche Auszahlung nach Verkauf

  adminNotes          String?
  productId           String?   @unique          // Verknüpfung zum späteren Produkt
  product             Product?  @relation(fields: [productId], references: [id], onDelete: SetNull)

  submittedAt         DateTime                  @default(now())
  reviewedAt          DateTime?
  offerMadeAt         DateTime?
  decidedAt           DateTime?
  receivedAt          DateTime?
  soldAt              DateTime?

  @@index([consignorId])
  @@index([status])
}
```

**2.3 Datenbank erstellen & Schema pushen**
```bash
bunx prisma migrate dev --name init
bunx prisma generate
```

**2.4 Prisma Client Singleton in `src/lib/db.ts`**
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

**2.5 TypeScript Types für Frontend in `src/lib/types.ts`**
- Für jedes Prisma-Model einen TypeScript-Type anlegen (mit Relations)
- Type-Inference via `Prisma.ProductGetPayload<{ include: { brand: true; images: true } }>`

#### Akzeptanzkriterien
- [ ] `bunx prisma migrate dev --name init` läuft fehlerfrei durch
- [ ] `bunx prisma generate` erfolgreich
- [ ] `src/lib/db.ts` existiert, exportiert `db` als Singleton
- [ ] `bunx prisma studio` öffnet Studio mit allen Tabellen
- [ ] Alle 22 Models in Studio sichtbar
- [ ] `src/lib/types.ts` enthält alle Types

#### Dateien erstellt
- `prisma/schema.prisma`, `prisma/migrations/`, `src/lib/db.ts`, `src/lib/types.ts`

---

### TASK 03: Seed-Daten
**Phase:** 1 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 02

#### Ziel
Realistische Demo-Daten für Entwicklung, Testing und UI-Reviews: 8 Luxusbrands, 6 Kategorien, 3 Kollektionen, 10 Produkte mit Bildern, Reviews, 2 Promo-Codes, 1 Admin-User, 1 Demo-Kunde.

#### Subtasks

**3.1 Seed-Script `prisma/seed.ts` erstellen**

**3.2 Brands (8 Stück)**
- Hermès (FR, 1837)
- Chanel (FR, 1910)
- Louis Vuitton (FR, 1854)
- Bottega Veneta (IT, 1966)
- Saint Laurent (FR, 1961)
- Prada (IT, 1913)
- Dior (FR, 1946)
- Goyard (FR, 1853)
- Gucci (IT, 1921)
- MCM (DE, 1976)

**3.3 Kategorien (6 Stück)**
- Tote Bags, Shoulder Bags, Crossbody Bags, Top Handle, Mini & Micro, Clutches

**3.4 Kollektionen (3 Stück)**
- Investment Pieces
- New Arrivals
- Quiet Luxury

**3.5 Produkte (mindestens 10)**
Pro Produkt:
- Titel, Untertitel, Beschreibung (detailliert, 200+ Wörter)
- Brand, Kategorie, Kollektion
- Material, Color, Hardware, Origin, ManufacturingYear
- Condition, ConditionNotes (50+ Wörter)
- isAuthenticityVerified: true, authenticityCertNo (Format `LX-2026-XXXX`)
- Inclusions (Box, DustBag, Receipt, AuthCard)
- retailPriceCents, resalePriceCents, compareAtPriceCents (in Cents!)
- sku, inventoryQuantity (meist 1), weightGrams, dimensions
- isFeatured, featuredRank
- 3–5 Bild-URLs (Unsplash für Demo, später Cloudinary)
- 1–2 Reviews

Beispiel-Produkte:
1. Hermès Birkin 30 Togo Gold — 22.500 €
2. Chanel Classic Flap Medium Black — 8.900 €
3. Louis Vuitton Speedy 25 Monogram — 980 €
4. Bottega Veneta Mini Jodhpur Brown — 3.650 €
5. Saint Laurent Loulou Small Black — 2.450 €
6. Dior Saddle Blue Oblique — 3.450 €
7. Prada Re-Edition 2005 Black — 1.190 €
8. Goyard Saint Louis PM Black — 1.450 €
9. Gucci Marmont Small Black — 1.890 €
10. MCM Stark Backpack Visetos — 980 €

**3.6 Promo-Codes (2 Stück)**
- `WELCOME10`: 10% auf erste Bestellung ab 500 €
- `VIP500`: 500 € Rabatt ab 5.000 € Bestellwert

**3.7 Demo-User (2 Stück)**
- Admin: `admin@sona-boutique.de` / `admin1234`
- Kunde: `kunde@demo.de` / `demo1234`
- Passwörter mit `@node-rs/argon2` hashen ( NICHT SHA-256!)
- Kunde bekommt 1 Default-Address

**3.8 Seed in `package.json` eintragen**
```json
"scripts": {
  "db:seed": "bunx tsx prisma/seed.ts",
  "db:reset": "bunx prisma migrate reset"
}
```

**3.9 Reset & Seed testen**
```bash
bun run db:reset  # Drop + Migrate + Seed
```

#### Akzeptanzkriterien
- [ ] `bun run db:reset` läuft fehlerfrei
- [ ] Prisma Studio zeigt alle 10 Produkte mit Relations
- [ ] Login mit `admin@sona-boutique.de / admin1234` funktioniert (nach Task 04)
- [ ] Bilder-URLs sind erreichbar (HTTP 200)
- [ ] Keine Encoding-Probleme (Umlaute ä, ö, ü, ß, é)

#### Dateien erstellt
- `prisma/seed.ts`, Update `package.json`

---

### TASK 04: Authentifizierung & Session-Management
**Phase:** 1 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 02, TASK 03

#### Ziel
Sicheres Auth-System mit Argon2id-Hashing, datenbankgestützten Sessions, HTTP-only Cookies, Rollen (CUSTOMER/ADMIN), Passwort-Reset-Flow (Token ohne E-Mail in Phase 1, E-Mail in Phase 2).

#### Subtasks

**4.1 `src/lib/auth.ts` — Auth Helpers**
```typescript
import { hash, verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = "sona_session";
const SESSION_TTL_DAYS = 30;

const argon2Options = {
  memoryCost: 19456,  // 19 MB
  timeCost: 2,
  parallelism: 1,
  algorithm: 2, // Argon2id
};

export async function hashPassword(password: string): Promise<string> {
  return hash(password, argon2Options);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return verify(hash, password);
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

export async function createSession(customerId: string, ip?: string, ua?: string) {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000);
  await db.session.create({
    data: { token, customerId, expiresAt, ipAddress: ip, userAgent: ua },
  });
  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentCustomer() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { customer: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }
  return session.customer;
}

export async function requireCustomer() {
  const c = await getCurrentCustomer();
  if (!c) throw new Response("Unauthorized", { status: 401 });
  return c;
}

export async function requireAdmin() {
  const c = await getCurrentCustomer();
  if (!c || c.role !== "ADMIN") throw new Response("Forbidden", { status: 403 });
  return c;
}
```

**4.2 Zod-Validators in `src/lib/validators/auth.ts`**
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
});

export const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, "Mindestens ein Großbuchstabe")
    .regex(/[a-z]/, "Mindestens ein Kleinbuchstabe")
    .regex(/[0-9]/, "Mindestens eine Ziffer"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});
```

**4.3 API-Routen erstellen**

`src/app/api/auth/register/route.ts`:
- POST: Validiert Body mit `registerSchema`
- Prüft, ob E-Mail bereits existiert (→ 409 Conflict)
- Hasht Passwort mit Argon2id
- Erstellt Customer
- Erstellt Session, setzt Cookie
- Return: `{ customer: { id, email, firstName, lastName, role } }`
- Rate-Limited: 5 Requests / 15 Min / IP

`src/app/api/auth/login/route.ts`:
- POST: Validiert Body mit `loginSchema`
- Sucht Customer by Email (→ 401 wenn nicht gefunden)
- Verifiziert Passwort mit `verifyPassword`
- Bei Fehlschlag: 401, KEIN Hinweis welche Field falsch ist
- Erfasst IP und User-Agent für Session
- Erstellt Session, setzt Cookie
- Updated `lastLoginAt`
- Return: Customer Object

`src/app/api/auth/logout/route.ts`:
- POST: Löscht Session in DB, löscht Cookie
- Return: `{ ok: true }`

`src/app/api/auth/me/route.ts`:
- GET: Gibt aktuellen Customer oder null zurück

`src/app/api/auth/reset/request/route.ts`:
- POST: Generiert Reset-Token, speichert Hash in `PasswordResetToken` (24h gültig)
- Phase 1: Loggt Token in Console (Dev)
- Phase 2: Sendet E-Mail via Resend

`src/app/api/auth/reset/confirm/route.ts`:
- POST: Validiert Token, hasht neues Passwort, updated Customer, markiert Token als used

**4.4 Next.js Middleware `src/middleware.ts`**
- Prüft `/admin/*` Routen auf `role === "ADMIN"`
- Setzt Security-Header (CSP, HSTS, X-Frame-Options, etc. — detailliert in Task 16)
- Reading Cookie via `request.cookies.get("sona_session")` (kein DB-Zugriff in Middleware!)
- Für Admin-Check: Decode Session-Cookie und prüfe Rolle (separates JWT für Rolle ODER Redis-Lookup später — für Phase 1: redirect zu /login wenn kein Cookie)

**4.5 Rate-Limiter in `src/lib/rate-limit.ts`**
- In-Memory Map: `Map<string, { count: number, resetAt: Date }>`
- Funktion: `checkRateLimit(key: string, limit: number, windowMs: number): boolean`
- Bereinigung abgelaufener Entries bei jedem Aufruf
- Hinweis: In Produktion auf Redis umstellen (Phase 3)

**4.6 Auth-Store `src/store/auth-store.ts`**
- Zustand-Store mit `customer`, `loading`, `error`
- Methoden: `fetchMe()`, `login()`, `register()`, `logout()`
- Bei App-Start automatisch `fetchMe()` aufrufen

#### Akzeptanzkriterien
- [ ] Registrierung mit gültigen Daten → Customer in DB, Session-Cookie gesetzt
- [ ] Registrierung mit existierender E-Mail → 409
- [ ] Registrierung mit schwachem Passwort → 422 mit spezifischer Fehlermeldung
- [ ] Login mit korrekten Daten → 200, Customer zurückgegeben
- [ ] Login mit falschem Passwort → 401, generische Meldung "Ungültige Anmeldedaten"
- [ ] Logout löscht Session aus DB + Cookie
- [ ] `/api/auth/me` gibt Customer zurück wenn eingeloggt, sonst `null`
- [ ] Middleware blockiert `/admin/*` ohne Session
- [ ] Rate-Limiter: 6. Login-Versuch innerhalb 15 Min → 429
- [ ] Passwort-Reset-Token ist nach 24h ungültig
- [ ] Argon2id-Hash in DB ( erkennbar an `$argon2id$v=19$` Prefix)
- [ ] Cookie hat `HttpOnly`, `SameSite=Strict`, `Secure` (in Prod)

#### Dateien erstellt
- `src/lib/auth.ts`, `src/lib/rate-limit.ts`, `src/lib/validators/auth.ts`
- `src/store/auth-store.ts`, `src/middleware.ts`
- `src/app/api/auth/{register,login,logout,me,reset/request,reset/confirm}/route.ts`

#### Security-Hinweise
- **Keine** Fehlermeldungen wie "E-Mail nicht gefunden" — immer generisch
- **Keine** Passwörter in Logs
- **Argon2id** mit memoryCost 19 MB (Standard für moderat sichere Anwendungen)
- **Session-Tokens** mit 32 Bytes Entropie (64 Hex-Chars)
- **Cookie expires** = Session expiresAt (nicht „1 Jahr")

---

### TASK 05: Design-System & UI-Foundation
**Phase:** 1 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 01

#### Ziel
Edles, minimalistisches Light-Mode-Design-System mit Tailwind v4 CSS-Variablen, das den Luxus-Anspruch von SONA Boutique visuell transportiert. Grundlage für alle weiteren Komponenten.

#### Subtasks

**5.1 Globale CSS-Variablen in `src/app/globals.css`**

Light-Mode-Palette (definitiv):
```css
@theme {
  --color-background: #FAF9F6;        /* Alabaster / Warmweiß */
  --color-foreground: #1A1A1A;        /* Anthrazit tief */
  --color-muted: #F5F4EE;             /* Cremeton für Sekundärfolien */
  --color-muted-foreground: #6B6B6B;  /* Sekundärer Text */
  --color-card: #FFFFFF;              /* Karten */
  --color-card-foreground: #1A1A1A;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #1A1A1A;
  --color-border: #E8E5DC;            /* Dezente Creme-Trennlinie */
  --color-input: #E8E5DC;
  --color-ring: #C5A880;              /* Champagner-Gold für Focus */
  --color-primary: #1A1A1A;           /* Anthrazit für Primary Buttons */
  --color-primary-foreground: #FAF9F6;
  --color-secondary: #F5F4EE;
  --color-secondary-foreground: #1A1A1A;
  --color-accent: #C5A880;            /* Champagner-Gold */
  --color-accent-foreground: #1A1A1A;
  --color-destructive: #B91C1C;
  --color-destructive-foreground: #FAF9F6;
  --color-success: #15803D;
  --color-warning: #B45309;
  --color-info: #1D4ED8;
  
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  /* Luxus-Brands verwenden oft scharfe Kanten, kein Border-Radius */
  
  --font-serif: "Cormorant Garamond", Georgia, serif;
  --font-sans: "Inter", -apple-system, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

**5.2 Schriftarten via `next/font` in `src/app/layout.tsx` laden**
```typescript
import { Inter, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-cormorant", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
```

**5.3 Font-Alias-Setup**
```css
body { font-family: var(--font-inter), var(--font-sans); }
h1, h2, h3, h4, h5, h6, .font-serif { font-family: var(--font-cormorant), serif; }
code, .font-mono { font-family: var(--font-jetbrains), monospace; }
```

**5.4 Globale Styles in `globals.css`**
- Reset für Headings
- `body { background: var(--color-background); color: var(--color-foreground); }`
- Custom Scrollbar (dezente Creme)
- `::selection { background: var(--color-accent); color: var(--color-primary-foreground); }`
- Smooth Scroll
- Reduced Motion Respekt

**5.5 Custom Utility-Klassen in `globals.css`**
```css
@layer utilities {
  .text-balance { text-wrap: balance; }
  .container-luxury {
    @apply mx-auto max-w-7xl px-4 sm:px-6 lg:px-8;
  }
  .container-wide {
    @apply mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8;
  }
  .heading-luxury {
    @apply font-serif font-light tracking-tight text-foreground;
  }
  .label-luxury {
    @apply text-[10px] uppercase tracking-[0.2em] text-muted-foreground;
  }
  .button-luxury {
    @apply inline-flex items-center justify-center uppercase tracking-widest text-xs font-medium transition-all duration-300;
  }
  .gold-divider {
    @apply h-px bg-gradient-to-r from-transparent via-accent to-transparent;
  }
}
```

**5.6 Custom Luxus-Komponenten in `src/components/luxury/`**

`LuxuryButton.tsx`:
- Varianten: `gold` (Champagner-Füllung), `outline` (Gold-Rahmen), `dark` (Anthrazit), `ghost`
- Hover-Effekte: sanftes Scale (1.02), subtiler Shadow-Lift
- Optionaler Shimmer-Effekt für `gold`-Variante
- Sizes: `sm` (px-4 py-2), `md` (px-6 py-3), `lg` (px-8 py-4)
- Letter-spacing: `tracking-widest`
- Text-transform: uppercase
- Min. 44px Touch-Target

`GoldDivider.tsx`:
- Horizontale Linie mit Gradient (transparent → gold → transparent)
- Optional mit Diamanten-Symbol in der Mitte

`PriceTag.tsx`:
- Props: `resalePriceCents`, `compareAtPriceCents?`, `retailPriceCents?`
- Formatierung via `Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" })`
- Optionaler Durchstich für `compareAtPriceCents`
- Optionaler "Retail X €" Hinweis

`ConditionBadge.tsx`:
- Farbige Badges je nach Condition (PRISTINE = grün, EXCELLENT = blau, VERY_GOOD = gelb, GOOD = orange)

`LuxuryBadge.tsx`:
- Varianten: `default`, `gold`, `green`, `stone`
- Kleine, uppercase Badges für "Verifiziert", "Featured", etc.

`ShimmerImage.tsx`:
- Wrapper um `next/image`
- Skeleton-Shimmer während Loading
- Fade-In nach Load

**5.7 Toast-Konfiguration (Sonner)**
- Position: bottom-right
- Theme: light
- Style: minimal, mit dezentem Border

**5.8 Theme Provider**
- `next-themes` einbinden, Light-Mode als Default
- Optional Dark-Mode Toggle im Header (Phase 5)

#### Akzeptanzkriterien
- [ ] Light-Mode ist optisch edel: warmes Weiß, dezente Gold-Akzente, scharfe Kanten
- [ ] Inter + Cormorant Garamond laden ohne FOUT
- [ ] `LuxuryButton` mit Variante `gold` zeigt Champagner-Gradient mit Shimmer bei Hover
- [ ] `PriceTag` zeigt `2.250,00 €` (deutsche Formatierung)
- [ ] `ConditionBadge` zeigt grünes Badge für PRISTINE
- [ ] LCP < 2.5s auf `/` mit leerem State
- [ ] Keine Console-Errors im Browser
- [ ] axe DevTools: 0 kritische Accessibility-Issues

#### Dateien erstellt
- `src/app/globals.css`, `src/app/layout.tsx`
- `src/components/luxury/{LuxuryButton,GoldDivider,PriceTag,ConditionBadge,LuxuryBadge,ShimmerImage}.tsx`

---

### TASK 05B: Premium Motion- & Scroll-Animation-System
**Phase:** 1 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 05

#### Ziel
Ein verbindliches, wiederverwendbares Motion-System, das SONA Boutique von austauschbaren Shop-Templates abhebt: butterweiche Scroll-Reveals, Parallax-Akzente, Cursor-/Hover-Mikrointeraktionen und Page-Transitions — durchgehend **dezent, langsam, edel** (keine "verspielten" Bounce-Effekte). Dieses System ist die verbindliche Grundlage für TASK 06 (App-Shell), TASK 07 (Catalog/Home) und TASK 08 (Product-Detail).

#### Design-Prinzipien (verbindlich für alle Agenten)
- **"Slow luxury motion"**: Easing immer `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) oder `cubic-bezier(0.65, 0, 0.35, 1)` — niemals Standard-`ease`/`linear`
- **Timing:** Micro-Interactions 200–400ms, Section-Reveals 600–900ms, Page-Transitions 400–600ms
- **Weniger ist mehr:** Max. 1–2 Effekte gleichzeitig sichtbar, nie mehrere Elemente gleichzeitig "wild" bewegen
- **`prefers-reduced-motion: reduce`** MUSS respektiert werden — alle Animationen dann deaktiviert oder auf reines Fade reduziert
- **60fps-Pflicht:** Nur `transform` und `opacity` animieren (GPU-beschleunigt), niemals `top/left/width/height` in Animationen
- **Kein Layout-Shift** durch Animationen (CLS bleibt <0.1)

#### Subtasks

**5B.1 Dependencies**
```bash
bun add framer-motion lenis
```
(`lenis` für butterweiches Smooth-Scrolling — bewusst gewählt statt schwerem GSAP, da Bundle-Size-schonender und Next.js-App-Router-kompatibel)

**5B.2 Smooth-Scroll-Provider `src/components/motion/SmoothScrollProvider.tsx`**
- Wrapped die gesamte App (`'use client'`)
- Lenis-Instanz mit `duration: 1.1`, `easing: (t) => 1 - Math.pow(1 - t, 3)`
- Deaktiviert automatisch bei `prefers-reduced-motion: reduce`
- Synct mit Framer-Motion-`useScroll()` für konsistente Scroll-Werte

**5B.3 Scroll-Reveal-Komponente `src/components/motion/RevealOnScroll.tsx`**
- Wrapper-Komponente: Kinder faden mit leichtem Y-Offset (24px → 0) beim Eintritt in den Viewport ein
- Nutzt `framer-motion` `whileInView` + `viewport={{ once: true, margin: "-10%" }}`
- Props: `delay?`, `direction?: "up" | "left" | "right"`, `stagger?: number` (für Kind-Listen)
- Verwendung: Section-Headings, Product-Grids (staggered), Trust-Badges, Footer-Spalten

**5B.4 Parallax-Komponente `src/components/motion/ParallaxLayer.tsx`**
- Nutzt `useScroll` + `useTransform` von Framer Motion
- Für Hero-Background-Image: dezenter Parallax (Bild bewegt sich max. 15% langsamer als Scroll)
- Für Editorial-Sections (Authenticity-Section, Collection-Cards): leichte Y-Verschiebung von Bildelementen
- **Kein** Parallax auf Text (Lesbarkeit!)

**5B.5 Magnetic-Button-Effekt `src/components/motion/MagneticButton.tsx`**
- Optionaler Wrapper um `LuxuryButton` für Hero-CTAs
- Button folgt dezent dem Mauszeiger innerhalb eines kleinen Radius (max. 8px Versatz)
- Nur Desktop (deaktiviert auf Touch-Geräten via `useMediaQuery`)

**5B.6 Cursor-Follower (optional, edel statt spielerisch) `src/components/motion/CustomCursor.tsx`**
- Dezenter, kleiner Gold-Ring-Cursor, der bei Hover über interaktive Elemente (ProductCard, Buttons) sanft skaliert (1 → 1.5) und Label einblendet ("Ansehen", "Hinzufügen")
- Nur Desktop, deaktivierbar über Feature-Flag (für spätere A/B-Tests, siehe TASK 34)

**5B.7 Page-Transition-Wrapper `src/components/motion/PageTransition.tsx`**
- In `src/app/layout.tsx` bzw. Template-Level integriert (`AnimatePresence` mit `mode="wait"`)
- Beim Routenwechsel: sanftes Fade + leichtes Scale (0.98 → 1)
- Dauer: 400ms, kein weißer Flash zwischen Seiten

**5B.8 Ken-Burns-Effekt für Hero- & Editorial-Bilder `src/components/motion/KenBurnsImage.tsx`**
- Wrapper um `ShimmerImage`: sehr langsames, dezentes Zoom (scale 1 → 1.08 über 20s, `ease-linear`, loop oder einmalig beim Laden)
- Einsatz: Hero-Section, Collection-Cards (im Ruhezustand, verstärkt sich leicht bei Hover)

**5B.9 Scroll-Progress-Indikator (Product-Detail, optional)**
- Dünne Gold-Linie oben im Viewport, die den Scroll-Fortschritt der Seite anzeigt (`useScroll` → `scaleX`)
- Sehr dezent, 2px Höhe, nur auf Product-Detail- und Editorial-Seiten

**5B.10 Motion-Utility-Hook `src/hooks/use-scroll-direction.ts`**
- Erkennt Scroll-Richtung (up/down) — Basis für Header-Hide-on-Scroll-Down / Show-on-Scroll-Up (TASK 06)

**5B.11 Zentrale Motion-Presets `src/lib/motion-presets.ts`**
```typescript
export const EASE_LUXURY = [0.16, 1, 0.3, 1] as const;

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10%" },
  transition: { duration: 0.8, ease: EASE_LUXURY },
};

export const staggerContainer = (stagger = 0.08) => ({
  whileInView: "visible",
  viewport: { once: true, margin: "-10%" },
  variants: {
    visible: { transition: { staggerChildren: stagger } },
  },
});

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true },
  transition: { duration: 0.7, ease: EASE_LUXURY },
};
```
Alle Storefront-Komponenten importieren ausschließlich diese Presets — **keine** Ad-hoc-Animationswerte in einzelnen Komponenten, um visuelle Konsistenz zu garantieren.

#### Akzeptanzkriterien
- [ ] Lenis-Smooth-Scroll aktiv, fühlt sich "schwer/edel" an (keine ruckartige Standard-Scroll-Physik)
- [ ] `prefers-reduced-motion: reduce` deaktiviert alle nicht-essenziellen Animationen komplett
- [ ] Alle Scroll-Reveals nutzen `RevealOnScroll` bzw. die zentralen Presets aus `motion-presets.ts`
- [ ] Keine Layout-Shifts durch Animationen (Lighthouse CLS <0.1 bleibt erhalten)
- [ ] Parallax-Effekte laufen mit 60fps (Chrome DevTools Performance-Tab geprüft)
- [ ] Page-Transitions zeigen keinen weißen Flash / FOUC
- [ ] Magnetic-Button und Custom-Cursor sind auf Touch-Geräten deaktiviert
- [ ] Ken-Burns-Effekt läuft nur im Hero und auf Collection-Cards, nicht auf Produktbildern im Katalog (Performance!)

#### Dateien erstellt
- `src/components/motion/{SmoothScrollProvider,RevealOnScroll,ParallaxLayer,MagneticButton,CustomCursor,PageTransition,KenBurnsImage}.tsx`
- `src/hooks/use-scroll-direction.ts`
- `src/lib/motion-presets.ts`

---

### TASK 06: App-Shell (Header, Footer, Layout)
**Phase:** 1 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 05, TASK 05B

#### Ziel
Minimalistische, edle App-Shell mit Sticky-Header (Logo, Navigation, Cart-Icon mit Live-Zähler, Account-Icon), dezenter Top-Notice-Bar und Footer mit Markenrecht-Disclaimer und rechtlichen Links.

#### Subtasks

**6.1 Root Layout `src/app/layout.tsx`**
- HTML-Tag mit `lang="de"`
- Body mit Theme-Background
- TanStack Query Provider
- Toaster (Sonner) einbinden
- Header + Footer + `<main>{children}</main>` strukturieren

**6.2 Top-Notice-Bar (oberhalb des Headers)**
- Schmaler, dezent animierter Banner
- Text rotierend (alle 5 Sekunden): 
  - "Authentifiziert durch zertifizierte Gutachter"
  - "Versicherter DHL Express Versand inklusive"
  - "14 Tage Rückgaberecht"
- Background: Champagner-Gold (subtil), Text: Anthrazit
- Text-größe: 10px, uppercase, tracking-widest

**6.3 Header `src/components/storefront/Header.tsx`**
- Sticky oben, Hintergrund: warmes Weiß mit dezenter Border-Bottom beim Scrollen
- Height: 80px desktop / 64px mobile
- Inhalt:
  - Links: Mobile-Menu-Button + Desktop-Navigation
  - Mitte: SONA Boutique Logo (Serif, letter-spaced)
  - Rechts: Search-Icon (öffnet Search-Modal), Account-Icon, Cart-Icon mit Live-Badge
- Navigation (Desktop): Alle Taschen, Investment, New Arrivals, Quiet Luxury, Brands (Dropdown)
- Mobile-Menu: Slide-in von links mit allen Navigationspunkten
- Cart-Badge: Gold-Punkt mit Anzahl, nur sichtbar wenn > 0

**6.4 Cart-Drawer `src/components/storefront/CartDrawer.tsx`**
- Slide-in von rechts (Vollbild auf Mobile, max-w-md auf Desktop)
- Backdrop: halbtransparentes Anthrazit
- Inhalt: Liste der Cart-Items (Bild, Title, Price, Quantity-Stepper, Remove-Button)
- Footer: Subtotal + "Zur Kasse" Button
- Animationen: Framer Motion (slide + fade)
- Close: X-Button, ESC-Key, Backdrop-Click

**6.5 Footer `src/components/storefront/Footer.tsx`**
- 4-Spalten-Layout auf Desktop
- Spalte 1: Logo + Kurzbeschreibung
- Spalte 2: Shop (Alle Taschen, Investment, New Arrivals, Quiet Luxury)
- Spalte 3: Service (Authentifizierung, Versand, Versicherung, Kontakt)
- Spalte 4: Rechtliches (Impressum, Datenschutz, AGB, Widerruf)
- Bottom-Bar: Copyright + "SSL-verschlüsselt" + "DHL Express"
- **WICHTIG:** Markenrechtlicher Disclaimer in eigener Zeile: *"SONA Boutique ist ein unabhängiger Reseller von gebrauchten Luxusartikeln. Es besteht keine Kooperation mit den genannten Marken."*

**6.6 Search-Modal (Phase 1: simpel, Phase 3: Meilisearch)**
- Modal öffnet bei Klick auf Search-Icon oder Cmd+K
- Input-Feld, das `/api/products?search=...` abfragt
- Ergebnisse als Liste mit Thumbnail + Titel + Preis
- Enter navigiert zur Catalog-Page mit Search-Param

**6.7 UI-Store `src/store/ui-store.ts`**
- Zustand für: `isCartDrawerOpen`, `isMobileMenuOpen`, `isSearchOpen`
- Methoden zum Setzen/Toggle

**6.8 Header-Scroll-Motion (verbindlich, siehe TASK 05B)**
- Header nutzt `use-scroll-direction`: verschwindet sanft (Fade + leichtes Y-Offset nach oben, 300ms) beim Scrollen nach unten, erscheint sofort wieder beim Scrollen nach oben
- Top-Notice-Bar-Textwechsel mit Crossfade (kein hartes Umspringen)
- Cart-Badge: beim Hinzufügen eines Items sanfter "Pop"-Scale (1 → 1.3 → 1, 300ms, `EASE_LUXURY`)
- Mobile-Menu & Cart-Drawer nutzen die zentralen Motion-Presets aus `src/lib/motion-presets.ts` (kein Ad-hoc-Framer-Motion in den Komponenten selbst)
- Ganze App ist in `PageTransition` (TASK 05B) gewrappt für sanfte Übergänge zwischen Home/Catalog/Product/Cart/Checkout

#### Akzeptanzkriterien
- [ ] Header bleibt sticky beim Scrollen, Background wird bei Scroll >20px opaker
- [ ] Header versteckt sich beim Scrollen nach unten und erscheint sofort beim Scrollen nach oben (dezent, kein Ruckeln)
- [ ] Seitenwechsel (Home → Catalog → Product) zeigen sanfte Page-Transition ohne Flash

- [ ] Top-Notice-Bar rotiert Text alle 5 Sekunden
- [ ] Cart-Badge zeigt korrekte Anzahl (Live-Update bei Add-to-Cart)
- [ ] Cart-Drawer slidet smooth von rechts ein (Framer Motion)
- [ ] ESC schließt Cart-Drawer und Mobile-Menu
- [ ] Backdrop-Klick schließt Cart-Drawer
- [ ] Mobile-Menu funktioniert auf 375px Viewport
- [ ] Footer enthält Markenrecht-Disclaimer
- [ ] Cmd+K öffnet Search-Modal
- [ ] Logo SONA Boutique in Cormorant Garamond

#### Dateien erstellt
- `src/app/layout.tsx`, `src/components/storefront/{Header,Footer,CartDrawer,SearchModal}.tsx`
- `src/store/ui-store.ts`

---

### TASK 07: Product Catalog (Backend + Frontend)
**Phase:** 1 · **Aufwand:** 2.5 PT · **Abhängigkeiten:** TASK 02, TASK 05, TASK 06

#### Ziel
Voll funktionsfähiger Produktkatalog mit API-Filterung (Brand, Kategorie, Kollektion, Zustand, Preis, Sortierung) und edler Frontend-Präsentation in Grid-Layout mit Hover-Effekten.

#### Subtasks

**7.1 API: `GET /api/products`**
- Query-Params: `search`, `brand` (slug), `category` (slug), `collection` (slug), `condition`, `minPrice`, `maxPrice`, `sort` (featured|newest|price-asc|price-desc), `limit`, `page`
- Where-Clause: `status = "PUBLISHED"` (niemals Drafts/Archived!)
- Include: `brand`, `images` (sortiert nach position), `category`
- Paginierung: Default 24 pro Seite, max 100
- Return: `{ products: Product[], total: number, page: number, totalPages: number }`

**7.2 API: `GET /api/brands`**
- Return: Alle Brands mit Produkt-Count
- Sortiert nach `sortOrder`, dann Name

**7.3 API: `GET /api/categories`**
- Return: Alle Kategorien mit Produkt-Count
- Sortiert nach `sortOrder`, dann Name

**7.4 API: `GET /api/collections`**
- Return: Alle aktiven Kollektionen mit Produkt-Count

**7.5 API: `GET /api/products/[slug]`**
- Return: Vollständiges Product mit Brand, Images, Variants, Reviews (verifizierte), Collections
- 404 wenn nicht gefunden oder nicht PUBLISHED

**7.6 Zod-Validatoren `src/lib/validators/product.ts`**
- Validierung aller Query-Params
- Schutz gegen SQL-Injection (Prisma tut dies, aber Defense in Depth)

**7.7 ProductCard-Komponente `src/components/storefront/ProductCard.tsx`**
- Card-Layout: quadratisches Bild, dann Brand, Title, Price
- Hover-Effekt: subtiler Scale (1.02), Image wechselt zu 2. Bild falls vorhanden
- Badges: "Featured" (gold), Discount-% (rot), Condition (farbig)
- Quick-Add-Button erscheint am unteren Bildrand bei Hover
- Click auf Card navigiert zu Produktdetail

**7.8 Catalog-Page `src/app/(storefront)/catalog/page.tsx`**
- Header mit Title (dynamisch je nach Filter)
- Toolbar: Filter-Button (mobile: slide-in, desktop: sidebar), Sort-Dropdown, Ergebnis-Count
- Filter-Sidebar:
  - Brand (Select)
  - Kategorie (Select)
  - Kollektion (Select)
  - Zustand (Radio-Group)
  - Preis (Min/Max Input)
  - "Filter zurücksetzen" Button
- Grid: 2 Spalten mobile, 3 Spalten tablet, 4 Spalten desktop
- Loading-State: Skeleton-Cards
- Empty-State: "Keine Taschen gefunden" mit Reset-Button
- Pagination: Load-More Button (kein klassisches Paging)

**7.9 Home-Page Hero `src/app/(storefront)/page.tsx`**
- Full-width Hero mit Background-Image (Unsplash für Demo)
- Headline in Cormorant Garamond, 64px
- Subline in Inter
- 2 CTAs: "Kollektion entdecken" (gold), "Investment Pieces" (outline)
- Trust-Badges darunter: Authentifiziert, Express-Versand, Echtheitszertifikat, Investment-Pieces

**7.10 Home: Featured Products Section**
- "Featured Pieces" Heading
- 4–8 ProductCards in Grid
- "Alle anzeigen" Button unten

**7.11 Home: Collections Section**
- 3 Collection-Cards (Bild + Name + "Entdecken")
- Hover-Effekt: Bild-Zoom, Gold-Rahmen

**7.12 Home: Authenticity Section**
- 2-Spalten-Layout: Bild links, Text rechts
- Aufzählung der Authentifizierungs-Schritte
- CTA: "Mehr erfahren" (Phase 3: eigene Seite)

#### Akzeptanzkriterien
- [ ] `/api/products` liefert 10 Produkte nach Seed
- [ ] Filter `?brand=hermes` liefert nur Hermès-Produkte
- [ ] Filter `?condition=pristine` liefert nur pristine Produkte
- [ ] Sort `?sort=price-asc` sortiert aufsteigend nach Preis
- [ ] `/api/products/[slug]` liefert vollständiges Product mit Relations
- [ ] 404 bei nicht-existierendem Slug
- [ ] Draft-Produkte erscheinen NICHT in API-Response
- [ ] ProductCard zeigt Badges korrekt (Featured, Discount, Condition)
- [ ] Hover-Effekt: 2. Bild wird angezeigt falls vorhanden
- [ ] Filter-Sidebar funktioniert auf Mobile (slide-in)
- [ ] Pagination via "Load More" lädt weitere Produkte
- [ ] LCP auf Catalog-Page < 2.5s

#### Dateien erstellt
- `src/app/api/products/route.ts`, `src/app/api/products/[slug]/route.ts`
- `src/app/api/brands/route.ts`, `src/app/api/categories/route.ts`, `src/app/api/collections/route.ts`
- `src/lib/validators/product.ts`
- `src/components/storefront/ProductCard.tsx`
- `src/app/(storefront)/catalog/page.tsx`, `src/app/(storefront)/page.tsx`

---

### TASK 08: Product Detail Page
**Phase:** 1 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 07

#### Ziel
Premium-Produktdetailseite mit Bildergalerie, vollständigen Luxus-Attributen, Zustandsbericht, Echtheitszertifikat, Reviews und Add-to-Cart / Buy-Now Aktionen.

#### Subtasks

**8.1 Page `src/app/(storefront)/product/[slug]/page.tsx`**
- Server Component, lädt Product via `params.slug`
- Generate Metadata für SEO (Title, Description, OG-Image)
- 404 bei nicht-existierendem Slug
- ISR: `revalidate = 60` Sekunden

**8.2 Bildergalerie-Komponente**
- Hauptbild groß (Aspect-Ratio 1:1)
- Thumbnails darunter (5er Grid)
- Click auf Thumbnail wechselt Hauptbild
- Optional: Zoom bei Hover (desktop)
- Alle Bilder mit `next/image`, altText aus DB

**8.3 Produkt-Info-Sektion (rechte Spalte)**
- Brand (uppercase, gold)
- Title (Cormorant Garamond, 32px)
- Subtitle (Inter, 16px, muted)
- GoldDivider
- PriceTag (resale, compareAt, retail)
- "Inkl. 19% MwSt., zzgl. Versand" Hinweis
- SKU Anzeige

**8.4 Spezifikationen-Tabelle**
- 2-Spalten-Grid: Material, Farbe, Hardware, Maße, Herstellungsland, Baujahr
- Label: uppercase, gold, 10px
- Value: Inter, 14px

**8.5 Inclusions-Sektion**
- "Inklusive" Heading
- Badges für Originalbox, Dust Bag, Rechnung, Echtheitskarte

**8.6 Authentizitäts-Zertifikat-Box**
- Hintergrund: dezentes Creme
- Icon: ShieldCheck
- "Authentizitätszertifikat" Heading
- Zertifikats-Nummer (mono-spaced)
- Zustandsbericht (conditionNotes)

**8.7 Quantity-Selector + Add-to-Cart**
- Stepper (− Quantity +)
- "In den Warenkorb" Button (gold)
- "Jetzt kaufen" Button (outline) — fügt hinzu und geht direkt zu Checkout
- Bei `inventoryQuantity = 0`: "Ausverkauft" State

**8.8 Trust-Badges**
- 3 Icons mit Text: Express-Versand, 14 Tage Rückgabe, Echtheitszertifikat

**8.9 Reviews-Sektion**
- Heading: "Bewertungen"
- Sterne-Rating (5★ gefüllt/leer)
- Liste verifizierter Reviews (Author, Datum, Sterne, Titel, Body)
- "Verifizierter Kauf" Badge

**8.10 Breadcrumb**
- Home / Brand / Product Title
- Klickbar

#### Akzeptanzkriterien
- [ ] Page lädt in <1.5s (Server Component, ISR)
- [ ] Bildergalerie: Thumbnail-Click wechselt Hauptbild ohne Lag
- [ ] Quantity-Stepper limitiert auf `inventoryQuantity`
- [ ] "In den Warenkorb" fügt Item zum Cart hinzu, öffnet Cart-Drawer
- [ ] "Jetzt kaufen" fügt hinzu und navigiert zu `/checkout`
- [ ] Ausverkaufte Produkte zeigen "Ausverkauft" statt Buttons
- [ ] Reviews nur von verifizierten Käufern sichtbar
- [ ] Breadcrumb ist korrekt und klickbar
- [ ] SEO Meta-Tags enthalten Produkt-Titel und Beschreibung
- [ ] Mobile: 1-Spalten-Layout (Galerie oben, Info unten)

#### Dateien erstellt
- `src/app/(storefront)/product/[slug]/page.tsx`
- `src/components/storefront/{ProductGallery,ProductInfo,QuantityStepper,Reviews}.tsx`

---

### TASK 09: Cart-System
**Phase:** 1 · **Aufwand:** 2.5 PT · **Abhängigkeiten:** TASK 04, TASK 07

#### Ziel
Serverseitig berechneter Warenkorb mit Anonymous-Cart (Cookie) für Gäste, Merge-Logik bei Login, Bestandskontrolle (Single-Piece-Inventory!), automatischer Steuer- und Versandberechnung.

#### Subtasks

**9.1 Cart-Helpers `src/lib/cart.ts`**
- `getOrCreateCart()`: Liefert Cart aus Cookie oder erstellt neues
- `getCartFromRequest(req)`: Cart aus Request-Cookie lesen
- `recomputeCart(cartId)`: Serverseitige Neuberechnung von Subtotal, Shipping, Tax, Discount, Total
- `mergeAnonymousCartToCustomerCart(anonymousCartId, customerId)`: Merge-Logik

**9.2 Cart-Cookie Handling**
- Cookie-Name: `sona_cart`
- HttpOnly, SameSite=Strict, Secure in Prod
- TTL: 30 Tage
- Wert: Cart-ID (UUID), keine Verschlüsselung nötig (ID hat genug Entropie)

**9.3 Berechnungslogik in `recomputeCart`**
```typescript
// 1. Subtotal: Summe aller (unitPriceCents * quantity)
const subtotal = cart.items.reduce((sum, it) => sum + it.unitPriceCents * it.quantity, 0);

// 2. Discount: Wenn promoCode gesetzt, validieren und berechnen
let discount = 0;
if (cart.promoCode) {
  const promo = await db.promoCode.findUnique({ where: { code: cart.promoCode } });
  if (promo?.isActive && subtotal >= promo.minOrderCents) {
    discount = promo.type === "PERCENTAGE"
      ? Math.floor(subtotal * promo.value / 100)
      : Math.min(promo.value, subtotal);
  }
}

// 3. Shipping: Gratis ab 500€, sonst 15€ (versicherter Versand)
const shipping = subtotal === 0 || subtotal >= 50000 ? 0 : 1500;

// 4. Tax: 19% auf (subtotal - discount + shipping)
const taxable = Math.max(0, subtotal - discount) + shipping;
const tax = Math.floor(taxable * 0.19);

// 5. Total
const total = taxable + tax;
```

**9.4 API: `GET /api/cart`**
- Liefert oder erstellt Cart
- Include: `items.product.{brand, images}`

**9.5 API: `POST /api/cart`**
- Body: `{ productId, productVariantId?, quantity? }`
- Validierung mit Zod
- Inventory-Check: `quantity <= product.inventoryQuantity`
- Wenn Produkt bereits im Cart: Menge addieren (max. Inventory)
- Wenn nicht: Neues CartItem erstellen
- `recomputeCart` aufrufen
- Return: aktualisiertes Cart

**9.6 API: `PATCH /api/cart/items/[itemId]`**
- Body: `{ quantity }`
- quantity = 0 → Item löschen
- quantity > inventory → auf inventory limitieren
- `recomputeCart` aufrufen

**9.7 API: `DELETE /api/cart/items/[itemId]`**
- CartItem löschen
- `recomputeCart` aufrufen

**9.8 API: `POST /api/cart/promo`**
- Body: `{ code }`
- PromoCode validieren (aktiv, im Zeitraum, Mindestbestellwert)
- In Cart speichern
- `recomputeCart` aufrufen
- Fehler: ungültig, abgelaufen, Mindestbestellwert nicht erreicht

**9.9 API: `DELETE /api/cart/promo`**
- PromoCode aus Cart entfernen
- `recomputeCart` aufrufen

**9.10 Cart-Store `src/store/cart-store.ts`**
- State: `cart`, `loading`
- Methoden: `fetchCart`, `addItem`, `updateItem`, `removeItem`, `applyPromo`, `removePromo`
- Bei `addItem`: Cart-Drawer automatisch öffnen
- `cartCount` Selector

**9.11 Merge-Logik bei Login**
- In `/api/auth/login/route.ts`: Nach erfolgreichem Login prüfen, ob `sona_cart` Cookie existiert
- Wenn ja: Alle CartItems des Anonymous-Carts in den Customer-Cart übertragen
- Wenn Customer noch keinen aktiven Cart hat: Anonymous-Cart übernehmen (customerId setzen)
- Wenn Customer bereits Cart hat: Items mergen (bei Konflikt: Summe, max. Inventory)
- Anonymous-Cart auf Status `MERGED` setzen
- Cookie bleibt erhalten, zeigt aber auf Customer-Cart

**9.12 Cart-Page `src/app/(storefront)/cart/page.tsx`**
- Liste aller CartItems (Bild, Title, Brand, SKU, Quantity-Stepper, Price, Remove)
- Zusammenfassung rechts: Subtotal, Versand, MwSt., Rabatt (falls Promo), Total
- Promo-Code-Eingabe mit "Anwenden" Button
- Hinweis: "Test-Codes: WELCOME10, VIP500"
- "Zur Kasse" Button
- Empty-State: "Ihr Warenkorb ist leer" + "Kollektion entdecken" CTA

**9.13 Single-Piece-Inventory-Hinweis**
- Wenn Produkt `inventoryQuantity = 1`: Hinweis "Einzelstück — nur 1 verfügbar"
- Wenn Kunde versucht, Menge > 1 zu setzen: Fehler "Dieses exklusive Stück ist nur einmal verfügbar"

#### Akzeptanzkriterien
- [ ] Anonymous-Cart wird via Cookie persistiert (auch nach Browser-Neustart)
- [ ] Add-to-Cart aktualisiert Cart-Badge live
- [ ] Cart-Drawer zeigt Items korrekt an
- [ ] Quantity-Update funktioniert (mit Inventory-Limit)
- [ ] Remove-Item funktioniert
- [ ] Promo-Code `WELCOME10` gibt 10% Rabatt ab 500€
- [ ] Promo-Code `VIP500` gibt 500€ Rabatt ab 5000€
- [ ] Ungültiger Promo-Code → Fehlermeldung
- [ ] Versand gratis ab 500€ (automatisch)
- [ ] MwSt. 19% korrekt berechnet und ausgewiesen
- [ ] Login merge-t Anonymous-Cart in Customer-Cart
- [ ] Preise können NICHT im Client manipuliert werden (Server-Source of Truth)

#### Dateien erstellt
- `src/lib/cart.ts`, `src/store/cart-store.ts`
- `src/app/api/cart/route.ts`, `src/app/api/cart/items/[itemId]/route.ts`, `src/app/api/cart/promo/route.ts`
- `src/app/(storefront)/cart/page.tsx`

---

### TASK 10: Checkout-Flow (Mock Payment)
**Phase:** 1 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 09

#### Ziel
Vollständiger Checkout-Flow mit Kontakt-, Liefer- und Rechnungsadresse, Mock-Zahlung (auto-succeed), Bestellerstellung mit Inventory-Decrement und Cart-Abschluss.

#### Subtasks

**10.1 API: `POST /api/checkout`**
- Body: Kontakt + Shipping + Billing (Billing optional, default = Shipping)
- Validierung mit Zod
- Cart abrufen (aus Cookie)
- Cart muss Items haben (sonst 400)
- Final `recomputeCart` für Sicherheit
- Order-Number generieren: `SONA-2026-XXXXX` (fortlaufend)
- Order mit allen Snapshots erstellen (Transaktion!)
- OrderItems mit Titel/SKU/Brand/Price als Snapshot
- Payment mit Provider=MOCK, Status=SUCCEEDED erstellen
- Order.paymentStatus = PAID, paidAt = now
- Inventory dekrementieren (transaktional)
- Cart auf COMPLETED setzen
- Promo-Code usageCount inkrementieren
- Return: `{ order: { id, number } }`

**10.2 Transaktionssicherheit**
```typescript
await db.$transaction(async (tx) => {
  // 1. Inventory prüfen (nochmal, gegen Race-Conditions)
  for (const item of cart.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.inventoryQuantity < item.quantity) {
      throw new Error("Insufficient inventory");
    }
  }
  // 2. Order + OrderItems + Payment erstellen
  const order = await tx.order.create({ ... });
  // 3. Inventory dekrementieren
  for (const item of cart.items) {
    await tx.product.update({ where: { id: item.productId }, data: { inventoryQuantity: { decrement: item.quantity } } });
  }
  // 4. Cart abschließen
  await tx.cart.update({ where: { id: cart.id }, data: { status: "COMPLETED", completedAt: new Date() } });
  return order;
});
```

**10.3 Zod-Validator `src/lib/validators/checkout.ts`**
```typescript
export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().optional(),
  
  shippingStreet1: z.string().min(1),
  shippingStreet2: z.string().optional(),
  shippingCity: z.string().min(1),
  shippingPostalCode: z.string().min(1),
  shippingCountry: z.enum(["DE", "AT", "CH", "FR", "IT", "NL"]),
  
  billingStreet1: z.string().optional(),  // default = shipping
  billingStreet2: z.string().optional(),
  billingCity: z.string().optional(),
  billingPostalCode: z.string().optional(),
  billingCountry: z.enum(["DE", "AT", "CH", "FR", "IT", "NL"]).optional(),
});
```

**10.4 Checkout-Page `src/app/(storefront)/checkout/page.tsx`**
- Section 1: Kontakt (Email, Telefon, Vorname, Nachname)
- Section 2: Lieferadresse (Street1, Street2, City, PLZ, Country-Select)
- Section 3: Rechnungsadresse (Checkbox "Wie Lieferadresse" → Felder ausblenden)
- Section 4: Zahlung (Mock-Hinweis "Demo-Modus, keine echte Zahlung")
- Sticky Summary rechts: Items-Liste, Subtotal, Shipping, Tax, Discount, Total
- Submit-Button: "Zahlungspflichtig bestellen" (§312j BGB!)
- Loading-State während Submit
- Error-State bei Fehlern

**10.5 Order-Confirmation-Page `src/app/(storefront)/order/[id]/page.tsx`**
- Success-Icon (CheckCircle, gold)
- "Vielen Dank für Ihre Bestellung"
- Order-Nummer prominent
- Bestelldatum
- Items-Liste
- Summary
- Lieferadresse
- Status: "Bezahlt" (Payment), "In Bearbeitung" (Fulfillment)
- Next-Steps: "Bestätigung per E-Mail", "Authentifizierung", "Express-Versand"
- "Weiter stöbern" Button
- Access: Customer (owner) oder Admin oder Guest innerhalb von 30 Min nach `placedAt`

**10.6 PAngV-Konformität**
- Jeder Preis mit "inkl. 19% MwSt., zzgl. Versand" Hinweis
- Versandkosten werden vor Submit klar ausgewiesen
- Total final als "Gesamtsumme" bezeichnet
- Button-Beschriftung: "Zahlungspflichtig bestellen" (gesetzlich vorgeschrieben!)

**10.7 Access Control für Order-Page**
- Customer eingeloggt: eigene Orders sichtbar
- Guest (nicht eingeloggt): Order sichtbar wenn `placedAt` < 30 Min zurück
- Sonst: 401 / Login-Aufforderung

#### Akzeptanzkriterien
- [ ] Checkout-Form validiert alle Pflichtfelder
- [ ] Submit erstellt Order mit Snapshot-Daten
- [ ] Inventory wird korrekt dekrementiert
- [ ] Cart wird auf COMPLETED gesetzt
- [ ] Order-Confirmation-Page zeigt Order-Nummer und Details
- [ ] Guest-Checkout funktioniert (ohne Login)
- [ ] Bei Login werden Bestellungen dem Customer zugeordnet
- [ ] Submit-Button heißt "Zahlungspflichtig bestellen"
- [ ] "inkl. 19% MwSt., zzgl. Versand" Hinweis sichtbar
- [ ] Race-Condition-Test: 2 gleichzeitige Checkouts mit Inventory=1 → nur einer successful, anderer 409

#### Dateien erstellt
- `src/lib/validators/checkout.ts`
- `src/app/api/checkout/route.ts`
- `src/app/(storefront)/checkout/page.tsx`, `src/app/(storefront)/order/[id]/page.tsx`

---

### TASK 11: Admin-Console
**Phase:** 1 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 04, TASK 07

#### Ziel
Voll funktionsfähiger Admin-Bereich unter `/admin` mit Dashboard-KPIs, Produkt-CRUD (inkl. Luxus-Attribute), Bestellverwaltung (Fulfillment-Status) und Promo-Code-Verwaltung.

#### Subtasks

**11.1 Admin-Layout `src/app/admin/layout.tsx`**
- Eigene Sidebar-Navigation
- Tabs: Dashboard, Produkte, Bestellungen, Promo-Codes
- Auth-Check: `requireAdmin()` (wirft 403 wenn nicht Admin)
- Link "Zum Shop" (zurück zur Startseite)
- Logout-Button

**11.2 Admin-Dashboard `src/app/admin/page.tsx`**
- 4 KPI-Cards: Produkte (Count), Bestellungen (Count), Umsatz (Summe paid Orders), Offene Fulfillments (Count pending)
- Letzte 5 Bestellungen (Tabelle)
- Low-Stock-Alerts (Produkte mit inventoryQuantity ≤ 1 — bei Luxus normal, aber Hinweis)
- Schnellaktionen: "Neues Produkt", "Promo-Code erstellen"

**11.3 Admin-Produktliste `src/app/admin/products/page.tsx`**
- Tabelle: Produkt (Title + SKU), Brand, Preis, Lager, Status, Aktionen (Edit, Delete)
- Filter: Status, Brand
- Suche nach Title/SKU
- Pagination (10 pro Seite)
- "Neues Produkt" Button

**11.4 Admin-Produkt erstellen `src/app/admin/products/new/page.tsx`**
- Mehrstufiges Form:
  - Sektion 1: Allgemein (Title, Subtitle, Description, Brand, Category, Status, SKU)
  - Sektion 2: Luxus-Attribute (Material, Color, Hardware, Origin, Year, Condition, ConditionNotes, CertNo)
  - Sektion 3: Inclusions (Checkboxen: Box, DustBag, Receipt, AuthCard)
  - Sektion 4: Preise (ResalePrice in €, CompareAt optional, Retail optional, Inventory)
  - Sektion 5: Logistik (Weight, Dimensions, Tags, IsFeatured, FeaturedRank)
  - Sektion 6: Kollektionen (Multi-Select)
  - Sektion 7: Bilder (Phase 1: URL-Inputs, Phase 3: Cloudinary-Upload)
- Validierung mit React Hook Form + Zod
- Submit: POST /api/admin/products

**11.5 Admin-Produkt bearbeiten `src/app/admin/products/[id]/page.tsx`**
- Gleiches Form wie New, vorausgefüllt
- Submit: PATCH /api/admin/products/[id]
- Delete-Button mit Confirmation-Dialog

**11.6 Admin-API-Routen**

`POST /api/admin/products`:
- requireAdmin
- Validierung mit Zod
- Slug auto-generieren aus Title
- SKU auto-generieren falls leer
- Default-Variant erstellen
- Return: erstelltes Product

`PATCH /api/admin/products/[id]`:
- requireAdmin
- Whitelist der updatable Fields
- Bei Status-Wechsel zu PUBLISHED: `publishedAt` setzen
- Return: aktualisiertes Product

`DELETE /api/admin/products/[id]`:
- requireAdmin
- Soft-Delete: Status auf ARCHIVED setzen (nicht physisch löschen, wegen Order-Referenzen)
- Return: `{ ok: true }`

`GET /api/admin/orders`:
- requireAdmin
- Alle Orders mit Items und Customer
- Filter: fulfillmentStatus, paymentStatus
- Pagination
- Sortiert nach placedAt desc

`PATCH /api/admin/orders/[id]`:
- requireAdmin
- Body: `{ fulfillmentStatus?, trackingNumber?, carrier? }`
- Bei Status-Wechsel zu SHIPPED: `shippedAt` setzen, Shipment-Eintrag erstellen
- Bei Status-Wechsel zu DELIVERED: `deliveredAt` setzen
- Bei Status-Wechsel zu CANCELLED: `cancelledAt` setzen, Inventory restaurieren (transaktional!)

`GET /api/admin/promo-codes`, `POST /api/admin/promo-codes`, `PATCH /api/admin/promo-codes/[id]`:
- CRUD für PromoCodes

**11.7 Admin-Bestelldetail `src/app/admin/orders/[id]/page.tsx`**
- Order-Header: Nummer, Datum, Status-Badges
- Customer-Info (Name, Email, Phone)
- Shipping- & Billing-Adresse
- Items-Tabelle
- Financials (Subtotal, Shipping, Tax, Discount, Total, PartialRefund)
- Actions:
  - "Als versendet markieren" (öffnet Modal für Carrier + TrackingNo)
  - "Als zugestellt markieren"
  - "Stornieren" (mit Begründung)
  - "Rückerstattung" (Phase 2: Stripe Refund, Phase 1: nur Status-Update)

#### Akzeptanzkriterien
- [ ] `/admin` leitet nicht-eingeloggte User zu Login um
- [ ] Customer ohne Admin-Role bekommt 403
- [ ] Dashboard zeigt korrekte KPIs (nach Seed: 10 Produkte, 0 Bestellungen)
- [ ] Produkt-Erstellung funktioniert mit allen Luxus-Attributen
- [ ] Produkt-Bearbeitung speichert Änderungen korrekt
- [ ] Produkt-Löschung setzt Status auf ARCHIVED (nicht physisch)
- [ ] Bestell-Status-Updates funktionieren (PENDING → SHIPPED → DELIVERED)
- [ ] Tracking-Nummer wird in Shipment-Tabelle gespeichert
- [ ] Stornierung restauriert Inventory (transaktional)
- [ ] Promo-Code CRUD funktioniert

#### Dateien erstellt
- `src/app/admin/{layout,page}.tsx`
- `src/app/admin/products/{page,new/page,[id]/page}.tsx`
- `src/app/admin/orders/{page,[id]/page}.tsx`
- `src/app/admin/promo-codes/page.tsx`
- `src/app/api/admin/{products,orders,promo-codes}/route.ts`
- `src/app/api/admin/{products,orders}/[id]/route.ts`

---

### TASK 12: DNS & E-Mail-Foundation
**Phase:** 1 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 01

#### Ziel
DNS-Konfiguration für `sona-boutique.de` (SPF, DKIM, DMARC) vorbereiten, sodass Phase 2 (E-Mail-Versand) sofort starten kann. SMTP-Fallback einrichten.

#### Subtasks

**12.1 DNS-Einträge dokumentieren**

Für die Domain `sona-boutique.de` folgende Einträge erstellen (in `docs/dns-setup.md`):

```
# A Record
sona-boutique.de.         IN A     76.76.21.21  (Vercel)

# CNAME www
www.sona-boutique.de.     IN CNAME cname.vercel-dns.com.

# MX Record (für E-Mail-Empfang)
sona-boutique.de.         IN MX    10 mail.sona-boutique.de.

# SPF (für Resend / SendGrid)
sona-boutique.de.         IN TXT   "v=spf1 include:_spf.resend.com ~all"

# DKIM (Resend liefert Key)
resend._domainkey.sona-boutique.de. IN TXT "v=DKIM1; k=rsa; p=MIIBIjANBgkqh..."

# DMARC
_dmarc.sona-boutique.de.  IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@sona-boutique.de; pct=100; adkim=s; aspf=s"
```

**12.2 E-Mail-Adressen planen**
- `noreply@sona-boutique.de` (Transaktions-E-Mails)
- `info@sona-boutique.de` (Allgemeine Anfragen)
- `support@sona-boutique.de` (Kunden-Support)
- `dmarc@sona-boutique.de` (DMARC-Reports)

**12.3 Resend-Account vorbereiten**
- Auf resend.com registrieren
- Domain `sona-boutique.de` hinzufügen
- DKIM-Records von Resend in DNS eintragen
- API-Key generieren: `re_...`
- In `.env.local`: `RESEND_API_KEY=re_...`

**12.4 E-Mail-Client-Stub `src/lib/email.ts`**
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to, subject, react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (process.env.NODE_ENV === "development") {
    console.log("[EMAIL DEV]", { to, subject });
    return { id: "dev" };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "SONA Boutique <noreply@sona-boutique.de>",
      to,
      subject,
      react,
    });
    if (error) throw error;
    return data;
  } catch (err) {
    // SMTP Fallback (Phase 2: implement with nodemailer)
    console.error("[EMAIL ERROR]", err);
    throw err;
  }
}
```

**12.5 React Email Templates vorbereiten (Struktur)**
- `src/emails/order-confirmation.tsx` (leerer Stub, Implementierung in Phase 2)
- `src/emails/shipping-update.tsx` (Stub)
- `src/emails/password-reset.tsx` (Stub)
- `src/emails/welcome.tsx` (Stub)

**12.6 Health-Check Endpoint `src/app/api/health/route.ts`**
```typescript
export async function GET() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    env: process.env.NODE_ENV,
  });
}
```

#### Akzeptanzkriterien
- [ ] DNS-Einträge dokumentiert in `docs/dns-setup.md`
- [ ] Resend-Account erstellt, Domain verifiziert
- [ ] SPF, DKIM, DMARC in DNS gesetzt
- [ ] DMARC-Reports-Adresse erreichbar
- [ ] `src/lib/email.ts` existiert mit sendEmail-Funktion
- [ ] In Dev-Mode: E-Mails werden geloggt statt gesendet
- [ ] `/api/health` liefert `{ status: "ok" }`

#### Dateien erstellt
- `docs/dns-setup.md`, `src/lib/email.ts`, `src/app/api/health/route.ts`
- `src/emails/{order-confirmation,shipping-update,password-reset,welcome}.tsx` (Stubs)

---

## PHASE 2: STRIPE, E-MAILS, SECURITY & RECHT (14 Personentage)

**Ziel:** Produktionsreife Zahlungsabwicklung via Stripe (inkl. Refunds & Disputes), Transaktions-E-Mails, vollständige IT-Security-Härtung und rechtssicherer Betrieb in DE/EU.

---

### TASK 13: Stripe Checkout Integration
**Phase:** 2 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 10

#### Ziel
SCA-konforme Zahlungsabwicklung via Stripe Checkout (PCI-DSS-outourced), Übergang von Mock-Payment zu echten Zahlungen in Staging/Prod.

#### Subtasks

**13.1 Stripe-Dependencies**
```bash
bun add stripe @stripe/stripe-js
```

**13.2 Stripe-Client `src/lib/stripe.ts`**
```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
  maxNetworkRetries: 3,
});
```

**13.3 Stripe-Test-Keys in `.env.local`**
- `STRIPE_SECRET_KEY=sk_test_...` (nur Test-Mode in Dev!)
- `STRIPE_PUBLIC_KEY=pk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...` (lokaler Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

**13.4 Checkout-Flow umstellen**
- In `POST /api/checkout`: Statt Mock-Payment → Stripe Checkout Session erstellen
- Line-Items aus Cart-Items generieren
- Success-URL: `${APP_URL}/order/${orderId}?success=true`
- Cancel-URL: `${APP_URL}/checkout?canceled=true`
- Metadata: `{ orderId, customerId, cartId }`
- Customer Email: aus Form
- Shipping-Address-Collection: `allowed_countries: ["DE","AT","CH","FR","IT","NL"]`
- Return: `{ checkoutUrl }` (Frontend leitet weiter)

**13.5 Frontend-Anpassung**
- In Checkout-Page: Submit-Button leitet zu Stripe-Checkout weiter
- Loading-State während Redirect
- Bei Return von Stripe (Success-URL): Order-Status via Webhook asynchron, Frontend zeigt "Verarbeitung läuft"

**13.6 Stripe-Webhook `src/app/api/webhooks/stripe/route.ts`**
- Body als Raw-Buffer lesen (WICHTIG für Signatur-Verifikation!)
- Stripe-Signatur-Header verifizieren mit `stripe.webhooks.constructEvent(body, sig, webhookSecret)`
- Event-Handler für:
  - `checkout.session.completed` → Order als PAID markieren, Inventory endgültig dekrementieren, E-Mail senden
  - `payment_intent.payment_failed` → Order als FAILED markieren, Inventory restaurieren
  - `charge.dispute.created` → Admin-Notification, Order blockieren (Task 14 detailliert)
  - `charge.refunded` → Order.paymentStatus aktualisieren (Task 14)
- Idempotenz: Stripe-Event-ID in `Payment.providerRef` speichern, vor Verarbeitung prüfen ob bereits verarbeitet
- Return: `{ received: true }` (Stripe erwartet 200-Response innerhalb 30 Sek!)

**13.7 Stripe CLI für lokale Entwicklung**
```bash
brew install stripe/stripe-cli/stripe  # macOS
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
- Output: `whsec_...` als `STRIPE_WEBHOOK_SECRET` in `.env.local`

**13.8 Stripe Customer Objects (Phase 2.5)**
- Bei Checkout eingeloggter Kunden: Stripe Customer erstellen falls noch nicht vorhanden
- `Customer.stripeCustomerId` in DB speichern
- Bei zukünftigen Checkouts: Customer-ID wiederverwenden (für gespeicherte Karten)

#### Akzeptanzkriterien
- [ ] Stripe-Test-Checkout mit `4242 4242 4242 4242` erfolgreich
- [ ] Stripe-Test-Checkout mit `4000 0000 0000 9995` (insufficient funds) → Fehler
- [ ] Stripe-Test-Checkout mit `4000 0027 6000 3184` (3D Secure) → SCA-Flow
- [ ] Webhook verifiziert Signatur korrekt (ungültige Signatur → 400)
- [ ] Order wird nach `checkout.session.completed` als PAID markiert
- [ ] Inventory wird nach erfolgreicher Zahlung final dekrementiert
- [ ] Bei fehlgeschlagener Zahlung: Inventory restauriert
- [ ] Idempotenz: Doppelter Webhook ändert Order-Status nicht nocheinmal
- [ ] Test-Modus: KEINE Live-Keys in Dev-Env
- [ ] Production-Modus: KEINE Test-Keys, KEINE Test-Cards irgendwo referenziert

#### Dateien erstellt
- `src/lib/stripe.ts`, `src/app/api/webhooks/stripe/route.ts`
- Update `src/app/api/checkout/route.ts`, `src/app/(storefront)/checkout/page.tsx`
- `docs/stripe-setup.md`

---

### TASK 14: Stripe Refund & Dispute Handling
**Phase:** 2 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 13

#### Ziel
Vollständige Rückerstattungs-Logik (volle + partielle Refunds) via Stripe Refund API und Dispute-Handling mit Admin-Notification und Order-Sperre.

#### Subtasks

**14.1 Admin-API: `POST /api/admin/orders/[id]/refund`**
- requireAdmin
- Body: `{ amount?: number, reason?: string }` (optional amount für partielle Refund)
- Stripe Refund erstellen: `stripe.refunds.create({ payment_intent: order.payments[0].providerRef, amount: amountCents })`
- In DB: 
  - Bei voller Refund: `paymentStatus = REFUNDED`, `refundReason` setzen
  - Bei partieller Refund: `partialRefundCents` erhöhen, `paymentStatus = PARTIALLY_REFUNDED`
- Neue Payment-Entity erstellen: `provider = STRIPE`, `providerRef = refund.id`, `amountCents = -amount` (negativ für Refund), `status = SUCCEEDED`
- Inventory restaurieren bei voller Refund (transaktional!)
- Customer per E-Mail informieren

**14.2 Admin-UI: Refund-Modal**
- Button "Rückerstattung" in Order-Detail-View (nur wenn `paymentStatus = PAID`)
- Modal: 
  - Toggle "Volle Rückerstattung" / "Partiell"
  - Bei partiell: Input für Betrag in €
  - Pflichtfeld: Grund (Select: "Kundenanfrage", "Widerruf", "Defekt", "Andere")
  - Confirm-Button mit Warning-Hinweis
- Nach Submit: Modal schließen, Order aktualisieren

**14.3 Dispute-Webhook erweitern**
- Event `charge.dispute.created`:
  - Dispute-Daten in separater Tabelle loggen (optional: `Dispute` Model, falls häufiger)
  - Order-Status auf `CANCELLED` setzen (temporär, bis Dispute geklärt)
  - Sentry-Alert auslösen: `Sentry.captureMessage("Stripe dispute created for order " + order.number, "error")`
  - E-Mail an `support@sona-boutique.de` mit Dispute-Details
- Event `charge.dispute.closed`:
  - Je nach `dispute.status` (`won` / `lost`):
    - Won: Order-Status wiederherstellen
    - Lost: Order endgültig als `REFUNDED` markieren

**14.4 Stripe-Test-Szenarien dokumentieren**
In `docs/stripe-testing.md`:
- Test-Card für Refund: `4242 4242 4242 4242` (erfolgreich refundable)
- Test-Card für Dispute: `4000 0000 0000 0259` (simuliert Dispute)
- Schritt-für-Schritt-Anleitung für lokales Testing

#### Akzeptanzkriterien
- [ ] Volle Refund erstellt Stripe Refund Object und aktualisiert Order
- [ ] Partielle Refund speichert Betrag in `partialRefundCents`
- [ ] `paymentStatus` wechselt korrekt: PAID → PARTIALLY_REFUNDED → REFUNDED
- [ ] Bei voller Refund: Inventory wird restauriert (transaktional)
- [ ] Dispute-Webhook setzt Order auf CANCELLED
- [ ] Dispute-Webhook löst Sentry-Alert aus
- [ ] Dispute-Webhook sendet E-Mail an Support
- [ ] Bei `dispute.closed` mit `won`: Order wird wiederhergestellt
- [ ] Refund-Modal validiert Betrag (≤ Order Total, > 0)

#### Dateien erstellt
- `src/app/api/admin/orders/[id]/refund/route.ts`
- Update `src/app/api/webhooks/stripe/route.ts`
- Update `src/app/admin/orders/[id]/page.tsx`
- `docs/stripe-testing.md`

---

### TASK 15: E-Mail-System (Templates & Versand)
**Phase:** 2 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 12, TASK 13

#### Ziel
Vollständiges Transaktions-E-Mail-System mit React Email Templates, Resend-Versand, SMTP-Fallback und allen 4 Templates (Bestellbestätigung, Versand-Update, Passwort-Reset, Willkommen).

#### Subtasks

**15.1 React Email Setup**
```bash
bun add react-email @react-email/components
```

**15.2 E-Mail-Templates in `src/emails/`**

**`order-confirmation.tsx`:**
- Header: SONA Boutique Logo
- "Vielen Dank für Ihre Bestellung, [Vorname]!"
- Order-Nummer prominent
- Bestellte Artikel (Tabelle: Bild, Title, SKU, Menge, Preis)
- Summary (Subtotal, Versand, MwSt., Total)
- Lieferadresse
- "Nächste Schritte": Authentifizierung → Versand → Zustellung
- Footer: AGB-Link, Widerrufsbelehrung-Link, Impressum-Link
- Disclaimer: Markenrechtlicher Hinweis

**`shipping-update.tsx`:**
- "Ihre Bestellung wurde versandt"
- Carrier + Tracking-Nummer
- Link zur Sendungsverfolgung (DHL: `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=[tracking]`)
- Hinweis auf Versicherungsschutz

**`password-reset.tsx`:**
- "Passwort zurücksetzen"
- Reset-Link (24h gültig)
- Hinweis: "Falls Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren."

**`welcome.tsx`:**
- "Willkommen bei SONA Boutique"
- Vorteile des Kundenkontos
- "Erste Schritte": Kollektion entdecken

**15.3 E-Mail-Trigger**
- Nach `checkout.session.completed` Webhook: `order-confirmation.tsx` an `order.email`
- Nach Admin-Aktion "Als versendet markieren": `shipping-update.tsx` an `order.email`
- Nach Passwort-Reset-Request: `password-reset.tsx` an Customer
- Nach Registrierung: `welcome.tsx` an neuen Customer

**15.4 SMTP-Fallback `src/lib/email-smtp.ts`**
- Mit `nodemailer` konfigurieren
- Transport: SMTP des Hosters (z.B. Strato, Ionos)
- Wird aktiviert wenn Resend API fehlschlägt (Try-Catch in `sendEmail`)
- Loggt alle Sendungen für Audit

**15.5 E-Mail-Testing**
- In Dev-Mode: E-Mails in Console loggen, nicht senden
- Optional: Ethereal-Mail-Account (`https://ethereal.email`) für visuelles Testing
- Für lokale Tests mit echtem Versand: Resend Test-Mode verwenden (`re_...` Test-Key)

**15.6 Anhang-Handling**
- AGB und Widerrufsbelehrung als PDF-Attachment in Bestellbestätigung
- Optional: Rechnung als PDF-Attachment (Phase 3: Rechnungs-Generierung)

**15.7 E-Mail-Tracking-Opt-out**
- Keine Tracking-Pixel (DSGVO!)
- Keine Marketing-E-Mails ohne Consent (nur Transaktions-E-Mails)

#### Akzeptanzkriterien
- [ ] Bestellbestätigung wird nach erfolgreichem Stripe-Webhook versendet
- [ ] Versand-Update wird nach Admin-Aktion versendet
- [ ] Passwort-Reset-E-Mail enthält gültigen Token-Link
- [ ] Willkommens-E-Mail nach Registrierung
- [ ] E-Mails rendern korrekt in Gmail, Outlook, Apple Mail
- [ ] Dark-Mode-kompatibel (Inline-CSS)
- [ ] SPF/DKIM/DMARC verifiziert (über mail-tester.com Score 10/10)
- [ ] SMTP-Fallback aktiviert sich bei Resend-Ausfall
- [ ] Dev-Mode: KEINE echten E-Mails, nur Logs
- [ ] Anhänge (AGB PDF) sind korrekt eingebettet

#### Dateien erstellt
- `src/emails/{order-confirmation,shipping-update,password-reset,welcome}.tsx`
- `src/lib/email-smtp.ts`
- Update `src/lib/email.ts`, `src/app/api/webhooks/stripe/route.ts`
- Update `src/app/admin/orders/[id]/page.tsx` (Trigger Versand-Update)
- `docs/email-templates.md`

---

### TASK 16: IT-Security-Härtung
**Phase:** 2 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 04, TASK 09, TASK 10

#### Ziel
Vollständige IT-Security-Härtung: Input-Validierung auf allen API-Routes, Rate-Limiting, CSRF-Schutz, Security-Header (CSP, HSTS, X-Frame-Options etc.), CORS-Policy, Secrets-Management.

#### Subtasks

**16.1 Zod-Validatoren vervollständigen `src/lib/validators/`**
- `auth.ts` (TASK 04)
- `cart.ts`: addItemSchema, updateItemSchema, applyPromoSchema
- `checkout.ts`: checkoutSchema (TASK 10)
- `product.ts`: productQuerySchema, adminProductCreateSchema, adminProductUpdateSchema
- `order.ts`: orderStatusUpdateSchema, refundSchema

**16.2 Validierung auf JEDER API-Route**
- Pattern: Body mit `schema.parse(body)` validieren vor Business-Logik
- Bei Invalid: 422 mit spezifischer Fehlermeldung
- Query-Params ebenfalls validieren

**16.3 Rate-Limiting `src/lib/rate-limit.ts` erweitern**
- In-Memory Store (Phase 3: Redis)
- Funktion: `rateLimit(identifier: string, limit: number, windowMs: number): { success: boolean, remaining: number, resetAt: Date }`
- Middleware-Wrapper für API-Routes:
  ```typescript
  export function withRateLimit(handler: Handler, options: { limit: number; windowMs: number }) {
    return async (req, ctx) => {
      const ip = req.headers.get("x-forwarded-for") || "unknown";
      const result = rateLimit(`endpoint:${ip}`, options.limit, options.windowMs);
      if (!result.success) {
        return Response.json({ error: "Too many requests" }, {
          status: 429,
          headers: {
            "X-RateLimit-Limit": options.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": Math.ceil((result.resetAt.getTime() - Date.now()) / 1000).toString(),
          },
        });
      }
      return handler(req, ctx);
    };
  }
  ```
- Limits:
  - `/api/auth/login`: 5 / 15 Min / IP
  - `/api/auth/register`: 3 / 60 Min / IP
  - `/api/auth/reset/*`: 3 / 60 Min / IP
  - `/api/checkout`: 3 / 15 Min / IP
  - `/api/cart` (POST): 30 / Min / IP
  - Andere: 60 / Min / IP

**16.4 CSRF-Schutz `src/lib/csrf.ts`**
- SameSite=Strict Cookies geben schon viel Schutz
- Zusätzlich für kritische POST-Routes: Origin/Referer-Check
- Middleware-Helper:
  ```typescript
  export function checkCsrf(req: NextRequest): boolean {
    if (req.method === "GET") return true;
    const origin = req.headers.get("origin") || req.headers.get("referer");
    const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL];
    return allowedOrigins.some(allowed => origin?.startsWith(allowed));
  }
  ```

**16.5 Security-Headers in `next.config.ts`**
```typescript
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://api.resend.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com;" },
];

module.exports = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};
```

**16.6 CORS-Policy**
- Standard: Same-Origin only (keine Cross-Origin Requests)
- Ausnahme: Stripe-Webhook (Stripe sendet von eigenen Servern, kein CORS)
- In `next.config.ts`: `async headers()` mit `Access-Control-Allow-Origin` nur für selbe Origin

**16.7 Middleware `src/middleware.ts` erweitern**
- Security-Header setzen (Alternative zu next.config Headers)
- Auth-Check für `/admin/*` (TASK 04)
- CSRF-Check für POST/PATCH/DELETE auf `/api/*` (außer Stripe-Webhook)
- Rate-Limit-Header für `/api/*`

**16.8 Secrets-Management**
- `.env.local` für Dev (gitignored)
- Vercel Env-Vars für Staging/Prod (über Vercel Dashboard)
- KEINE Secrets jemals im Code oder in Logs
- `AUTH_SECRET` für Session-Signing (64+ chars random)
- Stripe-Keys: Test vs. Live strikt trennen

**16.9 SQL-Injection-Schutz**
- Prisma verwendet parametrisierte Queries (gegeben)
- KEINE Raw-Queries mit User-Input, außer mit `Prisma.sql` Template-Literal
- Falls Raw-Query nötig: Code-Review Pflicht

**16.10 XSS-Schutz**
- React escaped JSX-Variablen automatisch (gegeben)
- KEIN `dangerouslySetInnerHTML` irgendwo
- CSP-Header blockt Inline-Scripts (außer unsafe-inline für Next.js nötig)
- User-Generated Content (Reviews): beim Rendern escapen, Markdown-Renderer mit Sanitizer falls nötig

**16.11 Security-Audit-Checkliste in `docs/SECURITY.md`**
- [ ] Alle API-Routes haben Zod-Validierung
- [ ] Rate-Limiting aktiv auf sensiblen Endpoints
- [ ] CSP-Header gesetzt und getestet (browser devtools)
- [ ] HSTS aktiv (SSL Labs Test A+)
- [ ] Cookies: HttpOnly, Secure, SameSite=Strict
- [ ] Keine Secrets in Code (grep für "sk_live", "sk_test" in commits)
- [ ] Argon2id für Passwort-Hashing
- [ ] Session-Tokens haben 32+ Bytes Entropie
- [ ] Stripe-Webhook verifiziert Signatur
- [ ] CORS restrictiv konfiguriert

#### Akzeptanzkriterien
- [ ] Alle API-Routes validieren Input mit Zod (Code-Review)
- [ ] 6. Login-Versuch in 15 Min → 429 mit `Retry-After` Header
- [ ] CSP-Header in Browser-Devtools sichtbar
- [ ] SSL Labs Test: A+ Rating
- [ ] securityheaders.com: A Rating
- [ ] POST von anderer Origin → 403 Forbidden
- [ ] Keine `sk_live` oder `sk_test` Strings in git history
- [ ] `grep -r "dangerouslySetInnerHTML" src/` returns 0 results
- [ ] `grep -r "any" src/ --include="*.ts" | grep -v "@ts-ignore"` returns acceptable count

#### Dateien erstellt
- `src/lib/validators/{cart,product,order}.ts`
- `src/lib/rate-limit.ts` (erweitert), `src/lib/csrf.ts`
- Update `src/middleware.ts`, `next.config.ts`
- `docs/SECURITY.md`

---

### TASK 17: Rechtliche Seiten (Impressum, AGB, Datenschutz, Widerruf)
**Phase:** 2 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 06

#### Ziel
Vollständige rechtliche Seiten für Deutschland/EU-Betrieb: Impressum (§5 TMG), DSGVO-Datenschutz, AGB, Widerrufsbelehrung + Muster-Widerrufsformular, inkl. Markenrecht-Disclaimer.

#### Subtasks

**17.1 Impressum `src/app/(storefront)/impressum/page.tsx`**
Inhalt (Pflicht nach §5 TMG):
- Vollständiger Name des Betreibers
- Ladungsfähige Anschrift (kein Postfach!)
- Kontaktdaten: E-Mail, Telefon (optional aber empfohlen)
- Registergericht + Registernummer (z.B. HRB 123456 B Berlin)
- Umsatzsteuer-Identifikationsnummer (§27a UStG)
- **VerpackG**: LUCID-Registernummer (z.B. "Registriert bei der Stiftung Zentrale Stelle Verpackungsregister unter der Registriernummer XXXXX")
- Wirtschafts-Identifikationsnummer (W-IdNr, falls vorhanden)
- Verantwortlich für den Inhalt i.S.d. § 18 Abs. 2 MStV
- Streitschlichtung: Hinweis auf EU-OS-Plattform (`https://ec.europa.eu/consumers/odr`)
- Haftungs-ausschluss für externe Links

**17.2 Datenschutz `src/app/(storefront)/datenschutz/page.tsx`**
DSGVO-konforme Datenschutzerklärung mit folgenden Sektionen:
1. Verantwortlicher (Betreiber-Infos)
2. Datenschutzbeauftragter (falls benannt)
3. Allgemeines zur Datenverarbeitung
4. Rechtsgrundlagen (Art. 6 Abs. 1 DSGVO)
5. Daten beim Besuch der Website (Server-Logs, IP, Browser)
6. Cookies (essentielle, optional mit Consent)
7. Kundenkonto (Vorname, Nachname, E-Mail, Adresse, Telefon, Bestellhistorie)
8. Bestellabwicklung (inkl. Stripe, DHL, Resend als AVV-Partner)
9. Zahlungsdienstleister Stripe (Verweis auf deren Datenschutzerklärung)
10. E-Mail-Marketing (nur mit Consent!)
11. Cloudinary (Bild-Hosting, USA, EU-Standardvertragsklauseln)
12. Vercel (Hosting, USA, EU-Standardvertragsklauseln)
13. Supabase/Neon (Datenbank, EU)
14. Web-Analytics (PostHog, falls aktiviert, mit Consent)
15. Ihre Rechte (Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Beschwerde bei Aufsichtsbehörde)
16. DSGVO-konforme Löschfristen
17. SSL-Verschlüsselung
18. Aktualität dieser Erklärung

**17.3 AGB `src/app/(storefront)/agb/page.tsx`**
Inhalt:
1. Geltungsbereich
2. Vertragspartner (SONA Boutique, Betreiber-Infos)
3. Vertragsschluss (Angebot, Annahme, Bestellbestätigung)
4. Eigentumsvorbehalt (Solange nicht vollständig bezahlt, bleibt Ware Eigentum von SONA Boutique)
5. Preise und Versandkosten (inkl. MwSt., zzgl. Versand)
6. Lieferbedingungen (DHL Express, versichert)
7. Zahlungsbedingungen (Stripe, Kreditkarte, Klarna optional)
8. Gewährleistung (gebrauchte Ware: Mängelrechte nach §437 BGB, jedoch eingeschränkt bei gebrauchten Waren)
9. Haftungsausschluss
10. Widerrufsrecht (Verweis auf Widerrufsseite)
11. Streitbeilegung (EU-OS-Plattform)
12. Schlussbestimmungen (anwendbares Recht: deutsches Recht, Gerichtsstand)

**17.4 Widerruf `src/app/(storefront)/widerruf/page.tsx`**
- Gesetzliche Widerrufsbelehrung (Muster nach Art. 246a §1 Abs. 2 EGBGB)
- Widerrufsfrist: 14 Tage ab Erhalt der Ware
- Muster-Widerrufsformular (PDF-Download oder ausfüllbares Web-Form)
- Hinweise zur Rücksendung:
  - Kunde trägt Rücksendekosten (bei SONA Boutique Standardregelung, muss explizit stehen!)
  - Versicherte Rücksendung Pflicht (für Ware >500 €)
  - Bei Beschädigung: Wertersatz möglich
- Rückzahlung: innerhalb 14 Tagen nach Eingang der Ware, via Stripe Refund
- Operationaler Workflow (siehe TASK 17.5)

**17.5 Widerrufs-Workflow `src/lib/refund-workflow.ts`**
```typescript
export async function processCancellation(orderId: string, reason: string) {
  return await db.$transaction(async (tx) => {
    // 1. Order auf CANCELLED setzen
    const order = await tx.order.update({
      where: { id: orderId },
      data: { 
        fulfillmentStatus: "CANCELLED",
        cancelledAt: new Date(),
        refundReason: reason,
      },
    });
    
    // 2. Stripe Refund erstellen (für Admin-Trigger)
    // (wird im Admin-Modal aufgerufen, nicht hier)
    
    // 3. Inventory restaurieren (NACH Qualitätsprüfung!)
    // Hinweis: Inventory wird erst restauriert, wenn Tasche physisch geprüft wurde.
    // Bis dahin bleibt inventoryQuantity = 0 (also "reserviert").
    
    return order;
  });
}

// Separate Funktion für Post-Quality-Check:
export async function restoreInventoryAfterReturn(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Order not found");
  
  await db.$transaction(async (tx) => {
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            inventoryQuantity: { increment: item.quantity },
            status: "PUBLISHED",
          },
        });
      }
    }
  });
}
```

**17.6 Markenrecht-Disclaimer-Komponente `src/components/storefront/BrandDisclaimer.tsx`**
- Wiederverwendbare Komponente
- Text: *"SONA Boutique ist ein unabhängiger Reseller von gebrauchten Luxusartikeln. Es besteht keine Kooperation, Autorisierung oder offizielle Partnerschaft mit den genannten Marken. Alle Markenrechte und geistigen Eigentumsrechte verbleiben uneingeschränkt bei den jeweiligen Markeninhabern."*
- Einbindung: Footer (TASK 06) + jede Product-Detail-Page unten

**17.7 PAngV-Konformität**
- Jeder Preis zeigt: "inkl. 19% MwSt., zzgl. Versand"
- Versandkosten-Seite `/versandkosten` mit Tabelle aller Länder + Kosten
- Bei Second-Hand: Zustand deutlich als "Gebrauchtware" deklariert (auf jeder Product-Page)

**17.8 Cookie-Banner-Komponente `src/components/storefront/CookieBanner.tsx`** (Struktur, Logik in TASK 18)
- Position: Bottom-Bar, fixed
- Inhalt: "Wir verwenden Cookies. Essenzielle (Session, Cart) sind notwendig. Optionale (Analytics, Marketing) nur mit Ihrer Zustimmung."
- Buttons: "Alle akzeptieren", "Nur essenzielle", "Einstellungen" (öffnet Modal mit Detail-Auswahl)
- Speichert Consent in `cookie_consent` Cookie (365 Tage)

**17.9 AVV-Dokumentation `docs/AVV.md`**
Liste aller Auftragsverarbeiter mit:
- Unternehmensname + Anschrift
- Art der Datenverarbeitung
- Kategorien personenbezogener Daten
- AVV-Dokument hinterlegt (ja/nein)
- Stand des AVV

Beispieleintrag:
```
### Vercel Inc.
- Anschrift: 340 S Lemon Ave #4133, Walnut, CA 91789, USA
- Verarbeitung: Hosting der Web-Anwendung, CDN, Server-Logs
- Daten: IP-Adressen, Browser-Informationen, angefragte URLs
- AVV abgeschlossen: [x] am TT.MM.JJJJ
- EU-Standardvertragsklauseln: [x] hinterlegt
```

#### Akzeptanzkriterien
- [ ] Impressum enthält alle §5 TMG Pflichtangaben
- [ ] Datenschutz erwähnt alle Dienstleister (Stripe, Vercel, Supabase, Cloudinary, Resend)
- [ ] AGB enthält Eigentumsvorbehalt, Gewährleistung bei Gebrauchtware
- [ ] Widerrufsbelehrung entspricht gesetzlichem Muster
- [ ] Widerrufsformular als PDF downloadbar oder Web-Form
- [ ] Markenrecht-Disclaimer sichtbar im Footer und auf Product-Pages
- [ ] "inkl. 19% MwSt., zzgl. Versand" bei jedem Preis
- [ ] Versandkostentabelle verfügbar
- [ ] AVV-Dokument existiert für alle Dienstleister
- [ ] IT-Rechtskanzlei (z.B. eRecht24, Händlerbund) hat Texte geprüft (externer Step!)

#### Dateien erstellt
- `src/app/(storefront)/{impressum,datenschutz,agb,widerruf,versandkosten}/page.tsx`
- `src/components/storefront/{BrandDisclaimer,CookieBanner}.tsx`
- `src/lib/refund-workflow.ts`
- `docs/AVV.md`

---

### TASK 18: Cookie-Banner & Consent-Management
**Phase:** 2 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 17

#### Ziel
DSGVO-konformes Consent-Management für nicht-essentielle Cookies (Analytics, Marketing) mit granularer Auswahl und dokumentierter Einwilligung.

#### Subtasks

**18.1 Consent-Storage**
- Cookie `cookie_consent` (365 Tage TTL)
- Inhalt: JSON `{ essential: true, analytics: false, marketing: false, timestamp: "2026-..." }`
- HttpOnly=false (muss client-seitig lesbar sein für JS-Checks)

**18.2 Consent-Helper `src/lib/consent.ts`**
```typescript
export type Consent = {
  essential: true;  // immer true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function getConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.match(/cookie_consent=([^;]+)/)?.[1];
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

export function setConsent(consent: Omit<Consent, "essential" | "timestamp">) {
  const full: Consent = {
    essential: true,
    ...consent,
    timestamp: new Date().toISOString(),
  };
  document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify(full))}; max-age=${365*86400}; path=/; SameSite=Strict`;
  window.dispatchEvent(new Event("consent-updated"));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}
```

**18.3 Cookie-Banner-UI `src/components/storefront/CookieBanner.tsx`**
- Erscheint beim ersten Besuch (wenn kein Consent-Cookie)
- Position: Bottom-Bar, fixed, dezentes Creme-Background
- Inhalt:
  - Headline: "Wir respektieren Ihre Privatsphäre"
  - Body: "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Essenzielle Cookies sind für den Betrieb notwendig. Optionale Cookies (Analytics) helfen uns, den Shop zu optimieren."
  - Buttons:
    - "Alle akzeptieren" (gold)
    - "Nur essenzielle" (outline)
    - "Einstellungen" (text-link, öffnet Modal)
- Modal mit Details:
  - Toggle: "Essenziell" (disabled, immer an)
  - Toggle: "Analytics (PostHog)"
  - Toggle: "Marketing (Facebook Pixel, optional später)"
  - "Auswahl speichern" Button

**18.4 PostHog-Loading an Consent koppeln**
- PostHog-Script nur laden, wenn `hasAnalyticsConsent() === true`
- In `src/app/layout.tsx`: PostHog-Provider conditional rendern
- Bei Consent-Change (Event "consent-updated"): Page-Reload oder dynamisches Nachladen

**18.5 Consent-Logging in DB (optional, für Audit)**
- Neue Tabelle `ConsentLog`: id, customerId?, ipHash, consent, timestamp
- Bei jeder Consent-Änderung: Log-Eintrag erstellen
- IP nur als Hash speichern (DSGVO)

#### Akzeptanzkriterien
- [ ] Cookie-Banner erscheint beim ersten Besuch
- [ ] "Alle akzeptieren" setzt alle Toggles auf true
- [ ] "Nur essenzielle" setzt analytics/marketing auf false
- [ ] "Einstellungen" öffnet Modal mit Toggles
- [ ] Auswahl wird in `cookie_consent` Cookie gespeichert (365 Tage)
- [ ] PostHog lädt NUR wenn Analytics-Consent = true
- [ ] Bei Consent-Change: Page neu geladen oder Analytics nachgeladen
- [ ] Banner erscheint nicht erneut nach Consent (Cookie check)

#### Dateien erstellt
- `src/lib/consent.ts`, `src/components/storefront/CookieBanner.tsx`
- Update `src/app/layout.tsx` (conditional PostHog)
- Optional: `prisma/schema.prisma` (ConsentLog Model), Migration

---

### TASK 19: EU-OSS Steuerlogik
**Phase:** 2 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 10

#### Ziel
Dynamische MwSt.-Berechnung basierend auf Lieferland, mit Support für EU-OSS-Verfahren (Versteuerung im Bestimmungsland ab 10.000 € grenzüberschreitendem Jahresumsatz).

#### Subtasks

**19.1 Steuer-Konfiguration `src/lib/tax.ts`**
```typescript
export const TAX_RATES: Record<string, { rate: number; name: string }> = {
  DE: { rate: 0.19, name: "Deutschland (19%)" },
  AT: { rate: 0.20, name: "Österreich (20%)" },
  FR: { rate: 0.20, name: "Frankreich (20%)" },
  IT: { rate: 0.22, name: "Italien (22%)" },
  NL: { rate: 0.21, name: "Niederlande (21%)" },
  CH: { rate: 0.00, name: "Schweiz (MwSt. wird beim Import erhoben)" },
};

export function getTaxRate(countryCode: string): number {
  return TAX_RATES[countryCode]?.rate ?? 0.19; // Default DE
}

export function isEUCountry(countryCode: string): boolean {
  return countryCode in TAX_RATES && countryCode !== "CH";
}
```

**19.2 Cart-Berechnung umstellen**
- In `recomputeCart(cartId)`: Steuer basierend auf `cart.shippingCountry` berechnen
- Cart benötigt neues Feld `shippingCountry` (Default "DE")
- Bei Checkout: Land aus Form übernehmen, Cart aktualisieren, neu berechnen

**19.3 Checkout-Anpassung**
- Country-Select zeigt alle 6 Länder
- Bei Landwechsel: Cart neu berechnen (API-Call)
- Steuer wird in Summary live aktualisiert
- Für CH: Hinweis "MwSt. wird beim Import durch Zoll erhoben"

**19.4 Order mit Tax-Rate speichern**
- `Order.taxRate` (Float, z.B. 0.20) — bereits im Schema
- Bei Order-Erstellung: Aktuelle Tax-Rate als Snapshot speichern

**19.5 OSS-Reporting `src/lib/oss-report.ts`**
- Funktion: `getOSSReport(year, quarter): OSSReport`
- Aggregiert Orders mit `shippingCountry != DE` und `paymentStatus = PAID` im Zeitraum
- Gruppiert nach Land: `{ country, totalCents, taxCents, orderCount }`
- Export als CSV für Steuerberater
- Admin-View unter `/admin/reports/oss` (Phase 3)

**19.6 Kleinunternehmer-Regelung prüfen**
- Falls SONA Boutique Kleinunternehmer (§19 UStG): KEINE MwSt. ausweisen!
- In dem Fall: Hinweis "Gemäß §19 UStG wird kein Umsatzsteuer ausgewiesen"
- Konfigurierbar via `NEXT_PUBLIC_SMALL_BUSINESS = true/false`

#### Akzeptanzkriterien
- [ ] Bei Lieferland DE: 19% MwSt. berechnet
- [ ] Bei Lieferland AT: 20% MwSt. berechnet
- [ ] Bei Lieferland IT: 22% MwSt. berechnet
- [ ] Bei Lieferland CH: 0% MwSt., Hinweis sichtbar
- [ ] Steuer wird in Cart-Summary live bei Landwechsel aktualisiert
- [ ] Order speichert angewendete Tax-Rate als Snapshot
- [ ] OSS-Report exportiert CSV mit Quartalsdaten
- [ ] Kleinunternehmer-Modus zeigt korrekten Hinweis

#### Dateien erstellt
- `src/lib/tax.ts`, `src/lib/oss-report.ts`
- Update `src/lib/cart.ts`, `src/app/(storefront)/checkout/page.tsx`
- Optional: `src/app/admin/reports/oss/page.tsx` (Stub für Phase 3)

---

### TASK 20: Multi-Channel-Inventory-Locking
**Phase:** 2 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 09, TASK 10

#### Ziel
Schutz vor Doppelverkäufen, wenn Unikate parallel auf Drittplattformen (Vestiaire Collective, eBay, etc.) angeboten werden. Inventory-Locking während Checkout mit automatischem Release nach 15 Minuten.

#### Subtasks

**20.1 Locking-Logik in `src/lib/inventory-lock.ts`**
```typescript
const LOCK_DURATION_MIN = 15;

export async function lockProduct(productId: string, lockerId: string): Promise<boolean> {
  const now = new Date();
  return await db.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) return false;
    if (product.inventoryQuantity === 0) return false;
    
    // Prüfe, ob bereits aktiv gelockt
    if (product.lockedUntil && product.lockedUntil > now) {
      // Lock gehört diesem Locker? → renew
      if (product.lockedBy === lockerId) {
        await tx.product.update({
          where: { id: productId },
          data: {
            lockedUntil: new Date(now.getTime() + LOCK_DURATION_MIN * 60 * 1000),
          },
        });
        return true;
      }
      return false; // von jemand anderem gelockt
    }
    
    // Lock setzen
    await tx.product.update({
      where: { id: productId },
      data: {
        lockedUntil: new Date(now.getTime() + LOCK_DURATION_MIN * 60 * 1000),
        lockedBy: lockerId,
      },
    });
    return true;
  });
}

export async function unlockProduct(productId: string, lockerId: string): Promise<void> {
  await db.product.updateMany({
    where: { id: productId, lockedBy: lockerId },
    data: { lockedUntil: null, lockedBy: null },
  });
}

export async function isProductAvailable(productId: string): Promise<boolean> {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return false;
  if (product.inventoryQuantity === 0) return false;
  if (product.lockedUntil && product.lockedUntil > new Date()) return false;
  return true;
}

// Cronjob-Funktion: Bereinige abgelaufene Locks
export async function cleanupExpiredLocks(): Promise<number> {
  const result = await db.product.updateMany({
    where: { 
      lockedUntil: { lt: new Date() },
      NOT: { lockedUntil: null },
    },
    data: { lockedUntil: null, lockedBy: null },
  });
  return result.count;
}
```

**20.2 Lock bei Checkout-Start**
- In `/api/checkout` (GET-Request von Checkout-Page):
  - Alle Cart-Items locken (lockerId = Cart-ID)
  - Falls Lock für ein Item fehlschlägt: Fehler "Artikel [X] wurde gerade reserviert"
- Bei erfolgreicher Zahlung: Locks werden durch Inventory-Decrement automatisch aufgehoben
- Bei Abbruch (Cancel-URL): Locks manuell freigeben

**20.3 Vercel Cron für Cleanup**
- `vercel.json`:
  ```json
  {
    "crons": [
      { "path": "/api/cron/cleanup-locks", "schedule": "*/5 * * * *" }
    ]
  }
  ```
- `src/app/api/cron/cleanup-locks/route.ts`:
  - Authorization via `CRON_SECRET` Header
  - Ruft `cleanupExpiredLocks()` auf
  - Return: `{ cleaned: count }`

**20.4 Admin-Warnung bei Multi-Channel-Verkauf**
- Neue Admin-API: `POST /api/admin/products/[id]/mark-sold-external`
- Setzt `inventoryQuantity = 0` und `status = ARCHIVED`
- Loggt Event: "Manuell als extern verkauft markiert"

**20.5 Drittplattform-Sync (optional, später)**
- Für eBay: eBay Merchant API Integration (komplex, evtl. Phase 5)
- Für Vestiaire: Keine öffentliche API → manuelle Warnung an Admin per E-Mail

#### Akzeptanzkriterien
- [ ] Beim Aufruf von `/checkout` werden alle Cart-Items für 15 Min gelockt
- [ ] Andere User sehen gelockte Items als "Reserviert" (nicht "In den Warenkorb")
- [ ] Nach 15 Min ohne Zahlung: Lock wird durch Cron freigegeben
- [ ] Vercel Cron läuft alle 5 Min und cleanups abgelaufene Locks
- [ ] Bei erfolgreicher Zahlung: Inventory dekrementiert, Lock verschwindet
- [ ] Bei Checkout-Abbruch: Locks sofort freigeben (Cancel-Callback)
- [ ] Race-Condition-Test: 2 User versuchen gleichzeitig zu checkout → nur einer successful

#### Dateien erstellt
- `src/lib/inventory-lock.ts`
- Update `src/app/api/checkout/route.ts`, `src/app/(storefront)/checkout/page.tsx`
- `src/app/api/cron/cleanup-locks/route.ts`
- `vercel.json`
- `src/app/api/admin/products/[id]/mark-sold-external/route.ts`

---

### TASK 20B: Ankaufs- & Konsignations-Flow ("Verkaufen")
**Phase:** 2 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 02, TASK 04, TASK 11

#### Ziel
Das Geschäftsmodell (siehe 0.2: "Konsignation + Eigenankauf") technisch abbilden: Ein öffentliches "Verkaufen"-Formular, über das Kunden ihre Luxustaschen zum Ankauf oder zur Kommission einreichen können, plus ein Admin-Workflow zur Prüfung, Angebotserstellung und späteren Umwandlung in ein Product. Ohne diesen Flow bleibt die zweite Säule des Geschäftsmodells (Konsignation) rein theoretisch.

#### Subtasks

**20B.1 Public "Verkaufen"-Seite `src/app/(storefront)/verkaufen/page.tsx`**
- Editorial-Hero: "Verkaufen Sie Ihre Luxushandtasche" mit Ken-Burns-Bild (siehe TASK 05B)
- Erklärung der 2 Optionen: **Sofortankauf** (schnelle Auszahlung, geringerer Preis) vs. **Kommission** (höherer Erlös, Auszahlung nach Verkauf, Kommissionssatz i.d.R. 25–40%)
- Vierstufiger Prozess visualisiert (RevealOnScroll, gestaffelt): 1) Formular ausfüllen 2) Angebot erhalten 3) Versand/Abholung 4) Auszahlung
- Formular (React Hook Form + Zod):
  - Marke, Modell, geschätzter Zustand (Condition-Enum), Beschreibung
  - Foto-Upload (min. 3, max. 10 Bilder — Client-seitiger Upload zu Cloudinary via Signed-URL, siehe TASK 21)
  - Gewünschte Verkaufsart: Sofortankauf / Kommission / "Lassen Sie mich beraten"
  - Kontaktdaten (Name, E-Mail, Telefon)
- Submit → `POST /api/consignment-requests`

**20B.2 Zod-Validator `src/lib/validators/consignment.ts`**
```typescript
export const consignmentRequestSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
  brandName: z.string().min(1).max(100),
  modelName: z.string().min(1).max(150),
  estimatedCondition: z.enum(["PRISTINE", "EXCELLENT", "VERY_GOOD", "GOOD"]),
  description: z.string().min(20).max(2000),
  photos: z.array(z.string().url()).min(3).max(10),
  desiredType: z.enum(["SALE", "CONSIGNMENT", "UNDECIDED"]).optional(),
});
```

**20B.3 API: `POST /api/consignment-requests`**
- Rate-Limited (5 / 60 Min / IP, gegen Spam)
- Validierung mit Zod
- Erstellt/findet `Consignor` (per E-Mail, verknüpft mit `customerId` falls eingeloggt)
- Erstellt `ConsignmentRequest` mit Status `SUBMITTED`
- Sendet Bestätigungs-E-Mail an Kunden ("Wir prüfen Ihre Anfrage binnen 48h")
- Sendet interne Benachrichtigung an Admin (E-Mail oder Sentry-Info-Log)
- Return: `{ requestId }`

**20B.4 Admin-Übersicht `src/app/admin/consignments/page.tsx`**
- Tabelle: Consignor-Name, Marke/Modell, Status, eingereicht am, Aktionen
- Filter nach Status (SUBMITTED, UNDER_REVIEW, OFFER_MADE, etc.)
- Klick öffnet Detail-Ansicht

**20B.5 Admin-Detail & Angebots-Workflow `src/app/admin/consignments/[id]/page.tsx`**
- Zeigt alle eingereichten Fotos, Beschreibung, Kontaktdaten
- Status-Wechsel-Buttons entlang des Workflows (SUBMITTED → UNDER_REVIEW → OFFER_MADE → ACCEPTED/REJECTED → ITEM_RECEIVED → LISTED → SOLD)
- Bei "Angebot erstellen": Modal mit Eingabe `offeredPriceCents` (Sofortankauf) ODER `commissionRate` (Kommission)
- Bei Angebots-Versand: E-Mail an Kunden mit Angebot (Annahme-Link, 7 Tage gültig)
- Bei "Als erhalten markieren" (`ITEM_RECEIVED`): `receivedAt` setzen
- Bei "In Produkt umwandeln": Erstellt automatisch einen Product-Draft mit `sourceType = CONSIGNMENT` bzw. `OWNED`, übernimmt Brand/Modell/Fotos/Condition aus der Anfrage, verknüpft `consignorId` bzw. lässt Admin die restlichen Luxus-Attribute (Material, Hardware, Maße, Preis) ergänzen bevor Publish
- Bei "Verkauft" (nach Order-Abschluss eines Konsignations-Produkts): `consignorPayoutCents` berechnen (`resalePriceCents * (1 - commissionRate)`), Status `SOLD`, `soldAt` setzen

**20B.6 API-Routen (Admin, alle `requireAdmin`)**
- `GET /api/admin/consignment-requests`: Liste mit Filter/Pagination
- `PATCH /api/admin/consignment-requests/[id]`: Status-Update, Angebots-Felder, adminNotes
- `POST /api/admin/consignment-requests/[id]/convert-to-product`: Erstellt Product-Draft aus Anfrage
- `POST /api/admin/consignment-requests/[id]/send-offer`: Löst Angebots-E-Mail aus

**20B.7 Consignor-Auszahlungs-Tracking**
- Einfaches Admin-Feld `finalPayoutCents` in `ConsignmentRequest` (manuelle Banküberweisung in Phase 1–3, kein automatisierter Payout-Prozess — das würde ein separates KYC/Payout-System wie Stripe Connect erfordern, was explizit **außerhalb des Scopes** dieses Plans liegt und als Empfehlung in Appendix H vermerkt ist)
- IBAN wird verschlüsselt gespeichert (`ibanEncrypted`, AES-256, Key aus `AUTH_SECRET`-Derivat oder separatem `IBAN_ENCRYPTION_KEY`) — niemals im Klartext in DB oder Logs

**20B.8 E-Mail-Templates ergänzen**
- `src/emails/consignment-received.tsx`: Eingangsbestätigung
- `src/emails/consignment-offer.tsx`: Angebot mit Annahme-Button (Link zu `/verkaufen/angebot/[requestId]`)
- Öffentliche Angebots-Annahme-Seite `src/app/(storefront)/verkaufen/angebot/[requestId]/page.tsx`: Kunde sieht Angebot, kann annehmen/ablehnen (Token-basiert, kein Login nötig)

#### Akzeptanzkriterien
- [ ] `/verkaufen` zeigt Formular mit Foto-Upload (min. 3 Bilder erzwungen)
- [ ] Submit erstellt `Consignor` + `ConsignmentRequest`, sendet Bestätigungs-E-Mail
- [ ] Admin sieht alle Anfragen in `/admin/consignments`, kann Status ändern
- [ ] Admin kann Angebot erstellen (Sofortankauf ODER Kommission) und per E-Mail versenden
- [ ] Kunde kann Angebot über öffentlichen Link annehmen/ablehnen ohne Login
- [ ] "In Produkt umwandeln" erstellt korrekten Product-Draft mit `sourceType` und `consignorId`
- [ ] Nach Verkauf eines Konsignations-Produkts wird `consignorPayoutCents` korrekt berechnet
- [ ] IBAN wird ausschließlich verschlüsselt gespeichert, nie im Klartext geloggt

#### Dateien erstellt
- `src/app/(storefront)/verkaufen/{page,angebot/[requestId]/page}.tsx`
- `src/app/admin/consignments/{page,[id]/page}.tsx`
- `src/app/api/consignment-requests/route.ts`
- `src/app/api/admin/consignment-requests/{route,[id]/route,[id]/convert-to-product/route,[id]/send-offer/route}.ts`
- `src/lib/validators/consignment.ts`
- `src/emails/{consignment-received,consignment-offer}.tsx`

---

## PHASE 3: MEDIEN, SEO, OPERATIONS & FEATURES (12 Personentage)

**Ziel:** Cloud-Bild-Management, SEO-Optimierung (ISR, JSON-LD, Sitemap), Promo-Code-System, erweiterte Admin-Features (Fulfillment, Tracking), Monitoring (Sentry, PostHog), Volltextsuche (Meilisearch), Watchlist und PDF-Echtheitszertifikate.

---

### TASK 21: Cloud-Bild-Management (Cloudinary)
**Phase:** 3 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 11

#### Ziel
Professionelles Bild-Management mit Cloudinary-Integration, Upload-Pipeline im Admin-Bereich, automatische Optimierung (WebP/AVIF) und Next.js Image-Integration.

#### Subtasks

**21.1 Cloudinary-Setup**
```bash
bun add cloudinary next-cloudinary
```

**21.2 Cloudinary-Client `src/lib/cloudinary.ts`**
```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

// Helper: Upload-Signature für Client-Uploads generieren
export async function generateUploadSignature(folder: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}
```

**21.3 Admin-API: `POST /api/admin/products/[id]/images`**
- requireAdmin
- Accepts multipart/form-data
- Upload via Cloudinary-Upload-Stream
- Folder: `sona-boutique/products/{productId}`
- Bild optimiert: `quality: "auto"`, `fetch_format: "auto"`
- In DB: `ProductImage` erstellen mit URL, altText, position
- Return: erstelltes ProductImage

**21.4 Admin-API: `DELETE /api/admin/products/[id]/images/[imageId]`**
- requireAdmin
- Aus Cloudinary löschen (via public_id)
- Aus DB löschen
- Andere Bilder neu positionieren (sequential 0,1,2...)

**21.5 Admin-API: `PATCH /api/admin/products/[id]/images/reorder`**
- Body: `{ imageIds: string[] }` (in neuer Reihenfolge)
- Position-Felder aktualisieren
- Erstes Bild wird `isPrimary: true`

**21.6 Upload-Komponente `src/components/admin/ImageUploader.tsx`**
- Drag-and-Drop-Bereich
- Multi-File-Upload (max 10 gleichzeitig)
- Preview vor Upload
- Progress-Bar pro Datei
- Fehler-Behandlung (Größe, Format)
- Akzeptierte Formate: JPG, PNG, WebP
- Max. Größe: 10 MB pro Bild
- Min. Auflösung: 1000x1000 px (Warnung)
- Nach Upload: Liste aller Bilder mit Reorder (Drag-and-Drop)
- ALT-Text-Eingabe pro Bild

**21.7 Next.js Image-Konfiguration**
- In `next.config.ts`: `remotePatterns` für Cloudinary hinzufügen
```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "res.cloudinary.com" },
  ],
  formats: ["image/avif", "image/webp"],
}
```

**21.8 ShimmerImage-Komponente erweitern**
- Verwendung von `next/image` statt `<img>`
- Cloudinary-URL mit Transformations-Parametern
- Für Thumbnails: `w_400,h_400,c_fill,q_auto,f_auto`
- Für Galerie-Hauptbild: `w_1200,h_1200,c_fill,q_auto,f_auto`
- Lazy-Loading standardmäßig

#### Akzeptanzkriterien
- [ ] Admin kann Bilder via Drag-and-Drop hochladen
- [ ] Upload zeigt Progress-Bar
- [ ] Bilder erscheinen in Cloudinary-Mediathek unter `sona-boutique/products/`
- [ ] Bilder werden in DB als ProductImage gespeichert
- [ ] Reorder via Drag-and-Drop funktioniert
- [ ] ALT-Texte speichern und anzeigen
- [ ] Bilder werden als AVIF/WebP ausgeliefert (Network-Tab check)
- [ ] Bilder sind responsive (verschiedene Sizes je nach Viewport)
- [ ] LCP auf Product-Page < 2s mit Cloudinary-Bildern
- [ ] Delete entfernt Bild aus Cloudinary UND DB

#### Dateien erstellt
- `src/lib/cloudinary.ts`
- `src/app/api/admin/products/[id]/images/route.ts`
- `src/app/api/admin/products/[id]/images/[imageId]/route.ts`
- `src/app/api/admin/products/[id]/images/reorder/route.ts`
- `src/components/admin/ImageUploader.tsx`
- Update `next.config.ts`, `src/components/luxury/ShimmerImage.tsx`

---

### TASK 22: SEO-Optimierung (ISR, JSON-LD, Sitemap)
**Phase:** 3 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 07, TASK 08

#### Ziel
Maximale SEO-Sichtbarkeit: ISR für Product-Pages, strukturierte Daten (Schema.org Product), dynamische Sitemap.xml, robots.txt, OpenGraph/Twitter-Cards.

#### Subtasks

**22.1 ISR für Product-Pages**
- In `src/app/(storefront)/product/[slug]/page.tsx`:
  ```typescript
  export const revalidate = 60; // Revalidate alle 60 Sek
  
  export async function generateStaticParams() {
    const products = await db.product.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });
    return products.map(p => ({ slug: p.slug }));
  }
  ```
- On-Demand Revalidation bei Produkt-Update:
  - In `PATCH /api/admin/products/[id]`: `revalidatePath("/product/" + product.slug)`
  - Bei Status-Wechsel (PUBLISHED/ARCHIVED): `revalidatePath("/catalog")`

**22.2 Generate Metadata `src/app/(storefront)/product/[slug]/page.tsx`**
```typescript
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { brand: true, images: { where: { isPrimary: true } } },
  });
  
  if (!product) {
    return { title: "Produkt nicht gefunden | SONA Boutique" };
  }
  
  const title = `${product.title} | SONA Boutique`;
  const description = product.description.slice(0, 160);
  const image = product.images[0]?.url;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 1200 }] : undefined,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/product/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
    alternates: {
      canonical: `/product/${slug}`,
    },
  };
}
```

**22.3 JSON-LD Structured Data**
- In Product-Page eine `<script type="application/ld+json">` einfügen
- Schema.org Product mit:
  - `name`, `description`, `image[]`
  - `brand: { "@type": "Brand", "name": "..." }`
  - `offers: { "@type": "Offer", "price": "...", "priceCurrency": "EUR", "availability": "InStock" | "OutOfStock", "itemCondition": "UsedCondition" }`
  - `aggregateRating` falls Reviews vorhanden
- TypeScript-Typen via `schema-dts` (optional)

**22.4 Dynamische Sitemap `src/app/sitemap.ts`**
```typescript
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  
  // Statische Seiten
  const staticPages = [
    { url: "/", changeFrequency: "daily", priority: 1.0 },
    { url: "/catalog", changeFrequency: "daily", priority: 0.9 },
    { url: "/impressum", changeFrequency: "yearly", priority: 0.3 },
    { url: "/datenschutz", changeFrequency: "yearly", priority: 0.3 },
    { url: "/agb", changeFrequency: "yearly", priority: 0.3 },
    { url: "/widerruf", changeFrequency: "yearly", priority: 0.3 },
  ];
  
  // Produkte
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  const productPages = products.map(p => ({
    url: `/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  
  // Brands
  const brands = await db.brand.findMany({ select: { slug: true } });
  const brandPages = brands.map(b => ({
    url: `/catalog?brand=${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  
  return [...staticPages, ...productPages, ...brandPages].map(p => ({
    ...p,
    url: `${baseUrl}${p.url}`,
  }));
}
```

**22.5 Dynamische robots.txt `src/app/robots.ts`**
```typescript
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/cart", "/checkout", "/account"],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
    host: process.env.NEXT_PUBLIC_APP_URL,
  };
}
```

**22.6 Statische Seiten SSG**
- Impressum, Datenschutz, AGB, Widerruf: komplett statisch generiert
- In Page-Files: `export const dynamic = "force-static"`

**22.7 Canonical URLs**
- Auf jeder Page: `<link rel="canonical" href="...">` via `alternates.canonical` in Metadata
- Verhindert Duplicate Content (z.B. `/product/birkin` vs `/product/birkin?ref=catalog`)

**22.8 Breadcrumbs (Schema.org)**
- Auf Product-Page: JSON-LD BreadcrumbList
- Home > Catalog > Brand > Product

**22.9 Performance-Budget**
- In `next.config.ts`:
  ```typescript
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  }
  ```
- Code-Splitting für schwere Komponenten (Stripe, Cloudinary)
- Preload kritischer Fonts

#### Akzeptanzkriterien
- [ ] Product-Pages sind ISR (revalidate alle 60s)
- [ ] `generateStaticParams` pre-generiert alle Products beim Build
- [ ] JSON-LD validierbar via `https://search.google.com/test/rich-results`
- [ ] Sitemap.xml erreichbar unter `/sitemap.xml`
- [ ] Sitemap enthält alle PUBLISHED-Produkte
- [ ] robots.txt erlaubt Crawling von Product-Pages
- [ ] robots.txt blockiert `/admin/`, `/api/`, `/checkout`
- [ ] OpenGraph-Image wird beim Teilen auf Social Media angezeigt
- [ ] Canonical-Tag auf jeder Page
- [ ] Lighthouse SEO Score >95
- [ ] LCP auf Product-Page <2.5s

#### Dateien erstellt
- `src/app/sitemap.ts`, `src/app/robots.ts`
- Update `src/app/(storefront)/product/[slug]/page.tsx`
- Update `src/app/api/admin/products/[id]/route.ts` (revalidatePath)

---

### TASK 23: Promo-Code-System (Frontend + Admin)
**Phase:** 3 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 09, TASK 11

#### Ziel
Vollständiges Promo-Code-System mit Frontend-Integration im Checkout, Admin-Verwaltungsoberfläche und erweiterten Validierungsregeln (per-customer-limit, time-window).

#### Subtasks

**23.1 Promo-Code-Validator erweitern `src/lib/promo.ts`**
```typescript
export async function validatePromoCode(
  code: string,
  cartSubtotalCents: number,
  customerId?: string
): Promise<{ valid: boolean; promo?: PromoCode; error?: string }> {
  const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  
  if (!promo) return { valid: false, error: "Code nicht gefunden" };
  if (!promo.isActive) return { valid: false, error: "Code nicht mehr aktiv" };
  
  const now = new Date();
  if (promo.startsAt && promo.startsAt > now) return { valid: false, error: "Code noch nicht gültig" };
  if (promo.endsAt && promo.endsAt < now) return { valid: false, error: "Code abgelaufen" };
  
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) {
    return { valid: false, error: "Code vollständig eingelöst" };
  }
  
  if (cartSubtotalCents < promo.minOrderCents) {
    return { valid: false, error: `Mindestbestellwert ${(promo.minOrderCents/100).toFixed(2)} € nicht erreicht` };
  }
  
  // Per-Customer-Limit prüfen
  if (promo.perCustomerLimit && customerId) {
    const customerUsage = await db.order.count({
      where: { customerId, promoCode: code.toUpperCase(), paymentStatus: "PAID" },
    });
    if (customerUsage >= promo.perCustomerLimit) {
      return { valid: false, error: "Code wurde bereits von Ihnen verwendet" };
    }
  }
  
  return { valid: true, promo };
}

export function calculateDiscount(promo: PromoCode, subtotalCents: number): number {
  if (promo.type === "PERCENTAGE") {
    return Math.floor(subtotalCents * promo.value / 100);
  }
  return Math.min(promo.value, subtotalCents);
}
```

**23.2 Admin-Promo-Code-PAGE `src/app/admin/promo-codes/page.tsx`**
- Tabelle aller Promo-Codes: Code, Description, Type, Value, MinOrder, Usage (count/limit), Active, Aktionen
- "Neuer Promo-Code" Button → Modal mit Form
- Edit-Modal
- Toggle isActive
- Statistik: Wie oft eingelöst, Umsatz generiert

**23.3 Admin-API-Routen**
- `POST /api/admin/promo-codes`: Create
- `PATCH /api/admin/promo-codes/[id]`: Update
- `DELETE /api/admin/promo-codes/[id]`: Soft-Delete (isActive=false)
- `GET /api/admin/promo-codes/[id]/usage`: Usage-Statistik

**23.4 Frontend-Integration im Checkout**
- Promo-Code-Eingabefeld in Cart-Page und Checkout-Summary
- Live-Validierung beim Tippen (debounced)
- Bei Apply: API-Call, Cart aktualisieren
- Success-Toast: "Code eingelöst: -X €"
- Error-Toast: Spezifische Fehlermeldung
- Bei aktivem Promo: Badge mit Code + Remove-Button

#### Akzeptanzkriterien
- [ ] Admin kann Promo-Code erstellen (percentage oder fixed)
- [ ] Promo-Code validiert: aktiv, Zeitraum, Mindestbestellwert, Usage-Limit, Per-Customer-Limit
- [ ] Per-Customer-Limit: Kunde kann Code nur N-mal nutzen
- [ ] Frontend zeigt Promo-Code-Eingabe in Cart und Checkout
- [ ] Apply aktualisiert Cart-Summary live
- [ ] Remove funktioniert
- [ ] Fehlermeldungen sind spezifisch und verständlich
- [ ] Usage-Statistik in Admin sichtbar

#### Dateien erstellt
- `src/lib/promo.ts`
- `src/app/admin/promo-codes/page.tsx`
- `src/app/api/admin/promo-codes/{route,[id]/route,[id]/usage/route}.ts`
- Update `src/app/(storefront)/cart/page.tsx`, `src/app/(storefront)/checkout/page.tsx`

---

### TASK 24: Admin-Fulfillment & Tracking
**Phase:** 3 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 11, TASK 15

#### Ziel
Erweiterte Admin-Features für Fulfillment: Sendungsnummern-Erfassung, Carrier-Auswahl, automatische E-Mail an Kunde, DHL-Sendungsverfolgungs-Links.

#### Subtasks

**24.1 Fulfillment-Modal im Admin**
- In Order-Detail: Button "Als versendet markieren" öffnet Modal
- Modal-Felder:
  - Carrier (Select: DHL Express, UPS, FedEx, DPD, Hermann)
  - Tracking-Nummer (Input mit Pattern-Validation)
  - Versanddatum (Default: heute)
  - Notiz an Kunde (optional, textarea)
- Submit: PATCH `/api/admin/orders/[id]` mit `{ fulfillmentStatus: "SHIPPED", carrier, trackingNo, note }`

**24.2 Admin-API erweitern**
- `PATCH /api/admin/orders/[id]` um `note` Field erweitern
- Bei SHIPPED: 
  - `Order.shippedAt` setzen
  - `Shipment`-Eintrag erstellen mit carrier, trackingNo, shippedAt
  - E-Mail `shipping-update.tsx` an Customer senden
  - Tracking-URL generieren je nach Carrier:
    - DHL: `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc={tracking}`
    - UPS: `https://www.ups.com/track?tracknum={tracking}`
    - FedEx: `https://www.fedex.com/fedextrack/?trknbr={tracking}`

**24.3 "Als zugestellt markieren"**
- Button im Admin bei Orders mit `fulfillmentStatus = SHIPPED`
- Setzt `deliveredAt` und aktualisiert `Shipment.deliveredAt`
- Optional: E-Mail an Kunde mit Feedback-Request

**24.4 Order-Timeline-View**
- In Admin-Order-Detail: vertikale Timeline mit allen Events:
  - Bestelleingang (placedAt)
  - Zahlung erhalten (paidAt)
  - Versendet (shippedAt, mit Carrier + Tracking)
  - Zugestellt (deliveredAt)
  - Storniert (cancelledAt, falls zutreffend)
- Jeder Eintrag mit Datum/Uhrzeit

**24.5 Tracking-URL im Kundenkonto**
- In Order-Detail (Kunden-Sicht): Link zur Sendungsverfolgung öffnet sich in neuem Tab

#### Akzeptanzkriterien
- [ ] Admin kann Carrier + Tracking-Nummer erfassen
- [ ] Bei "Als versendet": E-Mail wird an Kunde versendet
- [ ] E-Mail enthält korrekten Tracking-Link je nach Carrier
- [ ] Timeline zeigt alle Order-Events chronologisch
- [ ] Kunde sieht Tracking-Link in seinem Order-Detail
- [ ] "Als zugestellt markieren" setzt deliveredAt

#### Dateien erstellt
- Update `src/app/admin/orders/[id]/page.tsx`, `src/components/admin/OrderTimeline.tsx`
- Update `src/app/api/admin/orders/[id]/route.ts`
- Update `src/app/(storefront)/order/[id]/page.tsx`

---

### TASK 25: Error-Tracking (Sentry)
**Phase:** 3 · **Aufwand:** 0.5 PT · **Abhängigkeiten:** TASK 01

#### Ziel
Real-time Error-Tracking für Client und Server mit Sentry, inklusive Source-Maps und Alerting.

#### Subtasks

**25.1 Sentry-Setup**
```bash
bun add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**25.2 Sentry-Konfiguration**
- `sentry.client.config.ts`: Client-Error-Tracking
- `sentry.server.config.ts`: Server-Error-Tracking
- `sentry.edge.config.ts`: Edge-Function-Tracking
- In `next.config.ts`: SentryWebpackPlugin einbinden (Source-Maps upload)

**25.3 Environment-Variablen**
```bash
SENTRY_DSN=https://...@sentry.io/...
SENTRY_ORG=sona-boutique
SENTRY_PROJECT=sona-boutique-nextjs
SENTRY_AUTH_TOKEN=...  # Für Source-Map-Upload
NEXT_PUBLIC_SENTRY_DSN=$SENTRY_DSN
```

**25.4 Custom Error Boundaries**
- `src/app/global-error.tsx` für Root-Errors
- `src/app/error.tsx` für Route-Errors
- Beide senden Errors an Sentry und zeigen nutzerfreundliche Fehlerseite

**25.5 Alerting konfigurieren**
- In Sentry-Dashboard:
  - Alert bei neuen Fehlern (Email + Slack)
  - Alert bei Performance-Regressionen (LCP >3s)
  - Alert bei häufigen 500er Fehlern
  - Alert bei fehlgeschlagenen Stripe-Webhooks

**25.6 PII-Filtering**
- In `sentry.server.config.ts`: `beforeSend` Hook
- Filtere: E-Mail-Adressen, IP-Adressen, Kreditkarten-Nummern (Luhn-Check), Passwörter
- Niemals Customer-Daten an Sentry senden

#### Akzeptanzkriterien
- [ ] Sentry-SDK initialisiert ohne Errors
- [ ] Test: Künstlicher Fehler in API-Route erscheint in Sentry-Dashboard
- [ ] Source-Maps werden hochgeladen (Stack-Traces lesbar)
- [ ] Client-Errors werden getrackt
- [ ] Server-Errors werden getrackt
- [ ] PII wird gefiltert (keine E-Mail-Adressen in Sentry)
- [ ] Alerts sind konfiguriert (Test-Alert empfangen)

#### Dateien erstellt
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- `src/app/global-error.tsx`, `src/app/error.tsx`
- Update `next.config.ts`

---

### TASK 26: Product Analytics (PostHog)
**Phase:** 3 · **Aufwand:** 1 PT · **Abhängigkeiten:** TASK 18

#### Ziel
DSGVO-konformes Product-Analytics mit PostHog (self-hosted oder EU-Cloud), Funnel-Tracking, Heatmaps und Session-Recordings.

#### Subtasks

**26.1 PostHog-Setup**
```bash
bun add posthog-js posthog-node
```

**26.2 PostHog-Client `src/lib/posthog.ts`**
```typescript
import { PostHog } from "posthog-node";

export const posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
});

// Server-side: For tracking on API routes / webhooks
export async function trackServerEvent(
  event: string, 
  properties: Record<string, any>, 
  distinctId?: string
) {
  posthog.capture({ event, properties, distinctId: distinctId || "anonymous" });
}
```

**26.3 PostHog-Provider in `src/app/layout.tsx`**
- Conditional: Nur rendern wenn `hasAnalyticsConsent() === true`
- `PostHogProvider` wrap Application
- Auto-Pageview-Tracking
- Session-ID mit Customer-ID verknüpfen (wenn eingeloggt)

**26.4 Funnel-Events tracken**
```typescript
// In Product-Page: ProductViewed
posthog.capture("Product Viewed", {
  product_id: product.id,
  product_slug: product.slug,
  brand: product.brand.name,
  price_cents: product.resalePriceCents,
  condition: product.condition,
});

// In CartDrawer: AddToCart
posthog.capture("Add to Cart", {
  product_id: product.id,
  brand: product.brand.name,
  price_cents: product.resalePriceCents,
});

// In Checkout: CheckoutStarted
posthog.capture("Checkout Started", {
  cart_id: cart.id,
  cart_value_cents: cart.totalCents,
  item_count: cart.items.length,
});

// In Order-Confirmation: PurchaseCompleted
posthog.capture("Purchase Completed", {
  order_id: order.id,
  order_number: order.number,
  total_cents: order.totalCents,
  payment_method: "stripe",
});
```

**26.5 Funnel-Definition in PostHog-Dashboard**
- Funnel "Purchase Funnel":
  1. Product Viewed
  2. Add to Cart
  3. Checkout Started
  4. Purchase Completed
- Conversion-Rate pro Step
- Drop-Off-Analyse

**26.6 Heatmaps & Session-Recordings**
- In PostHog aktivieren
- Auf Product-Pages und Checkout-Page
- Hilfe zur UI-Optimierung

**26.7 Reverse-Proxy für Adblocker-Umgehung**
- In `next.config.ts`: Rewrite `/ingest/*` zu PostHog-Host
- Verhindert, dass Adblocker PostHog blocken

#### Akzeptanzkriterien
- [ ] PostHog-Script lädt NUR mit Analytics-Consent
- [ ] Pageviews werden getrackt
- [ ] Funnel-Events werden getrackt (Product Viewed → Purchase Completed)
- [ ] Funnel in PostHog-Dashboard sichtbar
- [ ] Customer-ID wird als distinctId verwendet (wenn eingeloggt)
- [ ] Heatmaps funktionieren
- [ ] Session-Recordings funktionieren
- [ ] Adblocker wird via Reverse-Proxy umgangen
- [ ] DSGVO: KEIN Tracking ohne Consent

#### Dateien erstellt
- `src/lib/posthog.ts`
- `src/components/PostHogProvider.tsx`
- Update `src/app/layout.tsx`, `next.config.ts`
- Update relevante Components für Event-Tracking

---

### TASK 27: Volltextsuche (Meilisearch)
**Phase:** 3 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 07

#### Ziel
Tippfehler-tolerante Instant-Search mit Meilisearch, Synonym-Mapping und konfigurierbaren Rankings.

#### Subtasks

**27.1 Meilisearch-Setup**
- Self-hosted auf kleinem VPS (Hetzner CX21, ~5€/Monat)
- Oder Meilisearch Cloud (managed, ~30€/Monat für Production)
- Docker-Setup:
  ```bash
  docker run -d --name meilisearch \
    -p 7700:7700 \
    -v meili_data:/meili_data \
    -e MEILI_MASTER_KEY=... \
    getmeili/meilisearch:latest
  ```

**27.2 Meilisearch-Client `src/lib/search.ts`**
```typescript
import { MeiliSearch } from "meilisearch";

export const meili = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_SEARCH_KEY!, // Search-only Key!
});

export const productsIndex = meili.index("products");

// Admin-Key nur in server-side code
export const meiliAdmin = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST!,
  apiKey: process.env.MEILISEARCH_ADMIN_KEY!,
});

// Sync-Funktion: Product zu Meilisearch pushen
export async function syncProductToSearch(product: Product) {
  await productsIndex.addDocuments([{
    id: product.id,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    brand: product.brand.name,
    brandSlug: product.brand.slug,
    category: product.category?.name,
    material: product.material,
    color: product.color,
    condition: product.condition,
    priceCents: product.resalePriceCents,
    slug: product.slug,
    image: product.images[0]?.url,
    status: product.status,
    updatedAt: product.updatedAt.toISOString(),
  }]);
}

export async function removeProductFromSearch(productId: string) {
  await productsIndex.deleteDocument(productId);
}
```

**27.3 Index-Konfiguration**
- Searchable Attributes: `title, subtitle, description, brand, material, color`
- Displayed Attributes: alle (für UI)
- Filterable Attributes: `brandSlug, category, condition, priceCents, status`
- Sortable Attributes: `priceCents, updatedAt`
- Ranking Rules: `words, typo, proximity, attribute, exactness, priceCents:asc` (custom)
- Synonyms: `{"lv": ["louis vuitton"], "birkin": ["hermes birkin"]}`

**27.4 Sync-Logik**
- Bei Product-Create (Admin): `syncProductToSearch()`
- Bei Product-Update (Admin): `syncProductToSearch()`
- Bei Product-Delete (Soft → Archive): `removeProductFromSearch()` oder Status auf ARCHIVED
- Initial Bulk-Sync: `bun run scripts/sync-search.ts`

**27.5 Search-API `src/app/api/search/route.ts`**
```typescript
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get("q") || "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);
  
  const results = await productsIndex.search(query, {
    limit,
    filter: ['status = "PUBLISHED"'],
    attributesToRetrieve: ["id", "title", "subtitle", "brand", "priceCents", "slug", "image", "condition"],
  });
  
  return Response.json({ hits: results.hits });
}
```

**27.6 Search-Modal erweitern `src/components/storefront/SearchModal.tsx`**
- Ersetze simple Catalog-Search durch Meilisearch-Instant-Search
- Debounced Input (300ms)
- Live-Results als Dropdown:
  - Thumbnail (60x60)
  - Title + Brand
  - Price + Condition-Badge
- Keyboard-Navigation (Pfeil hoch/runter, Enter)
- Click navigiert zu Product-Page
- "Alle Ergebnisse ansehen" → `/catalog?search=...`

**27.7 Search-Page `/catalog?search=...`**
- Volle Suche mit Meilisearch
- Filter weiterhin via Prisma (für komplexere Queries)
- Highlighting der Search-Terms in Results

#### Akzeptanzkriterien
- [ ] Meilisearch-Index enthält alle PUBLISHED-Produkte
- [ ] Suche nach "birkin" findet Hermès Birkin
- [ ] Suche nach "brikin" (Tippfehler) findet ebenfalls
- [ ] Suche nach "lv" findet Louis Vuitton (Synonym)
- [ ] Search-Modal zeigt Live-Results beim Tippen
- [ ] Keyboard-Navigation funktioniert
- [ ] Ergebnisse sind nach Relevance gerankt
- [ ] Filter funktioniert (nur PUBLISHED-Produkte)
- [ ] Sync bei Product-Create/Update/Delete funktioniert
- [ ] Search-API ist öffentlich (nur Search-Key, kein Admin-Key im Client!)

#### Dateien erstellt
- `src/lib/search.ts`, `src/app/api/search/route.ts`
- `scripts/sync-search.ts`
- Update `src/components/storefront/SearchModal.tsx`
- Update `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[id]/route.ts`

---

### TASK 28: Watchlist & PDF-Echtheitszertifikat
**Phase:** 3 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 04, TASK 07

#### Ziel
Kunden-Watchlist (Favoriten) für Luxusartikel und automatische PDF-Generierung von Echtheitszertifikaten nach Kauf.

#### Subtasks

**28.1 Favorites-API**
- `GET /api/favorites`: Liefert alle Favoriten des eingeloggten Customers
- `POST /api/favorites`: Body `{ productId }` → erstellt Favorite
- `DELETE /api/favorites/[productId]`: Entfernt Favorite
- Alle require `customer` (nicht für Gäste)

**28.2 Favorites-Store `src/store/favorites-store.ts`**
- State: `favorites: Product[]`, `loading`
- Methoden: `fetch()`, `toggle(productId)`, `isFavorite(productId)`
- Bei App-Start: fetch wenn eingeloggt

**28.3 Heart-Button `src/components/storefront/FavoriteButton.tsx`**
- Heart-Icon (lucide), gefüllt wenn favorisiert
- Toggle beim Click
- Animation: Pulse beim Hinzufügen
- Für Gäste: Weiterleitung zu Login mit Return-URL

**28.4 Favorites-Integration in ProductCard & ProductDetail**
- Heart-Button oben rechts auf Bild (ProductCard)
- Heart-Button prominent neben "In den Warenkorb" (ProductDetail)

**28.5 Favorites-Page `/account/favorites`**
- Grid aller favorisierten Produkte (mit ProductCard)
- "Alle entfernen" Button
- Empty-State: "Sie haben noch keine Favoriten"

**28.6 PDF-Echtheitszertifikat `src/lib/pdf.ts`**
```bash
bun add @react-pdf/renderer
```

```typescript
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export function AuthenticityCertificate({ product, order }: { product: Product; order: Order }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.logo}>SONA Boutique</Text>
          <Text style={styles.subtitle}>Echtheitszertifikat</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.body}>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.brand}>{product.brand.name}</Text>
          
          <View style={styles.details}>
            <Text>Zertifikats-Nummer: {product.authenticityCertNo}</Text>
            <Text>Bestellnummer: {order.number}</Text>
            <Text>Datum: {new Date(order.placedAt).toLocaleDateString("de-DE")}</Text>
            <Text>Kunde: {order.firstName} {order.lastName}</Text>
          </View>
          
          <View style={styles.authSection}>
            <Text>Hiermit bestätigen wir, dass das oben genannte Produkt aufwändig authentifiziert wurde. 
            Unsere zertifizierten Gutachter haben Material, Hardware, Stichtechnik, Seriennummern und 
            Herstellungsmerkmale geprüft.</Text>
          </View>
          
          <View style={styles.signature}>
            <Text>Geprüft von: SONA Boutique Authentication Team</Text>
            <Text>Datum: {new Date().toLocaleDateString("de-DE")}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text>SONA Boutique · [Adresse] · USt-IdNr: [DE...]</Text>
        </View>
      </Page>
    </Document>
  );
}
```

**28.7 PDF-Generierung & Download**
- API `GET /api/orders/[id]/certificate`: 
  - Generiert PDF via `@react-pdf/renderer`
  - Setzt Content-Type: application/pdf
  - Customer muss Owner sein, Admin darf auch
- Link in Order-Confirmation-Page: "Echtheitszertifikat herunterladen"
- Link in Kundenkonto: für jede Order verfügbar
- Optional: als Anhang in Versandbestätigungs-E-Mail (Phase 4)

#### Akzeptanzkriterien
- [ ] Eingeloggter Customer kann Produkte favorisieren (Heart-Button)
- [ ] Favoriten erscheinen in `/account/favorites`
- [ ] Toggle funktioniert (Add/Remove)
- [ ] Gäste werden bei Click zu Login weitergeleitet
- [ ] Favoriten sind Customer-spezifisch (nicht global)
- [ ] PDF-Zertifikat generiert nach Kauf
- [ ] PDF enthält: Logo, Product-Title, Brand, Cert-Nummer, Order-Number, Datum, Kunde
- [ ] PDF ist downloadbar von Order-Confirmation und Kundenkonto
- [ ] Nur Owner (oder Admin) kann Zertifikat herunterladen
- [ ] PDF sieht edel aus (Luxe-Styling, Cormorant Garamond falls möglich)

#### Dateien erstellt
- `src/app/api/favorites/route.ts`, `src/app/api/favorites/[productId]/route.ts`
- `src/store/favorites-store.ts`
- `src/components/storefront/FavoriteButton.tsx`
- `src/app/(storefront)/account/favorites/page.tsx`
- `src/lib/pdf.ts`, `src/app/api/orders/[id]/certificate/route.ts`
- Update `src/app/(storefront)/order/[id]/page.tsx`

---

## PHASE 4: LAUNCH & QUALITÄTSSICHERUNG (8 Personentage)

**Ziel:** Produktions-Infrastruktur aufbauen, vollständige Test-Abdeckung, Performance-Lasttests, Domain-Aufschaltung und sicheres Go-Live.

---

### TASK 29: Production-Infrastruktur (Vercel + Supabase)
**Phase:** 4 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 01

#### Ziel
Hochverfügbare, skalierbare Production-Umgebung auf Vercel (Frontend + API) und Supabase (PostgreSQL) mit strikter Trennung von Staging/Prod.

#### Subtasks

**29.1 Vercel-Project Setup**
- Neues Project in Vercel-Dashboard erstellen
- GitHub-Repo verbinden
- Framework-Preset: Next.js
- Build-Command: `bun run build`
- Output-Directory: `.next`
- Install-Command: `bun install`

**29.2 Environment-Variablen in Vercel**
Für Production strikt gesetzt:
```
DATABASE_URL=postgresql://...@db.xxx.supabase.co:5432/postgres
AUTH_SECRET=<neuer-64-char-string>
SESSION_COOKIE_NAME=sona_session
STRIPE_SECRET_KEY=sk_live_...  # LIVE-KEY!
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLIC_KEY=pk_live_...
RESEND_API_KEY=re_...
EMAIL_FROM="SONA Boutique <noreply@sona-boutique.de>"
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
MEILISEARCH_HOST=https://...
MEILISEARCH_ADMIN_KEY=...
MEILISEARCH_SEARCH_KEY=...
NEXT_PUBLIC_APP_URL=https://sona-boutique.de
NODE_ENV=production
```

**29.3 Staging-Environment**
- Vercel Preview-Deployments für alle Branches außer `main`
- Separate Supabase-Staging-DB
- Stripe Test-Keys (sk_test_...)
- Separate Resend-Domain für Staging (z.B. `staging.sona-boutique.de`)

**29.4 Supabase-Project Setup**
- Neues Project auf supabase.com
- Region: Frankfurt (eu-central-1) für DSGVO-Compliance
- Database Password: sicher generieren
- Connection-Pooling aktivieren (Supavisor)
- Connection-String: `postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- PITR (Point-in-Time Recovery) aktivieren ( kostenpflichtiges Add-on)

**29.5 Prisma auf PostgreSQL umstellen**
- In `prisma/schema.prisma`: `provider = "postgresql"` (für Prod)
- Env-basiertes Switching nicht empfohlen (besser: separate schema.prisma falls nötig)
- Alternative: SQLite für Dev, PostgreSQL für Prod — gleiche Schema-Syntax, nur Datasource-Provider ändern
- Migration auf Prod-DB: `bunx prisma migrate deploy` in Vercel Build-Step
- Seed: `bunx prisma db seed` manuell nach erstem Deploy

**29.6 Vercel Build-Process**
- In `package.json` Build-Script erweitern:
  ```json
  "build": "prisma generate && next build"
  ```
- Postinstall-Script für Prisma:
  ```json
  "postinstall": "prisma generate"
  ```

**29.7 Custom Domain aufschalten**
- In Vercel: `sona-boutique.de` als Production-Domain hinzufügen
- `www.sona-boutique.de` als Redirect zu `sona-boutique.de`
- DNS-Records beim Domain-Provider setzen:
  - A-Record: `@ → 76.76.21.21`
  - CNAME: `www → cname.vercel-dns.com`
- SSL-Zertifikat: Vercel auto-generiert (Let's Encrypt)
- Wartezeit: ~5–30 Minuten bis SSL aktiv

**29.8 Vercel Cron Jobs**
- In `vercel.json` finalisieren:
  ```json
  {
    "crons": [
      { "path": "/api/cron/cleanup-locks", "schedule": "*/5 * * * *" },
      { "path": "/api/cron/cleanup-sessions", "schedule": "0 3 * * *" },
      { "path": "/api/cron/oss-report-reminder", "schedule": "0 8 1 1,4,7,10 *" }
    ]
  }
  ```
- Cleanup-Scripts:
  - `/api/cron/cleanup-locks`: Abgelaufene Inventory-Locks freigeben
  - `/api/cron/cleanup-sessions`: Abgelaufene User-Sessions löschen
  - `/api/cron/oss-report-reminder`: Quartalsweise Erinnerung für OSS-Report an Admin

**29.9 GitHub Branch-Protection**
- `main`-Branch schützen:
  - Require pull request before merging
  - Require status checks to pass (CI, Lint, Tests)
  - Require approvals: mindestens 1
  - Dismiss stale pull request approvals when new commits are pushed
  - Require linear history (squash-merges)
- `develop`-Branch: weniger strikt, direkte Pushes für Hotfixes erlaubt

**29.10 CI/CD Pipeline `.github/workflows/ci.yml`**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      - run: bun install --frozen-lockfile
      - run: bun run lint
      - run: bun run typecheck
      - run: bun run test:unit
      - run: bun run test:integration
      - run: bunx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      - run: bun run test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
```

#### Akzeptanzkriterien
- [ ] Vercel-Project erstellt und mit GitHub verbunden
- [ ] Push zu `main` triggert automatisch Production-Deploy
- [ ] Push zu Feature-Branch erstellt Preview-URL
- [ ] Alle Env-Variablen in Vercel gesetzt (Production)
- [ ] Supabase-Project in Frankfurt erstellt
- [ ] PITR-Backup aktiv
- [ ] `sona-boutique.de` ist über HTTPS erreichbar
- [ ] SSL-Zertifikat gültig (A+ Rating auf SSL Labs)
- [ ] GitHub `main`-Branch ist geschützt
- [ ] CI-Pipeline läuft grün bei PRs
- [ ] Vercel Cron-Jobs sind registriert und laufen

#### Dateien erstellt
- `vercel.json` (final), `.github/workflows/ci.yml`
- Update `package.json` (build + postinstall scripts)
- `docs/deployment.md`

---

### TASK 30: Test-Suite (Vitest + Playwright)
**Phase:** 4 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 04, TASK 09, TASK 10, TASK 11

#### Ziel
Vollständige Test-Abdeckung: Unit-Tests für Business-Logik, Integration-Tests für API-Routes, E2E-Tests für kritische User-Flows.

#### Subtasks

**30.1 Vitest-Setup `vitest.config.ts`**
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**", "src/app/api/**"],
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

**30.2 Test-Scripts in `package.json`**
```json
"scripts": {
  "test": "vitest",
  "test:unit": "vitest run tests/unit",
  "test:integration": "vitest run tests/integration",
  "test:e2e": "playwright test",
  "test:coverage": "vitest run --coverage"
}
```

**30.3 Unit-Tests `tests/unit/`**

`tests/unit/cart.test.ts`:
- Test `recomputeCart()`: Subtotal, Shipping (gratis ab 500€), Tax (19%), Discount
- Test Inventory-Limit
- Test Promo-Code-Berechnung (percentage, fixed)
- Test Edge Cases: leerer Cart, negativer Preis (sollte fehlschlagen), Überbestand

`tests/unit/tax.test.ts`:
- Test alle 6 Länder-Steuer-Sätze
- Test Default-Verhalten bei unbekanntem Land
- Test CH (0% MwSt.)

`tests/unit/promo.test.ts`:
- Test `validatePromoCode()`: aktiv, Zeitraum, Usage-Limit, Per-Customer-Limit
- Test `calculateDiscount()`: percentage vs fixed
- Test Edge Cases: abgelaufen, noch nicht gültig, Mindestbestellwert nicht erreicht

`tests/unit/auth.test.ts`:
- Test `hashPassword()` und `verifyPassword()`
- Test Token-Generierung (Länge, Entropie)
- Test Session-Expiry-Logik

`tests/unit/inventory-lock.test.ts`:
- Test `lockProduct()`: erfolgreich, bereits gelockt, abgelaufen
- Test `unlockProduct()`
- Test `cleanupExpiredLocks()`

**30.4 Integration-Tests `tests/integration/`**

`tests/integration/api/auth.test.ts`:
- POST `/api/auth/register`: erfolgreich, duplicate email, invalid input
- POST `/api/auth/login`: erfolgreich, wrong password, non-existent user
- POST `/api/auth/logout`: clears session
- GET `/api/auth/me`: with and without session

`tests/integration/api/cart.test.ts`:
- GET `/api/cart`: returns empty cart for new session
- POST `/api/cart`: adds item, respects inventory
- PATCH `/api/cart/items/[id]`: updates quantity, deletes at 0
- DELETE `/api/cart/items/[id]`: removes item
- POST `/api/cart/promo`: applies valid code, rejects invalid

`tests/integration/api/checkout.test.ts`:
- POST `/api/checkout`: creates order, decrements inventory, completes cart
- Test Race-Condition: 2 concurrent checkouts for same single-piece product
- Test Validation Errors

`tests/integration/api/admin/products.test.ts`:
- POST: requires admin, creates product
- PATCH: updates product
- DELETE: archives (not physical delete)

**30.5 E2E-Tests `tests/e2e/` mit Playwright**

`tests/e2e/buy-flow.spec.ts`:
```typescript
test("complete purchase flow", async ({ page }) => {
  // 1. Gehe zu Startseite
  await page.goto("/");
  
  // 2. Klicke auf erstes Featured Product
  await page.click("[data-testid=product-card]:first-child");
  await expect(page).toHaveURL(/\/product\//);
  
  // 3. Klicke "In den Warenkorb"
  await page.click("[data-testid=add-to-cart]");
  
  // 4. Cart-Drawer sollte erscheinen
  await expect(page.locator("[data-testid=cart-drawer]")).toBeVisible();
  
  // 5. Gehe zum Checkout
  await page.click("[data-testid=checkout-button]");
  await expect(page).toHaveURL(/\/checkout/);
  
  // 6. Fülle Form aus
  await page.fill("[name=email]", "test@e2e.com");
  await page.fill("[name=firstName]", "Max");
  await page.fill("[name=lastName]", "Mustermann");
  await page.fill("[name=shippingStreet1]", "Teststr. 1");
  await page.fill("[name=shippingPostalCode]", "10115");
  await page.fill("[name=shippingCity]", "Berlin");
  
  // 7. Submit
  await page.click("[data-testid=submit-order]");
  
  // 8. Stripe Checkout (Test-Mode)
  await page.waitForURL(/checkout.stripe.com/);
  await page.fill("[name=cardNumber]", "4242 4242 4242 4242");
  await page.fill("[name=cardExpiry]", "12/30");
  await page.fill("[name=cardCvc]", "123");
  await page.click("button[type=submit]");
  
  // 9. Order Confirmation
  await page.waitForURL(/\/order\//, { timeout: 30000 });
  await expect(page.locator("h1")).toContainText("Vielen Dank");
});
```

`tests/e2e/auth-flow.spec.ts`:
- Register → Login → Logout
- Passwort-Reset-Flow
- Admin-Login → Access Admin Console

`tests/e2e/filter-flow.spec.ts`:
- Catalog-Page laden, Filter anwenden, Produkte werden gefiltert
- Sortierung ändern, Produkte werden neu sortiert

`tests/e2e/mobile-flow.spec.ts`:
- Mobile-Viewport (375px)
- Mobile-Menu öffnen/schließen
- Cart-Drawer auf Mobile
- Checkout-Form auf Mobile

**30.6 Playwright-Config `playwright.config.ts`**
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

**30.7 Test-Database Setup**
- Separate SQLite-Test-DB: `file:./prisma/test.db`
- Vor jedem Integration-Test: DB reset + Seed
- In `tests/setup.ts`: Prisma-Client mit Test-DB

#### Akzeptanzkriterien
- [ ] `bun run test:unit` läuft grün mit >80% Coverage für `src/lib/`
- [ ] `bun run test:integration` läuft grün für alle API-Routes
- [ ] `bun run test:e2e` läuft grün für Buy-Flow, Auth-Flow, Filter-Flow
- [ ] E2E-Tests auf 5 Browsern/Devices (Chromium, Firefox, WebKit, Mobile-Chrome, Mobile-Safari)
- [ ] Race-Condition-Test für Checkout bestanden
- [ ] CI-Pipeline läuft alle Tests bei PRs
- [ ] Test-DB wird vor jedem Test zurückgesetzt

#### Dateien erstellt
- `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`
- `tests/unit/{cart,tax,promo,auth,inventory-lock}.test.ts`
- `tests/integration/api/{auth,cart,checkout,admin/products}.test.ts`
- `tests/e2e/{buy-flow,auth-flow,filter-flow,mobile-flow}.spec.ts`

---

### TASK 31: Performance-Optimierung & Lasttests
**Phase:** 4 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 22, TASK 29

#### Ziel
Production-Performance-Optimierung für Core Web Vitals (LCP <2.5s, CLS <0.1, INP <200ms) und Lasttests für simulierten Traffic.

#### Subtasks

**31.1 Lighthouse-Audit**
- Lighthouse-Run auf Home, Catalog, Product-Detail, Checkout
- Ziel-Scores: Performance >90, Accessibility >95, Best Practices >95, SEO >95
- Schwachstellen identifizieren und dokumentieren

**31.2 Core Web Vitals optimieren**

**LCP (Largest Contentful Paint) <2.5s:**
- Hero-Image: Preload + richtigen Sizes
- Bild-Optimierung via Cloudinary (AVIF, WebP)
- Font-Preload für Inter und Cormorant
- Critical CSS inline

**CLS (Cumulative Layout Shift) <0.1:**
- Aspect-Ratio für alle Bilder definieren (`aspect-square`, `aspect-[4/5]`)
- Skeleton-Placeholders während Loading
- Keine dynamische Injection von Elementen oberhalb des Folds
- Font-Display: `swap` (verhindert FOIT)

**INP (Interaction to Next Paint) <200ms:**
- React Server Components maximieren
- Client-Komponenten minimal halten
- Debounce für Suche (300ms)
- Optimize Re-Renders (React.memo, useMemo)

**31.3 Bundle-Size-Analyse**
```bash
bun add -D @next/bundle-analyzer
```
- In `next.config.ts`: Bundle-Analyzer aktivieren
- Build: `ANALYZE=true bun run build`
- Identifiziere schwere Dependencies
- Code-Splitting für seltene Komponenten (z.B. Stripe, Cloudinary-Upload)

**31.4 Image-Optimierung**
- Alle Bilder via `next/image` oder Cloudinary
- Sizes-Prop korrekt setzen (verhindert Over-Downloading)
- Lazy-Loading für Offscreen-Bilder
- Priority für LCP-Bild

**31.5 Font-Optimierung**
- `next/font` mit `display: "swap"`
- Subset: latin (für DE/EN)
- Preload für Hauptfont (Inter)
- Variable Fonts bevorzugen (weniger Requests)

**31.6 Lasttests mit k6**
```bash
brew install k6  # macOS
```

`tests/load/homepage.k6.js`:
```javascript
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 20 },   // Ramp-up auf 20 User
    { duration: "1m", target: 20 },     // Hold 20 User
    { duration: "30s", target: 50 },   // Spike auf 50 User
    { duration: "1m", target: 50 },     // Hold 50 User
    { duration: "30s", target: 0 },     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],   // 95% unter 500ms
    http_req_failed: ["rate<0.01"],     // <1% Fehler
  },
};

export default function () {
  let res = http.get("https://sona-boutique.de/");
  check(res, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
```

`tests/load/product-page.k6.js`:
- Test Product-Detail-Page mit ISR-Caching
- Erwartet: <200ms dank Cache

`tests/load/checkout.k6.js`:
- Simuliere Checkout-Flow (Mock-Stripe in Test-Mode)
- Teste Inventory-Locking unter Last
- Erwartet: keine Doppelverkäufe

**31.7 Database-Query-Optimierung**
- Prisma-Query-Logs in Dev aktivieren
- Identifiziere N+1-Queries
- Index-Verifikation (alle @@index Direktiven im Schema)
- Ggf. Raw-Queries für komplexe Aggregationen

**31.8 CDN-Configuration**
- Vercel Edge-Cache für statische Assets
- Cache-Headers für Bilder: `Cache-Control: public, max-age=31536000, immutable`
- ISR-Revalidate: 60s für Product-Pages

#### Akzeptanzkriterien
- [ ] Lighthouse Performance Score >90 auf Home, Catalog, Product
- [ ] LCP <2.5s auf Mobile (3G simuliert)
- [ ] CLS <0.1 auf allen Pages
- [ ] INP <200ms auf Add-to-Cart
- [ ] Bundle-Size: First Load JS <200kB
- [ ] k6 Lasttest: 50 concurrent User, <500ms p95
- [ ] Keine N+1 Queries in Prisma-Logs
- [ ] Cloudinary-Bilder als AVIF/WebP
- [ ] Cache-Headers korrekt gesetzt

#### Dateien erstellt
- `tests/load/{homepage,product-page,checkout}.k6.js`
- `next.config.ts` (Bundle-Analyzer, Image-Optimierung)
- `docs/performance-baseline.md`

---

### TASK 32: Go-Live Checklist & Domain-Aufschaltung
**Phase:** 4 · **Aufwand:** 1.5 PT · **Abhängigkeiten:** TASK 29, TASK 30, TASK 31

#### Ziel
Strukturiertes Go-Live mit finaler Checklist, DNS-Umstellung, Smoke-Tests und Notfall-Rollback-Plan.

#### Subtasks

**32.1 Pre-Launch-Checkliste `docs/go-live-checklist.md`**

#### Technical
- [ ] Production-Deploy auf Vercel erfolgreich
- [ ] `sona-boutique.de` erreichbar mit gültigem SSL
- [ ] Alle Env-Variablen in Vercel gesetzt (Production)
- [ ] Database-Migrationen auf Prod-DB ausgeführt
- [ ] Seed-Daten eingespielt (Admin-User, Brands, etc.)
- [ ] Stripe Live-Keys konfiguriert (nicht Test-Keys!)
- [ ] Stripe-Webhook-Endpoint in Stripe-Dashboard registriert (Production URL)
- [ ] Resend-Domain verifiziert (DKIM/SPF)
- [ ] Meilisearch-Index synchronisiert
- [ ] Vercel Cron-Jobs aktiv
- [ ] Sentry-DSN konfiguriert und Events kommen an

#### Rechtliches
- [ ] Impressum vollständig und korrekt
- [ ] Datenschutzerklärung von Anwalt geprüft
- [ ] AGB von Anwalt geprüft
- [ ] Widerrufsbelehrung aktuell (gesetzliche Muster)
- [ ] AGB-PDF generiert und verlinkt
- [ ] Widerrufsformular-PDF generiert
- [ ] Markenrechtlicher Disclaimer sichtbar (Footer + Product-Pages)
- [ ] LUCID-Registrierung (VerpackG) abgeschlossen
- [ ] USt-IdNr. im Impressum
- [ ] AVV mit allen Dienstleistern geschlossen (Vercel, Supabase, Stripe, Resend, Cloudinary)

#### Zahlung
- [ ] Stripe Live-Mode: erfolgreiche Test-Transaktion mit echter Karte (kleiner Betrag, sofort refund)
- [ ] Webhook-Signatur verifiziert in Production
- [ ] Refund-Flow getestet
- [ ] Dispute-Webhook getestet (Stripe-Test-Card 4000 0000 0000 0259)

#### E-Mail
- [ ] SPF, DKIM, DMARC in DNS gesetzt
- [ ] mail-tester.com Score 10/10
- [ ] Bestellbestätigung in Gmail, Outlook, Apple Mail getestet
- [ ] Versand-Update E-Mail getestet
- [ ] Passwort-Reset E-Mail getestet
- [ ] Willkommens-E-Mail getestet

#### SEO
- [ ] Sitemap.xml erreichbar und bei Google Search Console eingereicht
- [ ] robots.txt korrekt
- [ ] OpenGraph-Images getestet (Facebook Sharing Debugger)
- [ ] JSON-LD validiert (Google Rich Results Test)
- [ ] Canonical-Tags auf allen Pages

#### Performance
- [ ] Lighthouse Performance >90 auf Mobile
- [ ] Core Web Vitals im grünen Bereich
- [ ] Lasttest mit 50 Usern bestanden

#### Security
- [ ] securityheaders.com A+ Rating
- [ ] SSL Labs A+ Rating
- [ ] Keine Secrets in Code oder git history
- [ ] Argon2id-Hashing aktiv
- [ ] Rate-Limiting aktiv

#### Monitoring
- [ ] Sentry-Alerts konfiguriert (Email + Slack)
- [ ] UptimeRobot eingerichtet (5-Min-Check auf `/api/health`)
- [ ] Vercel Analytics aktiv
- [ ] PostHog-Events kommen an

**32.2 DNS-Umstellung**
1. Alte DNS-Einträge dokumentieren (für Rollback)
2. Neue DNS-Einträge setzen:
   - A-Record: `@ → 76.76.21.21` (Vercel)
   - CNAME: `www → cname.vercel-dns.com`
   - MX: für E-Mail-Empfang
   - TXT (SPF): `v=spf1 include:_spf.resend.com ~all`
   - TXT (DKIM): von Resend
   - TXT (DMARC): `v=DMARC1; p=quarantine; rua=mailto:dmarc@sona-boutique.de`
3. DNS-Propagation abwarten (weltweit: bis 48h, meist <1h)
4. Check via `dig sona-boutique.de` und `whatsmydns.net`

**32.3 Stripe-Production-Setup**
- In Stripe-Dashboard auf Live-Mode wechseln
- Live-API-Keys in Vercel-Env-Vars eintragen
- Webhook-Endpoint registriert: `https://sona-boutique.de/api/webhooks/stripe`
- Webhook-Events abonnieren:
  - `checkout.session.completed`
  - `payment_intent.payment_failed`
  - `charge.dispute.created`
  - `charge.dispute.closed`
  - `charge.refunded`
- Test-Transaktion mit echter Kreditkarte (1 €, sofort refund)

**32.4 Smoke-Tests nach Go-Live**
Manuelle Tests auf Production:
- [ ] Startseite lädt, Hero sichtbar
- [ ] Catalog lädt, Filter funktioniert
- [ ] Product-Detail lädt, Bilder, Preis, Add-to-Cart
- [ ] Cart-Drawer funktioniert
- [ ] Checkout bis Stripe-Redirect
- [ ] Stripe-Checkout mit echter Karte (1 €)
- [ ] Order-Confirmation-Seite
- [ ] E-Mail-Bestätigung empfangen
- [ ] Admin-Login, Dashboard sichtbar
- [ ] Mobile (375px): alle Flows

**32.5 Notfall-Rollback-Plan**
In `docs/rollback-plan.md`:
1. Vercel-Rollback: Letztes stabiles Deployment in Vercel-Dashboard auswählen → "Promote to Production"
2. DNS-Rollback: Alte DNS-Einträge wiederherstellen
3. DB-Rollback: Supabase PITR auf Zeitpunkt vor Issue
4. Stripe-Pause: Payment-Link deaktivieren, Orders als PENDING parken
5. Kommunikationsplan: Status-Seite (status.sona-boutique.de), Social Media, E-Mail an betroffene Kunden

**32.6 Post-Launch-Monitoring (erste 48h)**
- Vercel Analytics: Watch QPS, Error Rate, Response Times
- Sentry: Watch für neue Errors
- Stripe-Dashboard: Watch für fehlgeschlagene Zahlungen
- Resend: Watch für Bounces
- Manueller Check alle 4 Stunden in den ersten 48 Stunden

#### Akzeptanzkriterien
- [ ] Alle Punkte der Pre-Launch-Checkliste abgehakt
- [ ] DNS propagation abgeschlossen (weltweit)
- [ ] Stripe Live-Mode aktiv und getestet
- [ ] Smoke-Tests auf Production alle grün
- [ ] Rollback-Plan dokumentiert
- [ ] Erste echte Transaktion erfolgreich (mit echtem Kunden oder Freund)
- [ ] 48h Post-Launch-Monitoring ohne kritische Incidents

#### Dateien erstellt
- `docs/go-live-checklist.md`, `docs/rollback-plan.md`

---

## PHASE 5: POST-LAUNCH & OPTIMIERUNG (10 Personentage)

**Ziel:** Datengetriebene Optimierung nach 30 Tagen Live-Betrieb, A/B-Tests, Conversion-Optimierung und langfristige Stabilisierung.

---

### TASK 33: Analytics-Auswertung & Funnel-Optimierung
**Phase:** 5 · **Aufwand:** 2 PT · **Abhängigkeiten:** TASK 26, TASK 32

#### Ziel
Auswertung der ersten 30 Tage Live-Daten, Identifikation von Drop-Off-Punkten im Funnel und datengetriebene Optimierung.

#### Subtasks

**33.1 Funnel-Analyse (PostHog)**
- Funnel "Purchase Funnel" auswerten:
  1. Product Viewed → Add to Cart (Conversion: Ziel >5%)
  2. Add to Cart → Checkout Started (Ziel >60%)
  3. Checkout Started → Purchase Completed (Ziel >70%)
- Drop-Off-Punkte identifizieren
- Vergleich mit Industry-Benchmarks (Luxus-E-Commerce)

**33.2 Heatmap-Analyse**
- Hotjar/PostHog-Heatmaps für:
  - Home-Page: Wo klicken User hin? Scroll-Tiefe?
  - Catalog: Welche Produkte werden am meisten geklickt?
  - Product-Detail: Wo verweilen User? Welche Elemente werden ignoriert?
  - Checkout: Wo brechen User ab?

**33.3 Session-Recording-Analyse**
- Mindestens 50 Session-Recordings ansehen
-UX-Probleme identifizieren:
  - Verwirrende Navigation
  - Versteckte Buttons
  - Mobile-Issues
  - Form-Usability

**33.4 Speed-Index-Analyse**
- Vercel Analytics: Web Vitals über Zeit
- Langsame Pages identifizieren
- Stripe-Checkout-Latenz messen
- DB-Query-Performance prüfen

**33.5 Conversion-Optimierung-Dokument**
In `docs/conversion-optimization.md`:
- Erkannte Probleme
- Priorisierte Lösungsvorschläge (Impact vs. Aufwand)
- Roadmap für nächsten Sprint

#### Akzeptanzkriterien
- [ ] Funnel-Analyse zeigt klare Conversion-Raten pro Step
- [ ] Drop-Off-Punkte identifiziert
- [ ] Heatmap-Analyse für 4 Hauptpages durchgeführt
- [ ] 50+ Session-Recordings analysiert
- [ ] Conversion-Optimierungs-Dokument mit priorisierten Maßnahmen

#### Dateien erstellt
- `docs/conversion-optimization.md`

---

### TASK 34: A/B-Testing & Iterative Optimierung
**Phase:** 5 · **Aufwand:** 3 PT · **Abhängigkeiten:** TASK 33

#### Ziel
Systematische A/B-Tests für Conversion-relevante Elemente mit statistisch signifikanter Auswertung.

#### Subtasks

**34.1 A/B-Testing-Framework**
- PostHog Experiments nutzen (bereits via PostHog-SDK enthalten)
- Alternativ: Vercel Flags für Feature-Toggles
- Test-Dauer: min. 7 Tage oder bis statistische Signifikanz erreicht

**34.2 Test-Matrix (Priorisierte Hypothesen)**

| Test-ID | Hypothese | Variante A | Variante B | Primary Metric | Erwartete Impact |
|---|---|---|---|---|---|
| T-001 | Größerer CTA-Button erhöht Add-to-Cart | 40px Button | 56px Button | Add-to-Cart-Rate | +10% |
| T-002 | Trust-Badge unter Preis erhöht Conversion | Kein Badge | "Authentifiziert + versichert" Badge | Checkout-Start-Rate | +5% |
| T-003 | Hero-Image mit Tasche vs. Lifestyle | Produktfoto | Lifestyle-Bild | Home-Click-Through | +15% |
| T-004 | Free-Shipping-Schwelle sichtbar machen | Versteckt | Prominent im Header | Cart-Value | +20% AOV |
| T-005 | Express-Checkout (Apple/Google Pay) | Nur Stripe | Stripe + Wallets | Checkout-Conversion | +25% |
| T-006 | Reviews prominent platziert | Unten | Direkt unter Preis | Product-View → Add-to-Cart | +8% |
| T-007 | Urgency bei Einzelstücken | "1 verfügbar" | "Letztes Stück – bald vergriffen" | Add-to-Cart-Rate | +12% |

**34.3 Test-Durchführung**
- Pro Test: 7 Tage Laufzeit, min. 1000 User pro Variante
- PostHog-Experiment-Setup mit Feature-Flag
- Bei Signifikanz (p<0.05): Gewinner-Variante permanent aktivieren
- Bei keiner Signifikanz: Test verwerfen, nächste Hypothese

**34.4 Implementierung der Gewinner**
- T-001 bis T-007 nacheinander (nicht parallel, sonst Confounding)
- Code-Refactor für neue Default-Werte
- Performance-Monitoring nach Deploy

#### Akzeptanzkriterien
- [ ] 3–5 A/B-Tests durchgeführt (mindestens)
- [ ] Statistische Auswertung dokumentiert
- [ ] Gewinner-Varianten in Production übernommen
- [ ] Conversion-Rate um mindestens 15% gesteigert (kumulativ)

#### Dateien erstellt
- `docs/ab-test-results.md`

---

### TASK 35: Langfristige Wartung & Skalierung
**Phase:** 5 · **Aufwand:** 5 PT (fortlaufend) · **Abhängigkeiten:** TASK 32

#### Ziel
Langfristiger Betriebs-Plan: regelmäßige Wartung, Dependency-Updates, Backup-Verifikation, Skalierungsvorbereitung.

#### Subtasks

**35.1 Regelmäßige Wartungs-Aufgaben**

**Wöchentlich:**
- [ ] Sentry-Review: neue Errors prüfen, Fixes erstellen
- [ ] PostHog-Check: Funnel-Stats, anomales Verhalten
- [ ] DB-Size checken (Supabase-Dashboard)
- [ ] Stripe-Disputes prüfen
- [ ] Resend-Bounce-Rate prüfen

**Monatlich:**
- [ ] Dependency-Updates: `bun update` mit anschließendem Test-Run
- [ ] Security-Advisories checken (GitHub Dependabot)
- [ ] Backup-Restore-Test (Supabase PITR: 1x im Monat test-restore)
- [ ] Lighthouse-Audit wiederholen
- [ ] SEO-Check: Search Console, Sitemap-Status, Index-Status
- [ ] VerpackG-Mengenmeldung (quartalsweise)

**Quartalsweise:**
- [ ] OSS-Report für Steuerberater generieren
- [ ] AVV-Verträge mit Dienstleistern verlängern/prüfen
- [ ] DSFA-Review (falls neue Datenverarbeitung dazukam)
- [ ] Rechtstexte auf Aktualität prüfen (Gesetzesänderungen)
- [ ] Code-Audit: Tech-Debt identifizieren und dokumentieren

**Jährlich:**
- [ ] SSL-Zertifikat-Verlängerung checken (Vercel macht automatisch, aber checken)
- [ ] Domain-Verlängerung checken
- [ ] Penetration-Test durchführen (externer Dienstleister)
- [ ] Backup-Strategie Review

**35.2 Dependency-Update-Strategie**
- Dependabot in GitHub aktiviert (PRs für Security-Updates)
- Patch-Updates: sofort mergen (low risk)
- Minor-Updates: im Monats-Rhythmus, mit Tests
- Major-Updates: separater Branch, ausführliches Testing, ggf. Migrations-Code

**35.3 Backup-Verifikation**
- Supabase PITR: tägliches Backup automatisch
- Manueller Restore-Test monatlich:
  - Neue Supabase-Project erstellen
  - PITR-Restore auf Zeitpunkt T-1h
  - Smoke-Test: App gegen restored DB läuft
  - Project wieder löschen
- Cloudinary: Asset-Export regelmäßig (monatlich) als Backup
- Code: GitHub-Repo (mit Backups auf GitLab/Bitbucket als Spiegel)

**35.4 Skalierungsvorbereitung**
- Aktuell: Vercel + Supabase kann bis ~10k User/Tag skalieren
- Bei Wachstum:
  - DB: Supabase-Plan upgraden (mehr Compute)
  - Cache: Redis (Upstash) für Rate-Limiting + Session-Cache
  - Search: Meilisearch auf größeren VPS
  - CDN: Vercel Edge-Cache optimieren
- Bei extremem Wachstum (>100k User/Tag):
  - Migration auf AWS/GCP mit eigenem Kubernetes
  - Read-Replicas für DB
  - Microservices für Auth, Cart, Checkout

**35.5 Documentation Maintenance**
- ARCHITECTURE.md aktualisieren bei größeren Änderungen
- SECURITY.md jährlich reviewen
- DEPLOYMENT.md bei Vercel/Supabase-Changes aktualisieren
-LEGAL.md bei Gesetzesänderungen aktualisieren
- API-Doku via OpenAPI/Swagger (falls Team wächst)

**35.6 Incident-Response-Plan**
In `docs/incident-response.md`:
- Severity-Levels:
  - S1 (Critical): Shop offline, keine Zahlungen möglich → Response in 15 Min
  - S2 (High): Teilweise Funktionalität gestört → Response in 1 Std
  - S3 (Medium): Bug ohne kritischen Impact → Response in 1 Tag
  - S4 (Low): Schönheitsfehler → Response in 1 Woche
- On-Call-Plan (für Solo-Betrieb: bewusste Reaktionszeiten)
- Postmortem-Templates für S1/S2 Incidents

**35.7 Customer-Feedback-Loop**
- NPS-Survey nach Kauf (PostHog Survey)
- Feedback-Button im Kundenkonto
- Bewertungen auf Trustpilot aktiv sammeln
- Social Media Monitoring (Instagram, TikTok) für Markenerwähnungen

#### Akzeptanzkriterien
- [ ] Wartungs-Checkliste als wiederkehrende Tasks (Todoist/Notion)
- [ ] Erster monatlicher Wartungszyklus durchgeführt
- [ ] Backup-Restore-Test erfolgreich
- [ ] Incident-Response-Plan dokumentiert
- [ ] Dependency-Updates auf aktuellem Stand
- [ ] NPS-Survey implementiert

#### Dateien erstellt
- `docs/maintenance.md`, `docs/incident-response.md`, `docs/scalability-plan.md`

---

## APPENDIX A: Umfassende API-Dokumentation

### A.1 Auth Endpoints

| Method | Path | Auth | Beschreibung |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Neuen Customer anlegen |
| POST | `/api/auth/login` | Public | Login, erstellt Session |
| POST | `/api/auth/logout` | Customer | Logout, löscht Session |
| GET | `/api/auth/me` | Optional | Aktueller Customer |
| POST | `/api/auth/reset/request` | Public | Reset-Token generieren |
| POST | `/api/auth/reset/confirm` | Public | Passwort mit Token zurücksetzen |

### A.2 Catalog Endpoints

| Method | Path | Auth | Beschreibung |
|---|---|---|---|
| GET | `/api/products` | Public | Produkte mit Filtern |
| GET | `/api/products/[slug]` | Public | Produktdetail |
| GET | `/api/brands` | Public | Alle Brands |
| GET | `/api/categories` | Public | Alle Kategorien |
| GET | `/api/collections` | Public | Alle aktiven Kollektionen |
| GET | `/api/search?q=...` | Public | Meilisearch-Volltextsuche |

### A.3 Cart Endpoints

| Method | Path | Auth | Beschreibung |
|---|---|---|---|
| GET | `/api/cart` | Cookie | Cart abrufen/erstellen |
| POST | `/api/cart` | Cookie | Item hinzufügen |
| PATCH | `/api/cart/items/[itemId]` | Cookie | Menge ändern |
| DELETE | `/api/cart/items/[itemId]` | Cookie | Item entfernen |
| POST | `/api/cart/promo` | Cookie | Promo-Code anwenden |
| DELETE | `/api/cart/promo` | Cookie | Promo-Code entfernen |

### A.4 Order & Checkout Endpoints

| Method | Path | Auth | Beschreibung |
|---|---|---|---|
| POST | `/api/checkout` | Cookie | Stripe-Session erstellen |
| GET | `/api/orders` | Customer | Eigene Bestellungen |
| GET | `/api/orders/[id]` | Owner/Admin | Bestelldetail |
| GET | `/api/orders/[id]/certificate` | Owner/Admin | PDF-Zertifikat |

### A.5 Customer Endpoints

| Method | Path | Auth | Beschreibung |
|---|---|---|---|
| GET | `/api/favorites` | Customer | Favoriten abrufen |
| POST | `/api/favorites` | Customer | Produkt favorisieren |
| DELETE | `/api/favorites/[productId]` | Customer | Favorit entfernen |

### A.6 Admin Endpoints (alle require ADMIN)

| Method | Path | Beschreibung |
|---|---|---|
| GET | `/api/admin/products` | Alle Produkte |
| POST | `/api/admin/products` | Produkt erstellen |
| PATCH | `/api/admin/products/[id]` | Produkt aktualisieren |
| DELETE | `/api/admin/products/[id]` | Produkt archivieren |
| POST | `/api/admin/products/[id]/images` | Bild hochladen |
| DELETE | `/api/admin/products/[id]/images/[imageId]` | Bild löschen |
| PATCH | `/api/admin/products/[id]/images/reorder` | Bilder sortieren |
| POST | `/api/admin/products/[id]/mark-sold-external` | Extern verkauft |
| GET | `/api/admin/orders` | Alle Bestellungen |
| PATCH | `/api/admin/orders/[id]` | Status aktualisieren |
| POST | `/api/admin/orders/[id]/refund` | Rückerstattung |
| GET/POST/PATCH/DELETE | `/api/admin/promo-codes/*` | Promo-Code CRUD |

### A.7 Webhook Endpoints

| Method | Path | Beschreibung |
|---|---|---|
| POST | `/api/webhooks/stripe` | Stripe-Events (Zahlung, Refund, Dispute) |

### A.8 Cron Endpoints (Auth via CRON_SECRET)

| Method | Path | Schedule | Beschreibung |
|---|---|---|---|
| GET | `/api/cron/cleanup-locks` | Alle 5 Min | Inventory-Locks bereinigen |
| GET | `/api/cron/cleanup-sessions` | Täglich 3 Uhr | Abgelaufene Sessions löschen |
| GET | `/api/cron/oss-report-reminder` | Quartalsweise | OSS-Report-Erinnerung |

### A.9 Health Endpoints

| Method | Path | Beschreibung |
|---|---|---|
| GET | `/api/health` | System-Health-Check (für UptimeRobot) |

---

## APPENDIX B: Environment-Variablen (vollständig)

### B.1 Development (.env.local)

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# Auth
AUTH_SECRET="<64-char-hex-string>"
SESSION_COOKIE_NAME="sona_session"
SESSION_TTL_DAYS=30

# Stripe (TEST-Modus)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="SONA Boutique <noreply@sona-boutique.de>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

# Sentry
SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="..."

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

# Meilisearch
MEILISEARCH_HOST="http://localhost:7700"
MEILISEARCH_ADMIN_KEY="..."
MEILISEARCH_SEARCH_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
CRON_SECRET="<random-string>"
```

### B.2 Production (Vercel)

Gleich wie Dev, ABER:
- `DATABASE_URL` = Supabase Postgres-Connection-String
- `STRIPE_SECRET_KEY` = `sk_live_...` (LIVE!)
- `STRIPE_PUBLIC_KEY` = `pk_live_...`
- `STRIPE_WEBHOOK_SECRET` = Live-Webhook-Secret
- `NEXT_PUBLIC_APP_URL` = `https://sona-boutique.de`
- `NODE_ENV` = `production`
- `MEILISEARCH_HOST` = Productive Meilisearch-URL

---

## APPENDIX C: Security-Checkliste (final)

### C.1 Pre-Launch Security-Audit

- [ ] Alle API-Routes haben Zod-Validierung
- [ ] Rate-Limiting aktiv auf:
  - [ ] `/api/auth/login` (5/15min)
  - [ ] `/api/auth/register` (3/60min)
  - [ ] `/api/auth/reset/*` (3/60min)
  - [ ] `/api/checkout` (3/15min)
- [ ] CSP-Header gesetzt und getestet
- [ ] HSTS aktiv (max-age=63072000, includeSubDomains, preload)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: camera=(), microphone=(), geolocation=()
- [ ] Cookies: HttpOnly, Secure, SameSite=Strict
- [ ] Argon2id für Passwort-Hashing (memoryCost=19456)
- [ ] Session-Tokens: 32 Bytes Entropie (64 Hex-Chars)
- [ ] Stripe-Webhook verifiziert Signatur
- [ ] CSRF-Schutz via Origin-Check auf POST-Routes
- [ ] Keine `dangerouslySetInnerHTML` irgendwo
- [ ] Keine Raw-SQL-Queries mit User-Input
- [ ] `.env.local` ist in `.gitignore`
- [ ] Keine Secrets in git history (`git log -p | grep -E "sk_live|sk_test"`)
- [ ] securityheaders.com: A+ Rating
- [ ] SSL Labs: A+ Rating
- [ ] PII-Filtering in Sentry aktiv

### C.2 Regelmäßige Security-Checks

- [ ] Monatlich: Dependabot-PRs reviewen und mergen
- [ ] Monatlich: GitHub Security Advisories checken
- [ ] Quartalsweise: Penetration-Test (extern)
- [ ]Jährlich: Vollständiger Security-Audit

---

## APPENDIX D: Rechts-Checkliste (für DE/EU)

### D.1 Pflicht-Seiten

- [ ] Impressum (§5 TMG): Name, Anschrift, Kontakt, Registergericht, USt-IdNr., LUCID-Nummer
- [ ] Datenschutz (DSGVO): Alle Dienstleister erwähnt, Rechtsgrundlagen, User-Rechte
- [ ] AGB: Eigentumsvorbehalt, Gewährleistung bei Gebrauchtware, Streitbeilegung
- [ ] Widerruf: Gesetzliche Muster-Belehrung, Muster-Widerrufsformular
- [ ] Versandkosten: Transparente Tabelle aller Länder

### D.2 Pflicht-Angaben auf Product-Pages

- [ ] Preis mit "inkl. 19% MwSt., zzgl. Versand"
- [ ] Zustand als "Gebrauchtware" deklariert
- [ ] Markenrechtlicher Disclaimer sichtbar
- [ ] Lieferzeit angegeben

### D.3 Pflicht-Elemente im Checkout

- [ ] Button heißt "Zahlungspflichtig bestellen" (§312j BGB)
- [ ] Alle Kosten transparent (Subtotal, Versand, MwSt., Total)
- [ ] AGB-Link zum Akzeptieren (Checkbox)
- [ ] Widerrufsbelehrung-Link sichtbar
- [ ] Lieferadresse und -zeit klar angezeigt

### D.4 Post-Purchase

- [ ] Bestellbestätigung per E-Mail mit:
  - Alle Bestelldetails
  - AGB als Anhang oder Link
  - Widerrufsbelehrung als Anhang oder Link
  - Impressum
- [ ] Rechnung mit ausgewiesener MwSt. (oder Kleinunternehmer-Hinweis)

### D.5 Verträge & Registrierungen

- [ ] AVV mit Vercel
- [ ] AVV mit Supabase
- [ ] AVV mit Stripe
- [ ] AVV mit Resend
- [ ] AVV mit Cloudinary
- [ ] LUCID-Registrierung (VerpackG)
- [ ] USt-IdNr. beantragt
- [ ] Gewerbeanmeldung
- [ ] (Falls GmbH: Handelsregister-Eintrag)

---

## APPENDIX E: Glossar

| Begriff | Erklärung |
|---|---|
| **AVV** | Auftragsverarbeitungsvertrag (DSGVO §28) |
| **CSP** | Content Security Policy (Schutz vor XSS) |
| **DSFA** | Datenschutz-Folgenabschätzung (Art. 35 DSGVO) |
| **DSGVO** | Datenschutz-Grundverordnung (EU) |
| **HSTS** | HTTP Strict Transport Security (HTTPS-Erzwingung) |
| **ISR** | Incremental Static Regeneration (Next.js) |
| **JSON-LD** | Linked Data Format für strukturierte Daten |
| **LCP** | Largest Contentful Paint (Core Web Vital) |
| **LUCID** | Verpackungsregister (VerpackG) |
| **MwSt.** | Umsatzsteuer (DE: 19%) |
| **OSS** | One-Stop-Shop (EU-Mehrwertsteuer-Verfahren) |
| **PAngV** | Preisangabenverordnung (DE) |
| **PITR** | Point-in-Time Recovery (DB-Backup) |
| **SCA** | Strong Customer Authentication (3D Secure) |
| **SSG** | Static Site Generation |
| **SSR** | Server-Side Rendering |
| **TMG** | Telemediengesetz (DE) |
| **USt-IdNr.** | Umsatzsteuer-Identifikationsnummer |
| **VerpackG** | Verpackungsgesetz (DE) |
| **WAI-ARIA** | Web Accessibility Initiative – Accessible Rich Internet Applications |

---

## APPENDIX F: Agent-Prompt-Templates

### F.1 Template für Task-Übergabe an Agenten

```
Bitte implementiere TASK XX aus dem SONA Boutique Implementation Plan.

Kontext:
- Der Implementation Plan liegt unter: /home/z/my-project/download/SONA_Boutique_Implementation_Plan.md
- Bitte lies zuerst den gesamten Plan, dann fokussiere dich auf TASK XX
- Implementiere NUR diese Task, nicht mehr

Vorgaben:
- Stack: Next.js 16, TypeScript, Tailwind v4, shadcn/ui, Prisma, SQLite (Dev)
- Coding-Conventions: siehe Plan Abschnitt 0.6
- Definition of Done: siehe Plan Abschnitt 0.7

Abgabe:
- Alle in der Task genannten Dateien erstellen/bearbeiten
- Akzeptanzkriterien müssen erfüllt sein
- `bun run lint` muss exit code 0 haben
- `bun run typecheck` muss exit code 0 haben
- Test-URL: https://preview-<bot-id>.space-z.ai/

Bitte melde dich, wenn TASK XX fertig ist, damit ich REVIEW durchführen kann.
```

### F.2 Template für Review-Feedback

```
TASK XX ist fast fertig. Bitte folgende Punkte nachbessern:

1. [Spezifisches Issue mit Datei:Zeile]
2. [Spezifisches Issue mit Datei:Zeile]
3. [Spezifisches Issue mit Datei:Zeile]

Bitte keine anderen Änderungen vornehmen, nur diese 3 Punkte fixen.
Danach melde dich für finalen Review.
```

### F.3 Template für Task-Success-Meldung

```
TASK XX ist abgeschlossen.

Was wurde gemacht:
- [Summary der implementierten Features]

Was noch fehlt (für nächste Tasks):
- [Hinweise für Folge-Tasks]

Bereit für Review. Bitte prüfen und mit "TASK XX+1 starten" bestätigen.
```

---

## APPENDIX G: Schnellreferenz für häufige Befehle

### G.1 Development

```bash
# Dev-Server starten
bun run dev

# Linting
bun run lint

# Type-Check
bun run typecheck

# DB Reset + Seed
bun run db:reset

# DB Migration (nach Schema-Änderung)
bunx prisma migrate dev --name <name>

# DB Studio öffnen
bunx prisma studio

# Stripe CLI Webhook lokalen Tunnel
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Meilisearch-Index neu synchronisieren
bun run scripts/sync-search.ts
```

### G.2 Testing

```bash
# Alle Unit-Tests
bun run test:unit

# Alle Integration-Tests
bun run test:integration

# E2E-Tests (startet automatisch dev server)
bun run test:e2e

# Tests mit Coverage
bun run test:coverage

# Spezifischen Test ausführen
bunx vitest run tests/unit/cart.test.ts

# Playwright UI-Mode (interaktiv)
bunx playwright test --ui
```

### G.3 Production

```bash
# Build lokal testen
bun run build

# Bundle-Analyzer
ANALYZE=true bun run build

# Lighthouse-CI
bunx @lhci/cli autorun

# k6 Lasttest
k6 run tests/load/homepage.k6.js
```

### G.4 Deployment

```bash
# Auf Staging deployen (via PR)
git checkout -b feature/...
git push origin feature/...
# → Vercel erstellt Preview-URL

# Auf Production deployen
git checkout main
git pull
git merge feature/...
git push origin main
# → Vercel auto-deployt
```

---

## ENDE DES IMPLEMENTATION PLANS

**Nächste Schritte für dich:**

1. ✅ Plan durchlesen (insbesondere Phase 1 Tasks 01–12)
2. ✅ Prüfen, ob Stack und Architecture deinen Vorstellungen entsprechen
3. ✅ Mit TASK 01 starten: "Bitte implementiere TASK 01 aus dem SONA Boutique Implementation Plan"
4. ✅ Nach jedem Task: Review durchführen, bei OK nächste Task starten
5. ✅ Nach Phase 1: Zwischen-Review mit echten Demo-Daten
6. ✅ Nach Phase 2: Stripe Test-Mode durchspielen
7. ✅ Nach Phase 4: Go-Live mit ersten echten Kunden

**Schätzung Gesamt:** ≈ 67 Personentage ≈ 13 Kalenderwochen bei Vollzeit-Entwicklung (inkl. TASK 05B + TASK 20B)

**Bei Fragen:** Plan als Source of Truth verwenden, ggf. Agent um Klärung bitten.

---

## APPENDIX H: Review-Notizen (v1.0 → v1.1)

Diese Notizen dokumentieren die Prüfung des ursprünglichen Plans (v1.0) und die vorgenommenen Ergänzungen. Sie sollen dir helfen, bewusst zu entscheiden, was noch zusätzlich sinnvoll wäre.

### H.1 Was bereits sehr gut war
- Datenmodell (Prisma) war schon in v1.0 durchdacht (Snapshots bei Orders, Single-Piece-Inventory, Multi-Channel-Locking)
- Rechtliche Tiefe (Impressum, Widerruf, AGB, DSGVO, VerpackG) ist für einen deutschen Shop ungewöhnlich vollständig
- Security-Kapitel (TASK 16) ist production-grade
- Testing-Strategie (Unit/Integration/E2E/Lasttest) ist vollständig
- Klare Task-Struktur mit Abhängigkeiten, Akzeptanzkriterien und Dateilisten — ideal für iterative Agenten-Abarbeitung

### H.2 Behobene Lücken (in v1.1 ergänzt)
1. **Fehlendes Konsignationsgeschäft:** Das Geschäftsmodell (0.2) nennt explizit "Konsignation + Eigenankauf", aber es gab keinen einzigen Task für den Ankaufs-/Einreichungsprozess. → **TASK 20B** behebt dies.
2. **Kein verbindliches Motion-/Animationssystem:** Trotz Framer Motion im Stack gab es keine konkreten Vorgaben für Scroll-Effekte, Parallax, Page-Transitions — genau das, was ein Luxus-Shop visuell braucht, um sich von 08/15-Templates abzuheben. → **TASK 05B** behebt dies, plus Ergänzungen in TASK 06.

### H.3 Empfehlungen für spätere, bewusste Entscheidungen (NICHT in Tasks umgesetzt, da Scope-Erweiterung)
- **Payout-Automatisierung für Consignors:** Aktuell manuelle Banküberweisung. Bei Wachstum lohnt sich Stripe Connect (Express-Accounts) für automatisierte Auszahlungen — eigenständiges Feature-Paket, bewusst nicht in diesem Plan enthalten.
- **Mehrsprachigkeit (i18n):** Plan ist komplett auf DE ausgelegt. Falls internationale Kunden (EU) wichtig werden, wäre `next-intl` sinnvoll — aktuell nicht vorgesehen, um Scope zu begrenzen.
- **Preis-Verhandlung / Angebote von Kunden ("Best Offer"):** Im Luxus-Resale-Markt üblich, aber bewusst nicht Teil des MVP.
- **Gutachter-Verwaltung:** TASK 20B nimmt an, dass ein Admin/Gutachter-Team intern per E-Mail/Telefon kommuniziert. Ein dediziertes Gutachter-Zuweisungssystem wäre für >1 Person im Team sinnvoll, aber Overkill für den Start.
- **Wallet/Guthaben-System:** Falls Kunden ihre Konsignations-Erlöse als Shop-Guthaben statt Bar-Auszahlung wählen können sollen, bräuchte es ein `CustomerCredit`-Model — aktuell nicht vorgesehen.

### H.4 Hinweis zur Umsetzungsreihenfolge
Empfehlung: **TASK 05B direkt nach TASK 05, vor TASK 06** implementieren lassen, damit das Motion-System steht, bevor App-Shell/Catalog/Product-Detail gebaut werden — genau wie in der Abhängigkeitskette oben vorgesehen. **TASK 20B** kann zeitlich flexibler eingeplant werden (nach TASK 11, spätestens vor Ende Phase 2), da es funktional unabhängig vom Kern-Checkout-Flow ist.


