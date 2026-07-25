"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { Plus, Edit, Trash2, Search, Filter, RotateCcw } from "lucide-react";

type Product = {
  id: string;
  slug: string;
  title: string;
  sku: string;
  status: string;
  resalePriceCents: number;
  inventoryQuantity: number;
  brand: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string }>;
};

type Brand = { id: string; name: string; slug: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Brands for Filter
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await fetch("/api/brands");
        if (res.ok) {
          const data = await res.json();
          setBrands(data.brands || []);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Marken", err);
      }
    }
    fetchBrands();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      if (brandFilter) params.set("brand", brandFilter);
      params.set("page", page.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Admin-Produkte", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, brandFilter, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Möchten Sie das Produkt "${title}" wirklich archivieren?`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadProducts();
      }
    } catch (err) {
      console.error("Fehler beim Archivieren des Produkts", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DC] pb-6">
        <div>
          <span className="label-luxury text-xs">Produktverwaltung</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Produkte</h1>
        </div>

        <Link href="/admin/products/new">
          <LuxuryButton variant="gold" size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Neues Produkt
          </LuxuryButton>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#E8E5DC] bg-white p-4">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] flex-1">
            <input
              type="text"
              placeholder="Suche nach Titel oder SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full border border-[#E8E5DC] bg-[#FAF9F6] py-1.5 pr-3 pl-9 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
            />
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="">Alle Status</option>
            <option value="PUBLISHED">PUBLISHED (Aktiv)</option>
            <option value="DRAFT">DRAFT (Entwurf)</option>
            <option value="ARCHIVED">ARCHIVED (Archiviert)</option>
          </select>

          {/* Brand Filter */}
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setPage(1);
            }}
            className="border border-[#E8E5DC] bg-[#FAF9F6] px-3 py-1.5 text-xs text-[#1A1A1A] focus:border-[#C5A880] focus:outline-none"
          >
            <option value="">Alle Marken</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>

          {(search || statusFilter || brandFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setBrandFilter("");
                setPage(1);
              }}
              className="flex items-center gap-1 font-mono text-[10px] text-[#B91C1C] uppercase hover:underline"
            >
              <RotateCcw className="h-3 w-3" /> Zurücksetzen
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto border border-[#E8E5DC] bg-white">
        {loading ? (
          <div className="p-12 text-center font-mono text-xs text-[#6B6B6B]">
            Produkte werden geladen...
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#6B6B6B]">
            Keine Produkte für die aktuellen Filterkriterien gefunden.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E8E5DC] bg-[#FAF9F6] font-mono text-[10px] text-[#6B6B6B] uppercase">
                <th className="p-4">Produkt</th>
                <th className="p-4">Marke</th>
                <th className="p-4">Preis</th>
                <th className="p-4">Bestand</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]">
              {products.map((prod) => {
                const primaryImage =
                  prod.images[0]?.url ||
                  PLACEHOLDER_IMAGE;

                return (
                  <tr key={prod.id} className="transition-colors hover:bg-[#FAF9F6]/80">
                    <td className="flex items-center gap-3 p-4">
                      <div className="relative h-10 w-10 flex-shrink-0 border border-[#E8E5DC] bg-[#F5F4EE]">
                        <ShimmerImage
                          src={primaryImage}
                          alt={prod.title}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="block max-w-xs truncate font-serif text-sm font-medium text-[#1A1A1A] hover:text-[#C5A880]"
                        >
                          {prod.title}
                        </Link>
                        <span className="font-mono text-[10px] text-[#6B6B6B]">
                          SKU: {prod.sku}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-[#1A1A1A]">{prod.brand?.name}</td>
                    <td className="p-4">
                      <PriceTag resalePriceCents={prod.resalePriceCents} size="sm" />
                    </td>
                    <td className="p-4 font-mono font-medium">
                      <span
                        className={
                          prod.inventoryQuantity <= 1 ? "text-[#B91C1C]" : "text-[#1A1A1A]"
                        }
                      >
                        {prod.inventoryQuantity}x
                      </span>
                    </td>
                    <td className="p-4">
                      <LuxuryBadge
                        variant={
                          prod.status === "PUBLISHED"
                            ? "green"
                            : prod.status === "DRAFT"
                              ? "gold"
                              : "dark"
                        }
                      >
                        {prod.status}
                      </LuxuryBadge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${prod.id}`}
                          className="p-1.5 text-[#6B6B6B] transition-colors hover:text-[#C5A880]"
                          title="Bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prod.id, prod.title)}
                          className="p-1.5 text-[#6B6B6B] transition-colors hover:text-[#B91C1C]"
                          title="Archivieren"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
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
