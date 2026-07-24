"use client";

import { useEffect, useState } from "react";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { Plus, Tag, Trash2, CheckCircle2, XCircle } from "lucide-react";

type PromoCode = {
  id: string;
  code: string;
  description?: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrderCents: number;
  usageLimit?: number | null;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
};

export default function AdminPromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [newCode, setNewCode] = useState({
    code: "",
    description: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: 10,
    minOrderEuro: 500,
    usageLimit: 100,
    isActive: true,
  });

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/promo-codes");
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.promoCodes || []);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Promo-Codes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        code: newCode.code.toUpperCase(),
        description: newCode.description,
        type: newCode.type,
        value: newCode.type === "PERCENTAGE" ? newCode.value : newCode.value * 100,
        minOrderCents: newCode.minOrderEuro * 100,
        usageLimit: newCode.usageLimit || null,
        isActive: newCode.isActive,
      };

      const res = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setNewCode({
          code: "",
          description: "",
          type: "PERCENTAGE",
          value: 10,
          minOrderEuro: 500,
          usageLimit: 100,
          isActive: true,
        });
        loadPromoCodes();
      }
    } catch (err) {
      console.error("Fehler beim Erstellen des Promo-Codes", err);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Möchten Sie den Gutscheincode "${code}" wirklich löschen?`)) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadPromoCodes();
      }
    } catch (err) {
      console.error("Fehler beim Löschen des Promo-Codes", err);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentActive }),
      });
      if (res.ok) {
        loadPromoCodes();
      }
    } catch (err) {
      console.error("Fehler beim Umschalten des Status", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DC] pb-6">
        <div>
          <span className="label-luxury text-xs">Aktionen & Rabatte</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Gutscheincodes</h1>
        </div>

        <LuxuryButton onClick={() => setShowModal(true)} variant="gold" size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Code Erstellen
        </LuxuryButton>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-[#E8E5DC] bg-white">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-[#6B6B6B]">
            Gutscheincodes werden geladen...
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B6B6B]">
            Noch keine Gutscheincodes vorhanden.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E5DC] bg-[#FAF9F6] font-mono text-[10px] text-[#6B6B6B] uppercase">
                <th className="p-4">Code</th>
                <th className="p-4">Typ / Rabatt</th>
                <th className="p-4">Mindestbestellwert</th>
                <th className="p-4">Nutzung</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {promoCodes.map((promo) => (
                <tr key={promo.id} className="transition-colors hover:bg-[#FAF9F6]/80">
                  <td className="p-4 font-mono font-semibold text-[#1A1A1A]">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#C5A880]" />
                      <span>{promo.code}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-medium">
                    {promo.type === "PERCENTAGE"
                      ? `${promo.value}%`
                      : `${(promo.value / 100).toFixed(2)} €`}
                  </td>
                  <td className="p-4 font-mono text-[#6B6B6B]">
                    {(promo.minOrderCents / 100).toLocaleString("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </td>
                  <td className="p-4 font-mono text-[#6B6B6B]">
                    {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ""}
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(promo.id, promo.isActive)}>
                      <LuxuryBadge variant={promo.isActive ? "green" : "red"}>
                        {promo.isActive ? "Aktiv" : "Inaktiv"}
                      </LuxuryBadge>
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(promo.id, promo.code)}
                      className="p-1.5 text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/60 p-4">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md space-y-4 border border-[#E8E5DC] bg-white p-6"
          >
            <h3 className="font-serif text-xl text-[#1A1A1A]">Neuen Gutscheincode Erstellen</h3>

            <div className="space-y-1">
              <label className="label-luxury block text-[10px]">Gutscheincode *</label>
              <input
                type="text"
                required
                placeholder="z.B. SUMMER2026"
                value={newCode.code}
                onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] uppercase focus:border-[#C5A880] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Typ *</label>
                <select
                  value={newCode.type}
                  onChange={(e) => setNewCode({ ...newCode, type: e.target.value as any })}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="PERCENTAGE">Prozent (%)</option>
                  <option value="FIXED">Festbetrag (€)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">
                  Wert ({newCode.type === "PERCENTAGE" ? "%" : "€"}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={newCode.value}
                  onChange={(e) => setNewCode({ ...newCode, value: parseFloat(e.target.value) })}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Mindestbestellwert (€)</label>
                <input
                  type="number"
                  min={0}
                  value={newCode.minOrderEuro}
                  onChange={(e) =>
                    setNewCode({ ...newCode, minOrderEuro: parseFloat(e.target.value) })
                  }
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="label-luxury block text-[10px]">Max. Nutzungen</label>
                <input
                  type="number"
                  min={1}
                  value={newCode.usageLimit}
                  onChange={(e) => setNewCode({ ...newCode, usageLimit: parseInt(e.target.value) })}
                  className="w-full border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-2 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 text-xs text-[#6B6B6B]"
              >
                Abbrechen
              </button>
              <LuxuryButton type="submit" variant="gold" size="sm" className="flex-1">
                Erstellen
              </LuxuryButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
