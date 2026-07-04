# SONA Boutique

Ein Online-Shop für authentifizierte, gebrauchte Luxushandtaschen.

## Setup

```bash
# Dependencies installieren
bun install

# Entwicklungsserver starten
bun run dev

# Oder mit npm
npm run dev
```

## Scripts

- `bun run dev` - Startet den Entwicklungsserver
- `bun run build` - Production Build
- `bun run lint` - Linting + Prettier Check
- `bun run typecheck` - TypeScript Type Checking
- `bun run db:seed` - Seed Daten laden
- `bun run db:studio` - Prisma Studio öffnen

## Umgebungsvariablen

Kopiere `.env.example` zu `.env.local` und fülle die Werte aus:

```bash
cp .env.example .env.local
```

## Projektstruktur

```
sona-boutique/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Wiederverwendbare Komponenten
│   ├── lib/          # Utility-Funktionen
│   └── store/        # Zustand Stores
├── prisma/           # Prisma Schema & Migrations
└── docs/             # Dokumentation