"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { RefundModal } from "@/components/admin/RefundModal";
import { CARRIER_OPTIONS } from "@/lib/tracking";
import { Truck, CheckCircle2, XCircle, RotateCcw } from "lucide-react";

type AdminOrderActionsProps = {
  orderId: string;
  currentStatus: string;
  paymentStatus?: string;
  orderTotalCents?: number;
  partialRefundCents?: number;
};

export function AdminOrderActions({
  orderId,
  currentStatus,
  paymentStatus = "PAID",
  orderTotalCents = 0,
  partialRefundCents = 0,
}: AdminOrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [carrier, setCarrier] = useState("DHL Express");
  const [trackingNo, setTrackingNo] = useState("");

  const updateStatus = async (fulfillmentStatus: string, extraData: any = {}) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fulfillmentStatus, ...extraData }),
      });

      if (res.ok) {
        setShowShipModal(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Fehler beim Aktualisieren des Bestellstatus", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (
      !confirm(
        "Möchten Sie diese Bestellung wirklich stornieren? Der Lagerbestand der Artikel wird automatisch wiederhergestellt.",
      )
    )
      return;
    await updateStatus("CANCELLED");
  };

  return (
    <div className="space-y-4 border border-[#E8E5DC] bg-white p-6">
      <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
        Bestellaktionen
      </h3>

      <div className="space-y-2">
        {currentStatus === "PENDING" && (
          <LuxuryButton
            onClick={() => setShowShipModal(true)}
            disabled={loading}
            variant="gold"
            size="sm"
            className="w-full"
          >
            <Truck className="mr-2 h-4 w-4" /> Als Versendet Markieren
          </LuxuryButton>
        )}

        {currentStatus === "SHIPPED" && (
          <LuxuryButton
            onClick={() => updateStatus("DELIVERED")}
            disabled={loading}
            variant="gold"
            size="sm"
            className="w-full"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" /> Als Zugestellt Markieren
          </LuxuryButton>
        )}

        {(paymentStatus === "PAID" || paymentStatus === "PARTIALLY_REFUNDED") && (
          <LuxuryButton
            onClick={() => setShowRefundModal(true)}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RotateCcw className="mr-2 h-4 w-4 text-[#C5A880]" /> Rückerstattung Veranlassen
          </LuxuryButton>
        )}

        {currentStatus !== "CANCELLED" && (
          <LuxuryButton
            onClick={handleCancelOrder}
            disabled={loading}
            variant="dark"
            size="sm"
            className="w-full text-[#B91C1C] hover:border-[#B91C1C]"
          >
            <XCircle className="mr-2 h-4 w-4" /> Bestellung Stornieren
          </LuxuryButton>
        )}
      </div>

      {/* Shipping Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 p-4">
          <div className="w-full max-w-md space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h4 className="font-serif text-lg text-[#1A1A1A]">Versandbestätigung & Verfolgung</h4>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Versanddienstleister</label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              >
                {CARRIER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Sendungsverfolgungs-Nr.</label>
              <input
                type="text"
                placeholder="z.B. JJD000300000000"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowShipModal(false)}
                className="px-3 py-1.5 text-xs text-[#6B6B6B]"
              >
                Abbrechen
              </button>
              <LuxuryButton
                onClick={() => updateStatus("SHIPPED", { carrier, trackingNo })}
                disabled={loading}
                variant="gold"
                size="sm"
              >
                Bestätigen
              </LuxuryButton>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <RefundModal
          orderId={orderId}
          orderTotalCents={orderTotalCents}
          partialRefundCents={partialRefundCents}
          onClose={() => setShowRefundModal(false)}
        />
      )}
    </div>
  );
}
