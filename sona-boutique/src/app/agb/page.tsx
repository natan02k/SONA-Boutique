import { GoldDivider } from "@/components/luxury/GoldDivider";
import { ShieldCheck, Scale, FileText } from "lucide-react";

export default function AgbPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">Rechtlicher Rahmen</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
            Allgemeine Geschäftsbedingungen
          </h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">
            Fassung: Juli 2026 · SONA Boutique GmbH
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-xs leading-relaxed text-[#1A1A1A]">
          {/* § 1 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 1 Geltungsbereich und Vertragspartner
            </h2>
            <p className="text-[#4A4A4A]">
              (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen über den
              Online-Shop www.sona-boutique.de der:
            </p>
            <div className="border border-[#E8E5DC] bg-[#FAF9F6] p-3 font-mono text-[11px] text-[#4A4A4A]">
              SONA Boutique GmbH, Maximilianstraße 12, 80539 München, Registergericht Amtsgericht
              München HRB 289123 (nachfolgend „SONA Boutique“).
            </div>
            <p className="text-[#4A4A4A]">
              (2) Verbraucher im Sinne dieser AGB ist jede natürliche Person, die ein Rechtsgeschäft
              zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer
              selbständigen beruflichen Tätigkeit zugerechnet werden können (§ 13 BGB).
            </p>
          </section>

          {/* § 2 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 2 Vertragsschluss & Einzelstück-Charakter
            </h2>
            <p className="text-[#4A4A4A]">
              (1) Die Darstellung der Luxushandtaschen im Online-Shop stellt kein rechtlich
              bindendes Angebot, sondern einen unverbindlichen Online-Katalog dar.
            </p>
            <p className="text-[#4A4A4A]">
              (2) Da es sich bei den angebotenen Luxus-Handtaschen um zertifizierte Unikate und
              Pre-Owned Einzelstücke handelt, gilt das Prinzip des Zwischenverkaufs. Durch Anklicken
              des Buttons „Zahlungspflichtig bestellen“ geben Sie eine verbindliche Bestellung ab.
            </p>
            <p className="text-[#4A4A4A]">
              (3) Die Bestätigung des Eingangs Ihrer Bestellung erfolgt zusammen mit der Annahme der
              Bestellung unmittelbar nach dem Absenden durch eine automatisierte E-Mail. Mit dieser
              E-Mail-Bestätigung ist der Kaufvertrag zustande gekommen.
            </p>
          </section>

          {/* § 3 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 3 Echtheitsgarantie & Zustandsbeschreibung
            </h2>
            <p className="text-[#4A4A4A]">
              (1) SONA Boutique garantiert unbedingte 100%ige Echtheit jedes verkauften Artikels.
              Jede Tasche durchläuft einen mehrstufigen Prüfprozess durch zertifizierte Gutachter.
            </p>
            <p className="text-[#4A4A4A]">
              (2) Soweit nicht ausdrücklich als „PRISTINE (Neuwertig)“ gekennzeichnet, handelt es
              sich um gebrauchte Luxusgüter. Geringfügige Tragespuren, Patina oder altersbedingte
              Abnutzungen entsprechen der dokumentierten Zustandsbewertung und stellen keinen Mangel
              dar.
            </p>
          </section>

          {/* § 4 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 4 Preise, Versandkosten & Eigentumsvorbehalt (§ 449 BGB)
            </h2>
            <p className="text-[#4A4A4A]">
              (1) Alle angegebenen Preise sind Endpreise in Euro (€) und enthalten die gesetzliche
              deutsche Mehrwertsteuer (19%).
            </p>
            <p className="text-[#4A4A4A]">
              (2) Die gelieferte Ware bleibt bis zur vollständigen Bezahlung im Eigentum von SONA
              Boutique (§ 449 BGB).
            </p>
          </section>

          {/* § 5 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 5 Lieferbedingungen & Transportversicherung
            </h2>
            <p className="text-[#4A4A4A]">
              (1) Die Lieferung erfolgt per versichertem Expressversand (DHL Express).
            </p>
            <p className="text-[#4A4A4A]">
              (2) Das Transportrisiko wird bis zur physischen Übergabe an den Empfänger durch SONA
              Boutique vollständig getragen und versichert.
            </p>
          </section>

          {/* § 6 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 6 Gewährleistung
            </h2>
            <p className="text-[#4A4A4A]">
              Es gelten die gesetzlichen Mängelhaftungsrechte (§ 437 BGB). Bei gebrauchten Waren
              beträgt die Verjährungsfrist für Mängelansprüche 12 Monate ab Ablieferung der Ware.
            </p>
          </section>

          {/* § 7 */}
          <section className="space-y-2">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg font-normal text-[#1A1A1A]">
              § 7 Schlussbestimmungen
            </h2>
            <p className="text-[#4A4A4A]">
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
              Sofern der Kunde Kaufmann ist, ist Gerichtsstand München.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
