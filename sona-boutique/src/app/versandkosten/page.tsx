import { GoldDivider } from "@/components/luxury/GoldDivider";
import { Truck, ShieldCheck, Clock } from "lucide-react";

export default function VersandkostenPage() {
  const rates = [
    { country: "Deutschland", flag: "🇩🇪", cost: "Kostenfrei", time: "1–2 Werktage" },
    { country: "Österreich", flag: "🇦🇹", cost: "Kostenfrei", time: "1–2 Werktage" },
    { country: "Schweiz", flag: "🇨🇭", cost: "15,00 €", time: "2–3 Werktage" },
    { country: "Frankreich", flag: "🇫🇷", cost: "15,00 €", time: "2–3 Werktage" },
    { country: "Italien", flag: "🇮🇹", cost: "15,00 €", time: "2–3 Werktage" },
    { country: "Niederlande", flag: "🇳🇱", cost: "Kostenfrei", time: "1–2 Werktage" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">Transparenz & Logistik</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
            Versand- & Lieferbedingungen
          </h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">
            PAngV Konform · DHL Express Wertversand
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-6 text-xs sm:grid-cols-3">
          <div className="space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-6 text-center">
            <Truck className="mx-auto h-6 w-6 text-[#C5A880]" />
            <h3 className="font-serif text-sm text-[#1A1A1A]">DHL Express</h3>
            <p className="text-[11px] text-[#6B6B6B]">
              Priorisierter Expressversand mit persönlicher Übergabe.
            </p>
          </div>
          <div className="space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-6 text-center">
            <ShieldCheck className="mx-auto h-6 w-6 text-[#C5A880]" />
            <h3 className="font-serif text-sm text-[#1A1A1A]">100% Vollversichert</h3>
            <p className="text-[11px] text-[#6B6B6B]">
              Transportschutz bis 25.000 € pro Paket inklusive.
            </p>
          </div>
          <div className="space-y-2 border border-[#E8E5DC] bg-[#FAF9F6] p-6 text-center">
            <Clock className="mx-auto h-6 w-6 text-[#C5A880]" />
            <h3 className="font-serif text-sm text-[#1A1A1A]">Schnelle Abwicklung</h3>
            <p className="text-[11px] text-[#6B6B6B]">
              Versand innerhalb von 24h nach Echtheitsprüfung.
            </p>
          </div>
        </div>

        {/* Shipping Rates Table */}
        <div className="space-y-4">
          <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
            Versandkosten & Lieferzeiten Übersicht
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E5DC] bg-[#FAF9F6] font-mono text-[10px] text-[#6B6B6B] uppercase">
                  <th className="p-4">Zielland</th>
                  <th className="p-4">Versandart</th>
                  <th className="p-4">Lieferzeit</th>
                  <th className="p-4 text-right">Versandkosten</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DC]">
                {rates.map((r, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-[#FAF9F6]/80">
                    <td className="p-4 font-medium text-[#1A1A1A]">
                      <span className="mr-2">{r.flag}</span> {r.country}
                    </td>
                    <td className="p-4 text-[#6B6B6B]">DHL Express Werttransport</td>
                    <td className="p-4 font-mono text-[#1A1A1A]">{r.time}</td>
                    <td className="p-4 text-right font-mono font-semibold text-[#1A1A1A]">
                      {r.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
