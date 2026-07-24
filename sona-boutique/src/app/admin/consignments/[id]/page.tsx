"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { ArrowLeft, Send, CheckCircle2, Package, Tag, ExternalLink } from "lucide-react";

export default function AdminConsignmentDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<any>(null);

  const [offeredType, setOfferedType] = useState<"SALE" | "CONSIGNMENT">("SALE");
  const [offeredPriceEuro, setOfferedPriceEuro] = useState<string>("");
  const [commissionRatePercent, setCommissionRatePercent] = useState<string>("25");

  const [sendingOffer, setSendingOffer] = useState(false);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/admin/consignment-requests`);
        if (res.ok) {
          const data = await res.json();
          const found = data.requests.find((r: any) => r.id === id);
          if (found) {
            setRequest(found);
            if (found.offeredPriceCents) {
              setOfferedPriceEuro((found.offeredPriceCents / 100).toString());
            }
            if (found.commissionRate) {
              setCommissionRatePercent((found.commissionRate * 100).toString());
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch detail:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleSendOffer = async () => {
    setSendingOffer(true);
    setMessage(null);
    try {
      const offeredPriceCents =
        offeredType === "SALE" && offeredPriceEuro
          ? Math.round(parseFloat(offeredPriceEuro) * 100)
          : null;
      const commissionRate =
        offeredType === "CONSIGNMENT" && commissionRatePercent
          ? parseFloat(commissionRatePercent) / 100
          : null;

      const res = await fetch(`/api/admin/consignment-requests/${id}/send-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offeredType,
          offeredPriceCents,
          commissionRate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler beim Senden");

      setRequest(data.request);
      setMessage("Angebot wurde erfolgreich per E-Mail an den Einreicher gesendet.");
    } catch (err: any) {
      setMessage(err.message || "Fehler beim Senden des Angebots");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleMarkReceived = async () => {
    try {
      const res = await fetch(`/api/admin/consignment-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ITEM_RECEIVED",
          receivedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequest(data.request);
        setMessage("Ware wurde als im Tresor erhalten markiert.");
      }
    } catch (err) {
      console.error("Failed to mark received:", err);
    }
  };

  const handleConvertToProduct = async () => {
    setConverting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/consignment-requests/${id}/convert-to-product`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fehler bei der Umwandlung");

      setMessage("Erfolgreich in Produkt-Entwurf umgewandelt!");
      router.push(`/admin/products/${data.productId}`);
    } catch (err: any) {
      setMessage(err.message || "Fehler bei Produktumwandlung");
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#6B6B6B]">
        Anfragedetails werden geladen...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#6B6B6B]">
        Anfrage nicht gefunden.
      </div>
    );
  }

  let photos: string[] = [];
  try {
    photos = JSON.parse(request.photos);
  } catch {
    photos = [];
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div>
        <Link
          href="/admin/consignments"
          className="mb-2 flex items-center gap-1 font-mono text-[11px] text-[#6B6B6B] hover:text-[#1A1A1A]"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Zurück zur Übersicht
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="label-luxury text-xs text-[#C5A880]">Ref: {request.id}</span>
            <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">
              {request.brandName} {request.modelName}
            </h1>
          </div>
          <LuxuryBadge variant="gold">{request.status}</LuxuryBadge>
        </div>
      </div>

      <GoldDivider />

      {message && (
        <div className="border border-blue-200 bg-blue-50 p-4 font-mono text-xs text-blue-900">
          {message}
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Details (2 cols) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Photos */}
          <div className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg text-[#1A1A1A]">
              Eingereichte Fotogalerie ({photos.length})
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {photos.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden border border-[#E8E5DC] bg-[#FAF9F6]"
                >
                  <img
                    src={url}
                    alt={`Einreichung ${idx}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Item Info & Description */}
          <div className="space-y-4 border border-[#E8E5DC] bg-white p-6 text-xs">
            <h3 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg text-[#1A1A1A]">
              Objekt-Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">Marke</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{request.brandName}</p>
              </div>
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">Modell</p>
                <p className="text-sm font-semibold text-[#1A1A1A]">{request.modelName}</p>
              </div>
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">Zustand (Kunde)</p>
                <p className="font-mono text-[#1A1A1A]">{request.estimatedCondition}</p>
              </div>
              <div>
                <p className="label-luxury text-[9px] text-[#6B6B6B]">Wunsch-Typ</p>
                <p className="font-mono text-[#1A1A1A]">{request.desiredType}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="label-luxury text-[9px] text-[#6B6B6B]">Beschreibung & Zubehör</p>
              <p className="mt-1 border border-[#E8E5DC] bg-[#FAF9F6] p-3 leading-relaxed text-[#1A1A1A]">
                {request.description}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Offer Form (1 col) */}
        <div className="space-y-6">
          {/* Seller Info Card */}
          <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
            <h3 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg text-[#1A1A1A]">
              Einreicher Kontaktdaten
            </h3>
            <p className="text-sm font-bold text-[#1A1A1A]">
              {request.consignor.firstName} {request.consignor.lastName}
            </p>
            <p className="text-[#6B6B6B]">
              E-Mail: <span className="font-mono text-[#1A1A1A]">{request.consignor.email}</span>
            </p>
            {request.consignor.phone && (
              <p className="text-[#6B6B6B]">
                Telefon: <span className="font-mono text-[#1A1A1A]">{request.consignor.phone}</span>
              </p>
            )}
          </div>

          {/* Offer Creation Form */}
          <div className="space-y-4 border border-[#E8E5DC] bg-white p-6 text-xs">
            <h3 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg text-[#1A1A1A]">
              Angebot Erstellen & Senden
            </h3>

            <div className="space-y-2">
              <label className="label-luxury block text-[10px]">Angebots-Typ</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOfferedType("SALE")}
                  className={`flex-1 border py-2 font-mono text-xs ${offeredType === "SALE" ? "border-[#C5A880] bg-[#1A1A1A] text-[#FAF9F6]" : "bg-white text-[#6B6B6B]"}`}
                >
                  Sofortankauf
                </button>
                <button
                  type="button"
                  onClick={() => setOfferedType("CONSIGNMENT")}
                  className={`flex-1 border py-2 font-mono text-xs ${offeredType === "CONSIGNMENT" ? "border-[#C5A880] bg-[#1A1A1A] text-[#FAF9F6]" : "bg-white text-[#6B6B6B]"}`}
                >
                  Kommission
                </button>
              </div>
            </div>

            {offeredType === "SALE" ? (
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Ankaufspreis (€) *</label>
                <input
                  type="number"
                  placeholder="z.B. 4500"
                  value={offeredPriceEuro}
                  onChange={(e) => setOfferedPriceEuro(e.target.value)}
                  className="w-full border border-[#E8E5DC] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Kommissionssatz (%) *</label>
                <input
                  type="number"
                  placeholder="25"
                  value={commissionRatePercent}
                  onChange={(e) => setCommissionRatePercent(e.target.value)}
                  className="w-full border border-[#E8E5DC] px-3 py-2 text-xs focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            )}

            <LuxuryButton
              onClick={handleSendOffer}
              disabled={sendingOffer}
              variant="gold"
              size="sm"
              className="w-full"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {sendingOffer ? "Wird gesendet..." : "Angebot Per E-Mail Senden"}
            </LuxuryButton>
          </div>

          {/* Workflow Status Actions */}
          <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
            <h3 className="border-b border-[#E8E5DC] pb-2 font-serif text-lg text-[#1A1A1A]">
              Workflow Aktionen
            </h3>

            <button
              onClick={handleMarkReceived}
              className="flex w-full items-center justify-between border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-left text-[#1A1A1A] hover:border-[#C5A880]"
            >
              <span>Ware als Erhalten markieren</span>
              <Package className="h-4 w-4 text-[#C5A880]" />
            </button>

            <button
              onClick={handleConvertToProduct}
              disabled={converting}
              className="flex w-full items-center justify-between bg-[#1A1A1A] px-3 py-2 text-left font-mono text-[11px] text-[#FAF9F6] hover:bg-[#333333]"
            >
              <span>{converting ? "Wandle um..." : "In Produkt-Entwurf Umwandeln"}</span>
              <Tag className="h-4 w-4 text-[#C5A880]" />
            </button>

            {request.convertedProductId && (
              <Link
                href={`/admin/products/${request.convertedProductId}`}
                className="block pt-2 text-center font-mono text-[11px] text-[#C5A880] underline"
              >
                Zum Erstellten Produkt &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
