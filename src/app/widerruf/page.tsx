"use client";

import { useState } from "react";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { RotateCcw, Printer, CheckCircle2 } from "lucide-react";

export default function WiderrufPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    orderNumber: "",
    name: "",
    email: "",
    returnReason: "Widerruf innerhalb 14 Tagen",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-12 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        {/* Header */}
        <div className="space-y-3 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">Verbraucherrechte</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
            Widerrufsbelehrung
          </h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">
            14 Tage Widerrufsrecht gemäß Art. 246a § 1 EGBGB
          </p>
        </div>

        {/* Belehrung */}
        <div className="space-y-8 text-xs leading-relaxed text-[#1A1A1A]">
          <section className="space-y-3 border-b border-[#E8E5DC] pb-6">
            <h2 className="font-serif text-xl font-normal text-[#1A1A1A]">Widerrufsrecht</h2>
            <p className="text-[#4A4A4A]">
              Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu
              widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein
              von Ihnen benannter Dritter, der nicht der Beförderer ist, die Waren in Besitz
              genommen haben.
            </p>
            <p className="text-[#4A4A4A]">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (SONA Boutique GmbH, Maximilianstraße
              12, 80539 München, E-Mail: support@sona-boutique.de) mittels einer eindeutigen
              Erklärung (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss,
              diesen Vertrag zu widerrufen, informieren.
            </p>
          </section>

          <section className="space-y-3 border-b border-[#E8E5DC] pb-6">
            <h2 className="font-serif text-xl font-normal text-[#1A1A1A]">Folgen des Widerrufs</h2>
            <p className="text-[#4A4A4A]">
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen
              erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten,
              die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns
              angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens
              binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren
              Widerruf dieses Vertrags bei uns eingegangen ist.
            </p>
            <p className="text-[#4A4A4A]">
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
              ursprünglichen Transaktion eingesetzt haben (Stripe Refund). Wir können die
              Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben und die
              Qualitäts- & Echtheitsprüfung im Tresor abgeschlossen ist.
            </p>
          </section>

          <section className="space-y-3 border-b border-[#E8E5DC] pb-6">
            <h2 className="font-serif text-xl font-normal text-[#1A1A1A]">
              Rücksendebedingungen & Transportversicherung
            </h2>
            <p className="text-[#4A4A4A]">
              Sie tragen die unmittelbaren Kosten der Rücksendung der Waren. Aufgrund des hohen
              Wertes unserer Luxusgüter (&gt; 500 €) verpflichten Sie sich, die Rücksendung
              ausschließlich als <strong>vollversichertes Paket mit Sendungsverfolgung</strong>{" "}
              vorzunehmen.
            </p>
          </section>

          {/* Muster-Widerrufsformular Section */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
              <h2 className="font-serif text-xl font-normal text-[#1A1A1A]">
                Muster-Widerrufsformular
              </h2>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 font-mono text-[10px] text-[#C5A880] uppercase hover:underline"
              >
                <Printer className="h-3.5 w-3.5" /> Drucken
              </button>
            </div>

            {submitted ? (
              <div className="space-y-2 border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
                <h3 className="font-serif text-base font-medium">
                  Widerruf erfolgreich übermittelt
                </h3>
                <p className="text-xs">
                  Vielen Dank. Wir haben Ihren Widerruf für die Bestellung{" "}
                  <strong>{form.orderNumber}</strong> erhalten und senden Ihnen in Kürze die
                  Rücksende-Instruktionen per E-Mail.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 border border-[#E8E5DC] bg-[#FAF9F6] p-6"
              >
                <p className="text-[11px] text-[#6B6B6B]">
                  Wenn Sie den Vertrag widerrufen wollen, füllen Sie bitte dieses Formular aus:
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Bestellnummer *</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. SONA-2026-10001"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Vollständiger Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Max Mustermann"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="label-luxury block text-[10px]">E-Mail-Adresse *</label>
                    <input
                      type="email"
                      required
                      placeholder="kunde@beispiel.de"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-white px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <LuxuryButton type="submit" variant="gold" size="sm">
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Widerruf Einreichen
                  </LuxuryButton>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
