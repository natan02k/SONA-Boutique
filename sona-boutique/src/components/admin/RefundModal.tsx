"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { AlertTriangle, X } from "lucide-react";

type RefundModalProps = {
  orderId: string;
  orderTotalCents: number;
  partialRefundCents: number;
  onClose: () => void;
};

export function RefundModal({
  orderId,
  orderTotalCents,
  partialRefundCents,
  onClose,
}: RefundModalProps) {
  const router = useRouter();
  const [type, setType] = useState<"FULL" | "PARTIAL">("FULL");
  const [amountEuro, setAmountEuro] = useState("");
  const [reason, setReason] = useState<"Kundenanfrage" | "Widerruf" | "Defekt" | "Andere">(
    "Kundenanfrage",
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const remainingRefundableCents = orderTotalCents - partialRefundCents;
  const remainingEuro = (remainingRefundableCents / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        type,
        amountEuro: type === "PARTIAL" ? parseFloat(amountEuro) : undefined,
        reason,
      };

      const res = await fetch(`/api/admin/orders/${orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fehler bei der Rückerstattung.");
      }

      onClose();
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Fehler beim Verarbeiten.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 border border-[#E8E5DC] bg-white p-6"
      >
        <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
          <h3 className="font-serif text-xl text-[#1A1A1A]">Rückerstattung Veranlassen</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6B6B6B] hover:text-[#1A1A1A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="border border-[#B91C1C]/30 bg-[#B91C1C]/10 p-3 text-xs text-[#B91C1C]">
            {errorMsg}
          </div>
        )}

        {/* Type Selection */}
        <div className="space-y-1">
          <label className="label-luxury block text-[10px]">Erstattungsart</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("FULL")}
              className={`border py-2 font-mono text-xs uppercase transition-colors ${
                type === "FULL"
                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-[#FAF9F6]"
                  : "border-[#E8E5DC] bg-[#FAF9F6] text-[#6B6B6B]"
              }`}
            >
              Vollständig ({remainingEuro} €)
            </button>
            <button
              type="button"
              onClick={() => setType("PARTIAL")}
              className={`border py-2 font-mono text-xs uppercase transition-colors ${
                type === "PARTIAL"
                  ? "border-[#1A1A1A] bg-[#1A1A1A] text-[#FAF9F6]"
                  : "border-[#E8E5DC] bg-[#FAF9F6] text-[#6B6B6B]"
              }`}
            >
              Partiell
            </button>
          </div>
        </div>

        {/* Amount Input for Partial */}
        {type === "PARTIAL" && (
          <div className="space-y-1">
            <label className="label-luxury block text-[10px]">
              Erstattungsbetrag (€) (Max: {remainingEuro} €)
            </label>
            <input
              type="number"
              step="0.01"
              required
              max={remainingEuro}
              placeholder="z.B. 150.00"
              value={amountEuro}
              onChange={(e) => setAmountEuro(e.target.value)}
              className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
            />
          </div>
        )}

        {/* Reason Select */}
        <div className="space-y-1">
          <label className="label-luxury block text-[10px]">Grund der Erstattung *</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value as any)}
            className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="Kundenanfrage">Kundenanfrage</option>
            <option value="Widerruf">Widerruf (14 Tage)</option>
            <option value="Defekt">Defekt / Abweichung</option>
            <option value="Andere">Sonstiges</option>
          </select>
        </div>

        {/* Warning Notice */}
        <div className="space-y-1 border border-[#C5A880]/50 bg-[#FAF4EB] p-3 text-[10px] text-[#6B6B6B]">
          <div className="flex items-center gap-1.5 font-semibold text-[#C5A880]">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Finanz-Hinweis:</span>
          </div>
          {type === "FULL" ? (
            <p>
              Bei einer VOLLEN Rückerstattung wird der Lagerbestand der Tasche automatisch
              restauriert.
            </p>
          ) : (
            <p>
              Bei einer PARTIELLEN Rückerstattung verbleibt die Tasche beim Kunden. Das Lager wird
              NICHT restauriert.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs text-[#6B6B6B]">
            Abbrechen
          </button>
          <LuxuryButton type="submit" disabled={loading} variant="gold" size="sm">
            {loading ? "Wird gebucht..." : "Rückerstattung Buchen"}
          </LuxuryButton>
        </div>
      </form>
    </div>
  );
}
