import { GoldDivider } from "@/components/luxury/GoldDivider";
import { ShieldCheck, Mail, Phone, MapPin, Building2 } from "lucide-react";

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">Rechtliche Angaben</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">Impressum</h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">Angaben gemäß § 5 TMG / § 18 MStV</p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-xs leading-relaxed text-[#1A1A1A]">
          {/* Betreiber */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              <Building2 className="h-4 w-4 text-[#C5A880]" />
              Diensteanbieter & Herausgeber
            </h2>
            <div className="space-y-1 text-[#4A4A4A]">
              <p className="font-semibold text-[#1A1A1A]">SONA Boutique GmbH</p>
              <p>Maximilianstraße 12</p>
              <p>80539 München</p>
              <p>Deutschland</p>
            </div>
          </section>

          {/* Vertretungsberechtigte */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              Vertretungsberechtigte Personen
            </h2>
            <p className="text-[#4A4A4A]">
              <strong>Geschäftsführung:</strong> Dipl.-Kfm. Natan S. (Geschäftsführender
              Gesellschafter)
            </p>
          </section>

          {/* Kontakt */}
          <section className="space-y-3">
            <h2 className="flex items-center gap-2 border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              <Mail className="h-4 w-4 text-[#C5A880]" />
              Kontakt
            </h2>
            <div className="grid grid-cols-1 gap-4 text-[#4A4A4A] sm:grid-cols-2">
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">E-Mail</p>
                <a
                  href="mailto:info@sona-boutique.de"
                  className="text-[#1A1A1A] hover:text-[#C5A880]"
                >
                  info@sona-boutique.de
                </a>
              </div>
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">Telefon Concierge</p>
                <p className="font-mono text-[#1A1A1A]">+49 (0) 89 1234 5678</p>
              </div>
            </div>
          </section>

          {/* Register & USt-ID & LUCID */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              Registereintrag & Identifikationsnummern
            </h2>
            <div className="space-y-2 text-[#4A4A4A]">
              <p>
                <strong>Registergericht:</strong> Amtsgericht München
              </p>
              <p>
                <strong>Registernummer:</strong> HRB 289123
              </p>
              <p>
                <strong>Umsatzsteuer-Identifikationsnummer (§ 27a UStG):</strong> DE 394 812 345
              </p>
              <p>
                <strong>VerpackG (LUCID Registernummer):</strong> DE1234567890123 (Stiftung Zentrale
                Stelle Verpackungsregister)
              </p>
            </div>
          </section>

          {/* Inhaltlich Verantwortlich */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              Verantwortlich für den Inhalt (§ 18 Abs. 2 MStV)
            </h2>
            <p className="text-[#4A4A4A]">Natan S., Maximilianstraße 12, 80539 München.</p>
          </section>

          {/* Streitschlichtung */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              Verbraucherstreitbeilegung & EU-OS-Plattform
            </h2>
            <p className="leading-relaxed text-[#4A4A4A]">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS)
              bereit:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C5A880] underline"
              >
                https://ec.europa.eu/consumers/odr
              </a>
              . Unsere E-Mail-Adresse finden Sie oben im Impressum. Wir sind nicht bereit oder
              verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
              teilzunehmen.
            </p>
          </section>

          {/* Markenrechtlicher Disclaimer */}
          <section className="space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C5A880]">
              <ShieldCheck className="h-4 w-4" />
              <span>Markenrechtlicher Hinweis & Unabhängigkeit</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#6B6B6B]">
              SONA Boutique ist ein unabhängiger Reseller zertifizierter Pre-Owned Luxusgüter. SONA
              Boutique steht in keiner offiziellen geschäftlichen Verbindung, Partnerschaft oder
              Kooperation mit den auf dieser Website genannten Modemarken (wie Hermès, Chanel, Louis
              Vuitton, Bottega Veneta, Dior, Gucci u.a.). Alle eingetragenen Marken, Produktnamen
              und Logos sind das alleinige Eigentum der jeweiligen Rechteinhaber.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
