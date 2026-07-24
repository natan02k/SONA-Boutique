"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { CheckCircle2, XCircle, Banknote, ShieldCheck } from "lucide-react";

export default function OfferAcceptancePage() {
  const { requestId } = useParams() as { requestId: string };
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);
  const [actionState, setActionState] = useState<"ACCEPTED" | "REJECTED" | null>(null);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const res = await fetch(`/api/consignment-requests/${requestId}`);
        if (res.ok) {
          const data = await res.json();
          setRequest(data.request);
          if (data.request.status === "ACCEPTED" || data.request.status === "REJECTED") {
            setActionState(data.request.status);
          }
        }
      } catch (err) {
        console.error("Failed to fetch consignment request:", err);
      } finally {
        setLoading(false);
      }
    }
    if (requestId) fetchRequest();
  }, [requestId]);

  const handleRespond = async (status: "ACCEPTED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/consignment-requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: status }),
      });

      if (res.ok) {
        setActionState(status);
      }
    } catch (err) {
      console.error("Failed to respond to offer:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] p-8">
        <p className="font-mono text-xs text-[#6B6B6B]">Angebot wird geladen...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center space-y-4 bg-[#FAF9F6] p-8 text-center">
        <div className="w-full max-w-md space-y-3 border border-[#E8E5DC] bg-white p-8">
          <h2 className="font-serif text-xl text-[#1A1A1A]">Angebot Nicht Gefunden</h2>
          <p className="text-xs text-[#6B6B6B]">
            Die angeforderte Anfragereferenz ist ungültig oder abgelaufen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-8 border border-[#E8E5DC] bg-white p-8 sm:p-12">
        <div className="space-y-2 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">SONA Concierge Angebot</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Wertangebot Prüfen</h1>
          <GoldDivider />
          <p className="font-mono text-xs text-[#6B6B6B]">Referenz: {request.id}</p>
        </div>

        {/* Product Details */}
        <div className="space-y-3 border border-[#E8E5DC] bg-[#FAF9F6] p-6 text-xs">
          <div className="flex justify-between border-b border-[#E8E5DC] pb-2 font-medium">
            <span className="text-[#6B6B6B]">Objekt:</span>
            <span className="font-semibold text-[#1A1A1A]">
              {request.brandName} {request.modelName}
            </span>
          </div>
          <div className="flex justify-between text-[#6B6B6B]">
            <span>Geschätzter Zustand:</span>
            <span className="font-mono text-[#1A1A1A]">{request.estimatedCondition}</span>
          </div>
        </div>

        {/* Offer Box */}
        <div className="space-y-3 border-2 border-[#C5A880] bg-white p-8 text-center">
          <span className="label-luxury text-xs text-[#C5A880]">
            {request.offeredType === "SALE" ? "Sofortankauf-Angebot" : "Kommissions-Angebot"}
          </span>
          <h2 className="font-serif text-3xl font-light text-[#1A1A1A]">
            {request.offeredPriceCents
              ? (request.offeredPriceCents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })
              : `${((request.commissionRate || 0.25) * 100).toFixed(0)}% Kommissionsgebühr`}
          </h2>
          <p className="text-xs text-[#6B6B6B]">
            {request.offeredType === "SALE"
              ? "Direkte Überweisung nach Wareneingang & Prüfung im Tresor."
              : "Verkaufserlös nach erfolgreicher Vermittlung an VIP-Kunden."}
          </p>
        </div>

        {/* Action Controls */}
        {actionState === "ACCEPTED" ? (
          <div className="space-y-2 border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-900">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <h3 className="font-serif text-lg">Angebot Angenommen</h3>
            <p className="text-xs text-emerald-800">
              Vielen Dank! Wir haben Ihre Zusage erhalten und übersenden Ihnen in Kürze Ihr
              vollversichertes DHL Express Versandetikett per E-Mail.
            </p>
          </div>
        ) : actionState === "REJECTED" ? (
          <div className="space-y-2 border border-gray-200 bg-gray-50 p-6 text-center text-gray-800">
            <XCircle className="mx-auto h-8 w-8 text-gray-500" />
            <h3 className="font-serif text-lg">Angebot Abgelehnt</h3>
            <p className="text-xs text-gray-600">
              Vielen Dank für Ihre Rückmeldung. Sollten sich Ihre Vorstellungen ändern, können Sie
              sich jederzeit erneut an uns wenden.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <button
              onClick={() => handleRespond("REJECTED")}
              className="w-full border border-gray-300 py-3 font-mono text-xs text-gray-600 uppercase hover:bg-gray-50 sm:w-1/2"
            >
              Angebot Ablehnen
            </button>
            <LuxuryButton
              onClick={() => handleRespond("ACCEPTED")}
              variant="gold"
              size="lg"
              className="w-full sm:w-1/2"
            >
              Angebot Annehmen & Etikett Anfordern
            </LuxuryButton>
          </div>
        )}
      </div>
    </div>
  );
}
