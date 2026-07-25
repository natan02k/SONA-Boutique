import { NextResponse } from "next/server";

// Navigation links used in Header, Footer, and MobileMenu
// TODO: Store these in a DB settings/collections table for admin management
const navigation = {
  headerLinks: [
    { label: "Alle Taschen", href: "/catalog" },
    { label: "Investment", href: "/catalog?collection=investment" },
    { label: "New Arrivals", href: "/catalog?sort=newest" },
    { label: "Quiet Luxury", href: "/catalog?collection=quiet-luxury" },
  ],
  footerShop: [
    { label: "Alle Taschen", href: "/catalog" },
    { label: "Investment Pieces", href: "/catalog?collection=investment" },
    { label: "New Arrivals", href: "/catalog?sort=newest" },
    { label: "Quiet Luxury", href: "/catalog?collection=quiet-luxury" },
  ],
  footerService: [
    { label: "Echtheitsgarantie", href: "/authentizitaet" },
    { label: "Zustandsbewertung", href: "/zustand" },
    { label: "Versand & Versandkosten", href: "/versandkosten" },
    { label: "Kontakt & Beratung", href: "/kontakt" },
  ],
  footerLegal: [
    { label: "Impressum", href: "/impressum" },
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "AGB", href: "/agb" },
    { label: "Widerrufsbelehrung", href: "/widerruf" },
  ],
};

export async function GET() {
  return NextResponse.json(navigation);
}