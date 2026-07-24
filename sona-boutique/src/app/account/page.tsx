"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { User, Package, MapPin, LogOut, ChevronRight, ShoppingBag } from "lucide-react";

type Order = {
  id: string;
  number: string;
  placedAt: string;
  totalCents: number;
  fulfillmentStatus: string;
  paymentStatus: string;
  items: { title: string; quantity: number }[];
};

export default function AccountPage() {
  const { customer, fetchMe, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");

  useEffect(() => {
    fetchMe().then((cust) => {
      if (!cust) router.replace("/login");
    });
  }, [fetchMe, router]);

  useEffect(() => {
    if (!customer) return;
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : { orders: [] }))
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, [customer]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const statusLabel: Record<string, string> = {
    PENDING: "Ausstehend",
    PROCESSING: "In Bearbeitung",
    SHIPPED: "Versendet",
    DELIVERED: "Geliefert",
    CANCELLED: "Storniert",
  };

  const statusColor: Record<string, string> = {
    PENDING: "text-amber-700 bg-amber-50 border-amber-200",
    PROCESSING: "text-blue-700 bg-blue-50 border-blue-200",
    SHIPPED: "text-purple-700 bg-purple-50 border-purple-200",
    DELIVERED: "text-emerald-700 bg-emerald-50 border-emerald-200",
    CANCELLED: "text-gray-600 bg-gray-50 border-gray-200",
  };

  if (!customer) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="font-mono text-xs text-[#6B6B6B]">Wird geladen...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAF9F6] py-16">
      <div className="container-luxury max-w-5xl">
        {/* Page Header */}
        <div className="mb-10 border-b border-[#E8E5DC] pb-8">
          <p className="label-luxury mb-2 text-[10px]">Mein Konto</p>
          <h1 className="font-serif text-4xl font-light text-[#1A1A1A]">
            Willkommen, {customer.firstName}
          </h1>
          <p className="mt-2 font-mono text-xs text-[#6B6B6B]">{customer.email}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center gap-3 border px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider transition-all ${
                activeTab === "overview"
                  ? "border-[#C5A880] bg-[#C5A880]/10 text-[#1A1A1A]"
                  : "border-transparent text-[#6B6B6B] hover:border-[#E8E5DC] hover:text-[#1A1A1A]"
              }`}
            >
              <User className="h-4 w-4" /> Übersicht
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center gap-3 border px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider transition-all ${
                activeTab === "orders"
                  ? "border-[#C5A880] bg-[#C5A880]/10 text-[#1A1A1A]"
                  : "border-transparent text-[#6B6B6B] hover:border-[#E8E5DC] hover:text-[#1A1A1A]"
              }`}
            >
              <Package className="h-4 w-4" /> Bestellungen
              {orders.length > 0 && (
                <span className="ml-auto rounded-full bg-[#1A1A1A] px-2 py-0.5 font-mono text-[9px] text-white">
                  {orders.length}
                </span>
              )}
            </button>

            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 border border-transparent px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-[#6B6B6B] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" /> Abmelden
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="min-w-0">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="border border-[#E8E5DC] bg-white p-6">
                  <h2 className="mb-4 border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
                    Persönliche Daten
                  </h2>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="label-luxury mb-1 text-[9px]">Vorname</dt>
                      <dd className="font-mono text-sm text-[#1A1A1A]">{customer.firstName}</dd>
                    </div>
                    <div>
                      <dt className="label-luxury mb-1 text-[9px]">Nachname</dt>
                      <dd className="font-mono text-sm text-[#1A1A1A]">{customer.lastName}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="label-luxury mb-1 text-[9px]">E-Mail</dt>
                      <dd className="font-mono text-sm text-[#1A1A1A]">{customer.email}</dd>
                    </div>
                  </dl>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <div className="border border-[#E8E5DC] bg-white p-5 text-center">
                    <p className="font-serif text-3xl font-light text-[#C5A880]">
                      {orders.length}
                    </p>
                    <p className="label-luxury mt-1 text-[9px]">Bestellungen</p>
                  </div>
                  <div className="border border-[#E8E5DC] bg-white p-5 text-center">
                    <p className="font-serif text-3xl font-light text-[#C5A880]">
                      {orders.filter((o) => o.fulfillmentStatus === "DELIVERED").length}
                    </p>
                    <p className="label-luxury mt-1 text-[9px]">Geliefert</p>
                  </div>
                  <div className="border border-[#E8E5DC] bg-white p-5 text-center sm:col-span-1 col-span-2">
                    <p className="font-serif text-3xl font-light text-[#C5A880]">
                      {orders.filter((o) => o.fulfillmentStatus === "SHIPPED").length}
                    </p>
                    <p className="label-luxury mt-1 text-[9px]">Unterwegs</p>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <Link
                    href="/catalog"
                    className="flex items-center justify-between border border-[#E8E5DC] bg-white px-5 py-4 transition-colors hover:border-[#C5A880]"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4 text-[#C5A880]" />
                      <span className="font-mono text-xs text-[#1A1A1A]">
                        Weiter shoppen
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#9A9080]" />
                  </Link>
                  <Link
                    href="/verkaufen"
                    className="flex items-center justify-between border border-[#E8E5DC] bg-white px-5 py-4 transition-colors hover:border-[#C5A880]"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-[#C5A880]" />
                      <span className="font-mono text-xs text-[#1A1A1A]">
                        Tasche verkaufen / Ankauf anfragen
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#9A9080]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
                  Meine Bestellungen
                </h2>

                {loadingOrders && (
                  <div className="py-12 text-center font-mono text-xs text-[#6B6B6B]">
                    Bestellungen werden geladen...
                  </div>
                )}

                {!loadingOrders && orders.length === 0 && (
                  <div className="flex flex-col items-center gap-4 border border-[#E8E5DC] bg-white py-16 text-center">
                    <Package className="h-10 w-10 text-[#D4CFC4]" />
                    <div>
                      <p className="font-serif text-lg text-[#1A1A1A]">
                        Noch keine Bestellungen
                      </p>
                      <p className="mt-1 font-mono text-xs text-[#6B6B6B]">
                        Entdecken Sie unsere Kollektion aus sorgfältig kuratierten Luxustaschen.
                      </p>
                    </div>
                    <Link href="/catalog">
                      <LuxuryButton variant="gold" size="sm">
                        Zum Katalog
                      </LuxuryButton>
                    </Link>
                  </div>
                )}

                {!loadingOrders &&
                  orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="block border border-[#E8E5DC] bg-white p-5 transition-all hover:border-[#C5A880] hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-mono text-xs font-semibold text-[#1A1A1A]">
                            #{order.number}
                          </p>
                          <p className="font-mono text-[10px] text-[#6B6B6B]">
                            {new Date(order.placedAt).toLocaleDateString("de-DE", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <p className="font-mono text-[10px] text-[#9A9080]">
                            {order.items.map((i) => i.title).join(", ")}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <PriceTag resalePriceCents={order.totalCents} size="sm" />
                          <span
                            className={`border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${statusColor[order.fulfillmentStatus] || "border-gray-200 bg-gray-50 text-gray-600"}`}
                          >
                            {statusLabel[order.fulfillmentStatus] || order.fulfillmentStatus}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-1 font-mono text-[10px] text-[#C5A880]">
                        Details ansehen <ChevronRight className="h-3 w-3" />
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
