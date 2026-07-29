"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { Search, Eye, Filter, RotateCcw } from "lucide-react";

type Order = {
  id: string;
  number: string;
  email: string;
  firstName: string;
  lastName: string;
  totalCents: number;
  paymentStatus: string;
  fulfillmentStatus: string;
  placedAt: string;
  items: Array<{ id: string; title: string }>;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (fulfillmentFilter) params.set("fulfillmentStatus", fulfillmentFilter);
      if (paymentFilter) params.set("paymentStatus", paymentFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Admin-Bestellungen", err);
    } finally {
      setLoading(false);
    }
  }, [search, fulfillmentFilter, paymentFilter, page]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-6">
        <div>
          <span className="label-luxury text-xs">Bestellverwaltung</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Bestellungen</h1>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#E8E5DC] bg-white p-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              placeholder="Suche nach Bestell-Nr., E-Mail oder Name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-[#E8E5DC] bg-[#FAF9F6] py-1.5 pr-3 pl-9 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
            />
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
          </div>

          <select
            value={fulfillmentFilter}
            onChange={(e) => {
              setFulfillmentFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="">Alle Versand-Status</option>
            <option value="PENDING">PENDING (Ausstehend)</option>
            <option value="SHIPPED">SHIPPED (Versendet)</option>
            <option value="DELIVERED">DELIVERED (Zugestellt)</option>
            <option value="CANCELLED">CANCELLED (Storniert)</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="">Alle Zahl-Status</option>
            <option value="PAID">PAID (Bezahlt)</option>
            <option value="PENDING">PENDING (Ausstehend)</option>
            <option value="REFUNDED">REFUNDED (Erstattet)</option>
          </select>

          {(search || fulfillmentFilter || paymentFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setFulfillmentFilter("");
                setPaymentFilter("");
                setPage(1);
              }}
              className="flex items-center gap-1 font-mono text-[10px] text-[#B91C1C] uppercase hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto border border-[#E8E5DC] bg-white">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-[#6B6B6B]">
            Bestellungen werden geladen...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B6B6B]">
            Keine Bestellungen für die gewählten Kriterien vorhanden.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E5DC] bg-[#FAF9F6] font-mono text-[10px] text-[#6B6B6B] uppercase">
                <th className="p-4">Bestell-Nr.</th>
                <th className="p-4">Kunde</th>
                <th className="p-4">Artikel</th>
                <th className="p-4">Gesamtsumme</th>
                <th className="p-4">Zahlung</th>
                <th className="p-4">Versand</th>
                <th className="p-4">Datum</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {orders.map((ord) => (
                <tr key={ord.id} className="transition-colors hover:bg-[#FAF9F6]/80">
                  <td className="p-4 font-mono font-semibold text-[#1A1A1A]">
                    <Link href={`/admin/orders/${ord.id}`} className="hover:text-[#C5A880]">
                      {ord.number}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-[#1A1A1A]">
                      {ord.firstName} {ord.lastName}
                    </p>
                    <p className="font-mono text-[10px] text-[#6B6B6B]">{ord.email}</p>
                  </td>
                  <td className="p-4 text-[#6B6B6B]">{ord.items.length} Position(en)</td>
                  <td className="p-4">
                    <PriceTag resalePriceCents={ord.totalCents} size="sm" />
                  </td>
                  <td className="p-4">
                    <LuxuryBadge variant={ord.paymentStatus === "PAID" ? "green" : "red"}>
                      {ord.paymentStatus}
                    </LuxuryBadge>
                  </td>
                  <td className="p-4">
                    <LuxuryBadge
                      variant={
                        ord.fulfillmentStatus === "DELIVERED"
                          ? "green"
                          : ord.fulfillmentStatus === "SHIPPED"
                            ? "gold"
                            : ord.fulfillmentStatus === "CANCELLED"
                              ? "red"
                              : "dark"
                      }
                    >
                      {ord.fulfillmentStatus}
                    </LuxuryBadge>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-[#6B6B6B]">
                    {new Date(ord.placedAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/orders/${ord.id}`}
                      className="inline-block p-1.5 text-[#6B6B6B] transition-colors hover:text-[#C5A880]"
                      title="Bestellung ansehen"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="border border-[#E8E5DC] bg-white px-4 py-2 font-mono text-xs disabled:opacity-30"
          >
            ← Vorherige
          </button>
          <span className="font-mono text-xs text-[#6B6B6B]">
            Seite {page} von {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="border border-[#E8E5DC] bg-white px-4 py-2 font-mono text-xs disabled:opacity-30"
          >
            Nächste →
          </button>
        </div>
      )}
    </div>
  );
}
