"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Truck, ShieldCheck } from "lucide-react";

type NavLink = { label: string; href: string };

export function Footer() {
  const [shopLinks, setShopLinks] = useState<NavLink[]>([
    { label: "Alle Taschen", href: "/catalog" },
  ]);
  const [serviceLinks, setServiceLinks] = useState<NavLink[]>([
    { label: "Versand & Versandkosten", href: "/versandkosten" },
  ]);
  const [legalLinks, setLegalLinks] = useState<NavLink[]>([
    { label: "Impressum", href: "/impressum" },
  ]);

  useEffect(() => {
    fetch("/api/navigation")
      .then((r) => r.json())
      .then((data) => {
        if (data.footerShop) setShopLinks(data.footerShop);
        if (data.footerService) setServiceLinks(data.footerService);
        if (data.footerLegal) setLegalLinks(data.footerLegal);
      })
      .catch(() => {});
  }, []);
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
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[#C5A880]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Service */}
          <div>
            <h5 className="label-luxury mb-4 text-white/40">Service & Hilfe</h5>
            <ul className="space-y-2.5 text-xs text-white/70">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[#C5A880]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Rechtliches */}
          <div>
            <h5 className="label-luxury mb-4 text-white/40">Rechtliches</h5>
            <ul className="space-y-2.5 text-xs text-white/70">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[#C5A880]">
                    {link.label}
                  </Link>
                </li>
              ))}
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
