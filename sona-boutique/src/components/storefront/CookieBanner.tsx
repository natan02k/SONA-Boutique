"use client";

import { useEffect, useState } from "react";
import { getConsent, setConsent, Consent } from "@/lib/consent";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ShieldCheck, Settings, X, Check } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) {
      setShowBanner(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent({ analytics: true, marketing: true });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleAcceptEssential = () => {
    setConsent({ analytics: false, marketing: false });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSaveCustom = () => {
    setConsent({ analytics, marketing });
    setShowBanner(false);
    setShowModal(false);
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Bottom Floating Banner */}
      {showBanner && !showModal && (
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#C5A880] bg-[#1A1A1A] p-4 text-[#FAF9F6] shadow-2xl sm:p-6">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex-1 space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center gap-1.5 text-[#C5A880] md:justify-start">
                <ShieldCheck className="h-4 w-4" />
                <span className="label-luxury text-[10px]">Privatsphäre & Transparenz</span>
              </div>
              <p className="max-w-3xl text-xs leading-relaxed text-[#E8E5DC]">
                Wir nutzen Cookies, um Ihr Einkaufserlebnis zu personalisieren. Essenzielle Cookies
                sind für den Betrieb des Shops zwingend erforderlich. Optionale Analytics-Cookies
                helfen uns, das Angebot fortlaufend zu verbessern.
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1 px-3 py-2 font-mono text-xs text-[#6B6B6B] transition-colors hover:text-[#FAF9F6]"
              >
                <Settings className="h-3.5 w-3.5" /> Einstellungen
              </button>

              <LuxuryButton onClick={handleAcceptEssential} variant="outline" size="sm">
                Nur Essenzielle
              </LuxuryButton>

              <LuxuryButton onClick={handleAcceptAll} variant="gold" size="sm">
                Alle Akzeptieren
              </LuxuryButton>
            </div>
          </div>
        </div>
      )}

      {/* Detail Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 p-4">
          <div className="w-full max-w-lg space-y-6 border border-[#E8E5DC] bg-white p-6 text-[#1A1A1A]">
            <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
              <h3 className="font-serif text-xl text-[#1A1A1A]">Cookie-Einstellungen</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#6B6B6B] hover:text-[#1A1A1A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category 1: Essentiell */}
              <div className="flex items-center justify-between gap-4 border border-[#E8E5DC] bg-[#FAF9F6] p-4">
                <div>
                  <span className="block font-semibold text-[#1A1A1A]">Essenzielle Cookies</span>
                  <span className="mt-0.5 block text-[11px] text-[#6B6B6B]">
                    Notwendig für Warenkorb, Sitzungen und Sicherheits-Tokens (`SameSite=Strict`).
                  </span>
                </div>
                <span className="label-luxury flex-shrink-0 border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] text-[#15803D]">
                  Immer Aktiv
                </span>
              </div>

              {/* Category 2: Analytics */}
              <div className="flex items-center justify-between gap-4 border border-[#E8E5DC] p-4">
                <div>
                  <span className="block font-semibold text-[#1A1A1A]">
                    Analytics & Performance
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#6B6B6B]">
                    Hilft uns zu verstehen, welche Handtaschen und Marken am beliebtesten sind.
                  </span>
                </div>
                <label className="relative inline-flex flex-shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-[#E8E5DC] peer-checked:bg-[#C5A880] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              {/* Category 3: Marketing */}
              <div className="flex items-center justify-between gap-4 border border-[#E8E5DC] p-4">
                <div>
                  <span className="block font-semibold text-[#1A1A1A]">
                    Marketing & Personalisierung
                  </span>
                  <span className="mt-0.5 block text-[11px] text-[#6B6B6B]">
                    Ermöglicht personalisierte Empfehlungen für seltene Collector Pieces.
                  </span>
                </div>
                <label className="relative inline-flex flex-shrink-0 cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-5 w-9 rounded-full bg-[#E8E5DC] peer-checked:bg-[#C5A880] peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleAcceptEssential}
                className="px-4 py-2 text-xs text-[#6B6B6B]"
              >
                Nur Essenzielle
              </button>
              <LuxuryButton onClick={handleSaveCustom} variant="gold" size="sm">
                <Check className="mr-1.5 h-4 w-4" /> Auswahl Speichern
              </LuxuryButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
