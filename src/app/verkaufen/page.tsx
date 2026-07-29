"use client";

import { useState, useEffect } from "react";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  ShieldCheck,
  Banknote,
  Tag,
  ArrowRight,
  CheckCircle2,
  UploadCloud,
  Plus,
  Trash2,
} from "lucide-react";

type BrandOption = { name: string; slug: string };

export default function VerkaufenPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [photos, setPhotos] = useState<string[]>([""]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    brandName: "Hermès",
    modelName: "",
    estimatedCondition: "VERY_GOOD",
    desiredType: "UNDECIDED",
    description: "",
  });

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (data.brands) {
          setBrands(data.brands.map((b: { name: string; slug: string }) => ({ name: b.name, slug: b.slug })));
        }
      })
      .catch(() => {});
  }, []);

  const handleAddPhotoField = () => {
    if (photos.length < 10) {
      setPhotos([...photos, ""]);
    }
  };

  const handleRemovePhotoField = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePhotoUrlChange = (index: number, value: string) => {
    const updated = [...photos];
    updated[index] = value;
    setPhotos(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    const validPhotoUrls = photos.map((p) => p.trim()).filter((p) => p.length > 0);
    if (validPhotoUrls.length === 0) {
      setErrorMessage("Bitte fügen Sie mindestens ein Foto (Bild-URL) ein.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/consignment-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          photos: validPhotoUrls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fehler beim Absenden der Anfrage");
      }

      setSubmittedId(data.requestId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Ein unerwarteter Fehler ist aufgetreten.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24">
      {/* Editorial Hero */}
      <section className="relative border-b border-[#C5A880]/30 bg-[#1A1A1A] px-4 py-24 text-center text-[#FAF9F6] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <span className="label-luxury text-xs text-[#C5A880]">SONA Concierge Service</span>
          <h1 className="font-serif text-4xl font-light tracking-wide sm:text-5xl">
            Verkaufen Sie Ihre Luxushandtasche
          </h1>
          <GoldDivider />
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-[#E8E5DC]">
            Holen Sie den maximalen Wert aus Ihren Collector Pieces. Wir bieten Sofortankauf mit
            direkter Auszahlung oder Premium-Konsignation mit höchster Erlöschance.
          </p>
        </div>
      </section>

      <div className="mx-auto mt-16 max-w-5xl space-y-16 px-4 sm:px-6 lg:px-8">
        {/* Model Options Comparison */}
        <RevealOnScroll>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Option 1: Sofortankauf */}
            <div className="relative space-y-4 border border-[#E8E5DC] bg-white p-8">
              <div className="flex items-center gap-2 text-[#C5A880]">
                <Banknote className="h-5 w-5" />
                <span className="label-luxury text-xs">Option 01</span>
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A]">Direct Buy (Sofortankauf)</h3>
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                Schnelle & unkomplizierte Abwicklung. Nach Eingang und Echtheitsprüfung im Tresor
                überweisen wir Ihren Festpreis innerhalb von 24 Stunden direkt auf Ihr Bankkonto.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#1A1A1A]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Sofortige Auszahlung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kein Verkaufsrisiko
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kostenfreier DHL Express
                  Transport
                </li>
              </ul>
            </div>

            {/* Option 2: Konsignation */}
            <div className="relative space-y-4 border border-[#C5A880] bg-white p-8 shadow-md">
              <div className="flex items-center gap-2 text-[#C5A880]">
                <Tag className="h-5 w-5" />
                <span className="label-luxury text-xs">Option 02 (Empfohlen)</span>
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A]">Consignment (Kommission)</h3>
              <p className="text-xs leading-relaxed text-[#6B6B6B]">
                Maximaler Erlös für seltene Sammlerstücke. Wir präsentieren Ihre Handtasche unserem
                exklusiven VIP-Kundenstamm im Online-Shop und zahlen Sie nach Verkauf aus.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-[#1A1A1A]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C5A880]" /> Bis zu 80% des Verkaufserlöses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C5A880]" /> Professionelle Fotografie &
                  Authentifizierung
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#C5A880]" /> Tresor-Lagerung & Versicherung
                  inklusive
                </li>
              </ul>
            </div>
          </div>
        </RevealOnScroll>

        {/* Submission Form Section */}
        <RevealOnScroll>
          <div className="space-y-8 border border-[#E8E5DC] bg-white p-8 sm:p-12">
            <div className="space-y-2 text-center">
              <span className="label-luxury text-xs text-[#C5A880]">Unverbindliche Anfrage</span>
              <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">
                Tasche Jetzt Bewerten Lassen
              </h2>
              <p className="text-xs text-[#6B6B6B]">
                Füllen Sie das Formular aus. Wir melden uns binnen 48 Stunden mit einem
                verbindlichen Angebot.
              </p>
            </div>

            {submittedId ? (
              <div className="space-y-3 border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-900">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <h3 className="font-serif text-xl">Vielen Dank für Ihre Anfrage!</h3>
                <p className="mx-auto max-w-md text-xs text-emerald-800">
                  Ihre Einreichung wurde erfolgreich unter der Referenz-Nummer{" "}
                  <strong className="font-mono">{submittedId}</strong> registriert. Sie erhalten in
                  Kürze eine Eingangsbestätigung per E-Mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                    {errorMessage}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Vorname *</label>
                    <input
                      type="text"
                      required
                      placeholder="Victoria"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Nachname *</label>
                    <input
                      type="text"
                      required
                      placeholder="Beckham"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">E-Mail-Adresse *</label>
                    <input
                      type="email"
                      required
                      placeholder="victoria@beispiel.de"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">
                      Telefonnummer (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+49 170 1234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-[#E8E5DC] pt-6 text-xs sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Marke *</label>
                    <select
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    >
                      {brands.length > 0 ? (
                        brands.map((b) => (
                          <option key={b.slug} value={b.name}>
                            {b.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Marken werden geladen…</option>
                      )}
                      <option value="Andere">Andere Luxusmarke</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Modellbezeichnung *</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Birkin 30 Togo Gold Hardware"
                      value={formData.modelName}
                      onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="label-luxury block text-[10px]">Geschätzter Zustand *</label>
                    <select
                      value={formData.estimatedCondition}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedCondition: e.target.value })
                      }
                      className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                    >
                      <option value="PRISTINE">PRISTINE (Ungetragen, Neuwertig)</option>
                      <option value="EXCELLENT">EXCELLENT (Neuwertig, minimale Spuren)</option>
                      <option value="VERY_GOOD">VERY_GOOD (Sehr gut erhalten)</option>
                      <option value="GOOD">GOOD (Guter Zustand mit sichtbaren Tragespuren)</option>
                    </select>
                  </div>
                </div>

                {/* Photo URLs Input List */}
                <div className="space-y-3 border-t border-[#E8E5DC] pt-6">
                  <div className="flex items-center justify-between">
                    <label className="label-luxury block text-[10px]">Fotos (Bild-URLs) *</label>
                    <button
                      type="button"
                      onClick={handleAddPhotoField}
                      className="flex items-center gap-1 font-mono text-[10px] text-[#C5A880] hover:underline"
                    >
                      <Plus className="h-3 w-3" /> Foto Hinzufügen
                    </button>
                  </div>

                  {photos.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... oder Cloudinary URL"
                        value={url}
                        onChange={(e) => handlePhotoUrlChange(idx, e.target.value)}
                        className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                      />
                      {photos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoField(idx)}
                          className="p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="label-luxury block text-[10px]">Beschreibung & Zubehör *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Bitte geben Sie Kaufjahr, Zubehör (Box, Staubbeutel, Rechnung) sowie bekannte Tragespuren an."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-[#E8E5DC] bg-[#FAF9F6] p-3 text-xs focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <LuxuryButton
                    type="submit"
                    disabled={submitting}
                    variant="gold"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    {submitting
                      ? "Anfrage wird übermittelt..."
                      : "Unverbindliche Anfrage Einreichen"}
                  </LuxuryButton>
                </div>
              </form>
            )}
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
