import { GoldDivider } from "@/components/luxury/GoldDivider";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">DSGVO Transparenz</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
            Datenschutzerklärung
          </h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">Stand: Juli 2026</p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-xs leading-relaxed text-[#1A1A1A]">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              1. Name und Kontaktdaten des Verantwortlichen
            </h2>
            <p className="text-[#4A4A4A]">
              Diese Datenschutzerklärung gilt für die Datenverarbeitung durch:
            </p>
            <div className="space-y-1 border border-[#E8E5DC] bg-[#FAF9F6] p-4 font-mono text-[11px] text-[#4A4A4A]">
              <p className="font-bold text-[#1A1A1A]">SONA Boutique GmbH</p>
              <p>Maximilianstraße 12, 80539 München, Deutschland</p>
              <p>E-Mail: datenschutz@sona-boutique.de</p>
              <p>Telefon: +49 (0) 89 1234 5678</p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              2. Erhebung und Speicherung personenbezogener Daten
            </h2>
            <p className="text-[#4A4A4A]">
              Beim Aufrufen unserer Website www.sona-boutique.de werden durch den auf Ihrem Endgerät
              zum Einsatz kommenden Browser automatisch Informationen an den Server unserer Website
              gesendet. Diese Informationen werden temporär in einem sog. Server-Logfile
              gespeichert.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-[#6B6B6B]">
              <li>IP-Adresse des anfragenden Rechners</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Name und URL der abgerufenen Datei</li>
              <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
              <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners</li>
            </ul>
            <p className="text-[#4A4A4A]">
              Die genannte Datenverarbeitung erfolgt gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO zur
              Gewährleistung eines reibungslosen Verbindungsaufbaus und der Systemsicherheit.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              3. Cookies & Session Storage
            </h2>
            <p className="text-[#4A4A4A]">
              Wir setzen auf unserer Seite technisch notwendige Session-Cookies ein
              (`SameSite=Strict`, `HttpOnly`), um Ihren Warenkorb und den Anmeldestatus abzusichern.
              Rechtsgrundlage ist Art. 6 Abs. 1 S. 1 lit. f DSGVO.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              4. Bestellabwicklung & Dienstleister (Auftragsverarbeitung)
            </h2>
            <p className="text-[#4A4A4A]">
              Zur Erfüllung Ihres Kaufs übergeben wir personenbezogene Daten an ausgewählte
              Auftragsverarbeiter gemäß Art. 6 Abs. 1 S. 1 lit. b DSGVO:
            </p>
            <div className="space-y-3">
              <div className="space-y-1 border border-[#E8E5DC] p-4">
                <strong className="text-[#1A1A1A]">Zahlungsdienstleister Stripe:</strong>
                <p className="text-[#6B6B6B]">
                  Stripe Payments Europe, Ltd. verarbeitet Ihre Zahlungsdaten zur Abwicklung der
                  Kreditkarten- und Onlinezahlung. Details unter{" "}
                  <a
                    href="https://stripe.com/de/privacy"
                    target="_blank"
                    className="text-[#C5A880] underline"
                  >
                    stripe.com/de/privacy
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-1 border border-[#E8E5DC] p-4">
                <strong className="text-[#1A1A1A]">Express-Logistik DHL Express:</strong>
                <p className="text-[#6B6B6B]">
                  DHL Express Germany GmbH verarbeitet Name und Lieferadresse zum versicherten
                  Transport Ihrer Luxusartikel.
                </p>
              </div>

              <div className="space-y-1 border border-[#E8E5DC] p-4">
                <strong className="text-[#1A1A1A]">Transaktionale E-Mails Resend:</strong>
                <p className="text-[#6B6B6B]">
                  Resend Inc. übermittelt automatische Bestell- und Versandbestätigungen.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              5. Rechte der betroffenen Person (Art. 15–21 DSGVO)
            </h2>
            <p className="text-[#4A4A4A]">Sie haben das Recht:</p>
            <ul className="list-disc space-y-1.5 pl-5 text-[#6B6B6B]">
              <li>
                <strong>Auskunft (Art. 15 DSGVO):</strong> Auskunft über Ihre von uns verarbeiteten
                personenbezogenen Daten zu verlangen.
              </li>
              <li>
                <strong>Berichtigung (Art. 16 DSGVO):</strong> Unverzüglich die Berichtigung
                unrichtiger Daten zu verlangen.
              </li>
              <li>
                <strong>Löschung (Art. 17 DSGVO):</strong> Die Löschung Ihrer bei uns gespeicherten
                Daten zu verlangen, soweit nicht gesetzliche Aufbewahrungspflichten (z.B.
                Steuerrecht § 147 AO) entgegenstehen.
              </li>
              <li>
                <strong>Einschränkung (Art. 18 DSGVO):</strong> Die Einschränkung der Verarbeitung
                zu verlangen.
              </li>
              <li>
                <strong>Widerspruch (Art. 21 DSGVO):</strong> Jederzeit Widerspruch gegen die
                Verarbeitung einzulegen.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="border-b border-[#E8E5DC] pb-2 font-serif text-xl font-normal text-[#1A1A1A]">
              6. Datensicherheit (SSL/TLS)
            </h2>
            <p className="text-[#4A4A4A]">
              Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure
              Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe (TLS 1.3),
              die von Ihrem Browser unterstützt wird.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
