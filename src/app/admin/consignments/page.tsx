"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GoldDivider } from "@/components/luxury/GoldDivider";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { Tag, Eye, Filter, Plus } from "lucide-react";

export default function AdminConsignmentsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      try {
        const url =
          statusFilter !== "ALL"
            ? `/api/admin/consignment-requests?status=${statusFilter}`
            : `/api/admin/consignment-requests`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setRequests(data.requests);
        }
      } catch (err) {
        console.error("Failed to fetch consignment requests:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return <LuxuryBadge variant="gold">Eingereicht</LuxuryBadge>;
      case "OFFER_MADE":
        return <LuxuryBadge variant="stone">Angebot Erstellt</LuxuryBadge>;
      case "ACCEPTED":
        return (
          <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[9px] text-emerald-800">
            Angenommen
          </span>
        );
      case "REJECTED":
        return (
          <span className="border border-gray-200 bg-gray-100 px-2 py-0.5 font-mono text-[9px] text-gray-600">
            Abgelehnt
          </span>
        );
      case "ITEM_RECEIVED":
        return (
          <span className="border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-[9px] text-blue-800">
            Ware Erhalten
          </span>
        );
      case "LISTED":
        return (
          <span className="border border-purple-200 bg-purple-50 px-2 py-0.5 font-mono text-[9px] text-purple-800">
            Im Shop Online
          </span>
        );
      default:
        return <LuxuryBadge variant="default">{status}</LuxuryBadge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="label-luxury text-xs text-[#C5A880]">Ankauf & Kommission</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">
            Einreichungen & Angebote
          </h1>
        </div>
      </div>

      <GoldDivider />

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {["ALL", "SUBMITTED", "OFFER_MADE", "ACCEPTED", "ITEM_RECEIVED", "LISTED"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 font-mono text-[11px] uppercase transition-colors ${
              statusFilter === st
                ? "border border-[#C5A880] bg-[#1A1A1A] text-[#FAF9F6]"
                : "border border-[#E8E5DC] bg-white text-[#6B6B6B] hover:text-[#1A1A1A]"
            }`}
          >
            {st === "ALL" ? "Alle Anfragen" : st}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-[#E8E5DC] bg-white">
        {loading ? (
          <div className="p-8 text-center font-mono text-xs text-[#6B6B6B]">
            Anfragen werden geladen...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B6B6B]">
            Keine Einreichungen in dieser Kategorie gefunden.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8E5DC] bg-[#FAF9F6] font-mono text-[10px] text-[#6B6B6B] uppercase">
                  <th className="p-4">Einreicher / Kunde</th>
                  <th className="p-4">Marke & Modell</th>
                  <th className="p-4">Zustand</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Eingereicht Am</th>
                  <th className="p-4 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DC]">
                {requests.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-[#FAF9F6]/80">
                    <td className="p-4">
                      <p className="font-semibold text-[#1A1A1A]">
                        {r.consignor.firstName} {r.consignor.lastName}
                      </p>
                      <p className="font-mono text-[10px] text-[#6B6B6B]">{r.consignor.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-[#1A1A1A]">
                        {r.brandName} {r.modelName}
                      </p>
                      <p className="font-mono text-[10px] text-[#6B6B6B] uppercase">
                        {r.desiredType}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-[#6B6B6B]">{r.estimatedCondition}</td>
                    <td className="p-4">{getStatusBadge(r.status)}</td>
                    <td className="p-4 font-mono text-[#6B6B6B]">
                      {new Date(r.createdAt).toLocaleDateString("de-DE")}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/admin/consignments/${r.id}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#C5A880] uppercase hover:underline"
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
