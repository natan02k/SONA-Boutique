import Link from "next/link";
import { Lock, Truck, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#C5A880]/30 bg-[#1A1A1A] pt-16 pb-12 text-[#FAF9F6]">
      <div className="container-luxury space-y-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-12 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <h4 className="font-serif text-xl font-light tracking-[0.2em] text-[#FAF9F6]">
              SONA BOUTIQUE
            </h4>
            <p className="max-w-xs text-xs leading-relaxed text-white/60">
              Der verlässliche Marktplatz für geprüfte Luxushandtaschen aus zweiter Hand.
            </p>
            <div className="flex items-center gap-4 pt-2 text-white/40">
              <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase">
                <Lock className="h-3 w-3 text-[#C5A880]" /> 256-Bit SSL
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase">
                <Truck className="h-3 w-3 text-[#C5A880]" /> DHL Express
              </div>
            </div>
          </div>

          {/* Col 2: Shop Navigation */}
          <div>
            <h5 className="label-luxury mb-4 text-white/40">Shop</h5>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/catalog" className="transition-colors hover:text-[#C5A880]">
                  Alle Taschen
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?collection=investment"
                  className="transition-colors hover:text-[#C5A880]"
                >
                  Investment Pieces
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?sort=newest"
                  className="transition-colors hover:text-[#C5A880]"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/catalog?collection=quiet-luxury"
                  className="transition-colors hover:text-[#C5A880]"
                >
                  Quiet Luxury
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Service */}
          <div>
            <h5 className="label-luxury mb-4 text-white/40">Service & Hilfe</h5>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/authentizitaet" className="transition-colors hover:text-[#C5A880]">
                  Echtheitsgarantie
                </Link>
              </li>
              <li>
                <Link href="/zustand" className="transition-colors hover:text-[#C5A880]">
                  Zustandsbewertung
                </Link>
              </li>
              <li>
                <Link href="/versand" className="transition-colors hover:text-[#C5A880]">
                  Versand & Versicherung
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="transition-colors hover:text-[#C5A880]">
                  Kontakt & Beratung
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Rechtliches */}
          <div>
            <h5 className="label-luxury mb-4 text-white/40">Rechtliches</h5>
            <ul className="space-y-2.5 text-xs text-white/70">
              <li>
                <Link href="/impressum" className="transition-colors hover:text-[#C5A880]">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="transition-colors hover:text-[#C5A880]">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="transition-colors hover:text-[#C5A880]">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/widerruf" className="transition-colors hover:text-[#C5A880]">
                  Widerrufsbelehrung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 font-mono text-xs text-[#C5A880]">
            <ShieldCheck className="h-4 w-4" />
            <span>100% Geprüfte Originalware</span>
          </div>
          <p className="mx-auto max-w-4xl text-[10px] leading-relaxed text-white/40">
            SONA Boutique ist ein unabhängiger Reseller von gebrauchten Luxusartikeln. Es besteht
            keine Kooperation, Autorisierung oder offizielle Partnerschaft mit den genannten Marken
            (Hermès, Chanel, Louis Vuitton, Dior etc.). Alle Markenrechte verbleiben bei den
            jeweiligen Inhabern.
          </p>
          <p className="font-mono text-xs text-white/60">
            © {new Date().getFullYear()} SONA Boutique. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
