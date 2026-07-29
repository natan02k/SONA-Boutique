import Link from "next/link";
import { db } from "@/lib/db";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { Package, ShoppingBag, Euro, Clock, AlertTriangle, Plus, Tag } from "lucide-react";

export default async function AdminDashboardPage() {
  const [
    productCount,
    orderCount,
    paidOrders,
    pendingFulfillmentCount,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    db.product.count({ where: { status: { not: "ARCHIVED" } } }),
    db.order.count(),
    db.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { totalCents: true },
    }),
    db.order.count({ where: { fulfillmentStatus: "PENDING" } }),
    db.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 5,
      include: { customer: true, items: true },
    }),
    db.product.findMany({
      where: { inventoryQuantity: { lte: 1 }, status: "PUBLISHED" },
      take: 5,
      include: { brand: true },
    }),
  ]);

  const totalRevenueCents = paidOrders.reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DC] pb-6">
        <div>
          <span className="label-luxury text-xs">Übersicht</span>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">Admin Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <LuxuryButton variant="gold" size="sm">
              <Plus className="mr-1.5 h-4 w-4" /> Neues Produkt
            </LuxuryButton>
          </Link>
          <Link href="/admin/promo-codes">
            <LuxuryButton variant="outline" size="sm">
              <Tag className="mr-1.5 h-4 w-4" /> Promo-Codes
            </LuxuryButton>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Gesamtumsatz */}
        <div className="space-y-2 border border-[#E8E5DC] bg-white p-6">
          <div className="flex items-center justify-between text-[#C5A880]">
            <span className="label-luxury text-[10px]">Gesamtumsatz</span>
            <Euro className="h-5 w-5" />
          </div>
          <div className="font-serif text-2xl font-semibold text-[#1A1A1A]">
            {(totalRevenueCents / 100).toLocaleString("de-DE", {
              style: "currency",
              currency: "EUR",
            })}
          </div>
          <p className="font-mono text-[10px] text-[#6B6B6B]">Aus bezahlten Bestellungen</p>
        </div>

        {/* KPI 2: Bestellungen */}
        <div className="space-y-2 border border-[#E8E5DC] bg-white p-6">
          <div className="flex items-center justify-between text-[#C5A880]">
            <span className="label-luxury text-[10px]">Bestellungen</span>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="font-serif text-2xl font-semibold text-[#1A1A1A]">{orderCount}</div>
          <p className="font-mono text-[10px] text-[#6B6B6B]">Gesamte Bestellungen</p>
        </div>

        {/* KPI 3: Offene Fulfillments */}
        <div className="space-y-2 border border-[#E8E5DC] bg-white p-6">
          <div className="flex items-center justify-between text-[#C5A880]">
            <span className="label-luxury text-[10px]">Offener Versand</span>
            <Clock className="h-5 w-5" />
          </div>
          <div className="font-serif text-2xl font-semibold text-[#1A1A1A]">
            {pendingFulfillmentCount}
          </div>
          <p className="font-mono text-[10px] text-[#6B6B6B]">Warten auf Expressversand</p>
        </div>

        {/* KPI 4: Aktive Produkte */}
        <div className="space-y-2 border border-[#E8E5DC] bg-white p-6">
          <div className="flex items-center justify-between text-[#C5A880]">
            <span className="label-luxury text-[10px]">Aktive Produkte</span>
            <Package className="h-5 w-5" />
          </div>
          <div className="font-serif text-2xl font-semibold text-[#1A1A1A]">{productCount}</div>
          <p className="font-mono text-[10px] text-[#6B6B6B]">Im Katalog gelistet</p>
        </div>
      </div>

      {/* Recent Orders & Low Stock Tables Grid */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Recent 5 Orders */}
        <div className="space-y-4 border border-[#E8E5DC] bg-white p-6 lg:col-span-8">
          <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
            <h3 className="font-serif text-lg text-[#1A1A1A]">Letzte Bestellungen</h3>
            <Link
              href="/admin/orders"
              className="font-mono text-[10px] text-[#C5A880] uppercase hover:underline"
            >
              Alle Bestellungen →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#6B6B6B]">
              Noch keine Bestellungen vorhanden.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8E5DC] font-mono text-[10px] text-[#6B6B6B] uppercase">
                    <th className="pb-2">Bestell-Nr.</th>
                    <th className="pb-2">Kunde</th>
                    <th className="pb-2">Betrag</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Datum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DC]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF9F6]">
                      <td className="py-3 font-mono font-medium">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-[#1A1A1A] hover:text-[#C5A880]"
                        >
                          {ord.number}
                        </Link>
                      </td>
                      <td className="py-3 text-[#6B6B6B]">
                        {ord.firstName} {ord.lastName}
                      </td>
                      <td className="py-3">
                        <PriceTag resalePriceCents={ord.totalCents} size="sm" />
                      </td>
                      <td className="py-3">
                        <LuxuryBadge variant={ord.paymentStatus === "PAID" ? "green" : "red"}>
                          {ord.paymentStatus}
                        </LuxuryBadge>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-[#6B6B6B]">
                        {new Date(ord.placedAt).toLocaleDateString("de-DE")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="space-y-4 border border-[#E8E5DC] bg-white p-6 lg:col-span-4">
          <div className="flex items-center justify-between border-b border-[#E8E5DC] pb-3">
            <div className="flex items-center gap-2 text-[#B91C1C]">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="font-serif text-lg text-[#1A1A1A]">Einzelstücke & Low Stock</h3>
            </div>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#6B6B6B]">
              Keine knapp verfügbaren Produkte.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between border-b border-[#E8E5DC] pb-2 text-xs"
                >
                  <div>
                    <span className="label-luxury block text-[8px]">{prod.brand.name}</span>
                    <Link
                      href={`/admin/products/${prod.id}`}
                      className="block max-w-[150px] truncate font-medium text-[#1A1A1A] hover:text-[#C5A880]"
                    >
                      {prod.title}
                    </Link>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] font-semibold text-[#B91C1C]">
                      {prod.inventoryQuantity}x übrig
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
