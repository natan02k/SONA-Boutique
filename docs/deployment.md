# Deployment Guide — SONA Boutique

## Übersicht

| Komponente | Technologie | Anbieter |
|---|---|---|
| **Frontend + API** | Next.js 16 | Vercel |
| **Datenbank** | PostgreSQL 16 | Supabase |
| **Bilder** | Cloudinary | Cloudinary |
| **E-Mails** | React Email + Resend | Resend |
| **Zahlungen** | Stripe | Stripe |
| **Error Tracking** | Sentry | Sentry |
| **Analytics** | PostHog | PostHog EU-Cloud |

---

## 1. Supabase Project einrichten

1. **Account erstellen** auf https://supabase.com
2. **Neues Project** → Region: **Frankfurt (eu-central-1)**
3. Nach dem Erstellen:
   - **Project Settings → Database → Connection string** kopieren
   - `?pgbouncer=true` durch `?pgbouncer=false` ersetzen (für Prisma)
   - Connection String speichern für Vercel
4. **PITR aktivieren** → Project Settings → Billing → Addons

## 2. Vercel Project einrichten

1. **Account erstellen** auf https://vercel.com
2. **Add New Project** → GitHub Repository `SONA-Boutique` importieren
3. **Framework Preset:** Next.js
4. **Root Directory:** `sona-boutique`
5. **Build & Output Settings:**
   - Build Command: `bun run build`
   - Install Command: `bun install`
   - Output Directory: `.next`

### Environment Variables (Production)

In Vercel unter **Settings → Environment Variables** setzen:

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Auth
AUTH_SECRET="[64-char-random-string]"
SESSION_COOKIE_NAME=sona_session
SESSION_TTL_DAYS=30

# Stripe (LIVE keys!)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLIC_KEY="pk_live_..."

# Resend
RESEND_API_KEY="re_..."
EMAIL_FROM="SONA Boutique <noreply@sona-boutique.de>"

# Cloudinary
CLOUDINARY_CLOUD_NAME=xgv4pqk2
CLOUDINARY_API_KEY=486118593236615
CLOUDINARY_API_SECRET="[secret]"

# Sentry
SENTRY_DSN="https://3ef3c6bf7e69636eb89646f50377e432@o4511796743569408.ingest.de.sentry.io/4511796750254160"
NEXT_PUBLIC_SENTRY_DSN="https://3ef3c6bf7e69636eb89646f50377e432@o4511796743569408.ingest.de.sentry.io/4511796750254160"
SENTRY_AUTH_TOKEN="[optional, für Source Maps]"

# PostHog
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://eu.posthog.com"

# App
NEXT_PUBLIC_APP_URL="https://sona-boutique.de"
CRON_SECRET="[random-string]"
NODE_ENV=production
```

## 3. Datenbank-Migrationen ausführen

```bash
# Lokal: Migration erstellen (nach Schema-Änderungen)
cd sona-boutique
bun run db:migrate

# In Vercel: Migration läuft automatisch im Build-Schritt
# Manuell für initiale Migration:
npx prisma migrate deploy

# Seed-Daten einspielen (nur beim ersten Mal)
bun run db:seed
```

## 4. Domain aufschalten

1. **Domain kaufen** bei einem Registrar (z.B. Namecheap, Cloudflare)
2. **In Vercel** unter **Domains** → `sona-boutique.de` hinzufügen
3. **DNS-Records beim Registrar setzen:**
   ```
   A      @        → 76.76.21.21
   CNAME  www      → cname.vercel-dns.com
   ```
4. SSL-Zertifikat wird automatisch von Vercel ausgestellt (~5–30 Min)

## 5. GitHub Branch Protection

1. GitHub → Repository → Settings → Branches → Add rule
2. Branch: `main`
3. Einstellungen:
   - ✅ Require a pull request before merging
   - ✅ Require status checks (CI / Lint & TypeCheck)
   - ✅ Require linear history
   - ✅ Include administrators

## 6. Cron-Jobs

Vercel führt automatisch folgende Cron-Jobs aus:

| Pfad | Rhythmus | Beschreibung |
|---|---|---|
| `/api/cron/cleanup-locks` | Alle 5 Min | Abgelaufene Inventory-Locks freigeben |
| `/api/cron/cleanup-sessions` | Täglich 03:00 | Abgelaufene Sessions löschen |
| `/api/cron/oss-report-reminder` | Quartalsweise | OSS-Report-Erinnerung an Admin |

## 7. Staging-Umgebung (optional)

Für Tests mit echten Zahlungen gibt es eine Preview-URL:

1. **Vercel Preview Deployments** → automatisch für jeden Feature-Branch
2. **Separate Supabase Staging-DB** erstellen
3. **Stripe Test Keys** in Preview-Env-Variablen
4. Zugriff über `https://sona-boutique-[branch].vercel.app`

## 8. Nützliche Befehle

```bash
# Lokaler Dev-Server
cd sona-boutique && npm run dev

# Prisma Studio (Datenbank-UI)
cd sona-boutique && npm run db:studio

# TypeScript-Prüfung
cd sona-boutique && npm run typecheck

# Lint
cd sona-boutique && npm run lint

# Migration ausführen (lokal)
cd sona-boutique && npm run db:migrate

# Produktion lokal testen
cd sona-boutique && npm run build && npm run start
```