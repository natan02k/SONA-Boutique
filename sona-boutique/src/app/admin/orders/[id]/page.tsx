import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { AdminOrderActions } from "@/components/admin/AdminOrderActions";
import { ArrowLeft, User, MapPin, CreditCard, Truck, ShieldCheck } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { id: true, slug: true, title: true } },
        },
      },
      customer: true,
      payments: true,
      shipments: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8E5DC] pb-6">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 font-mono text-[10px] text-[#6B6B6B] uppercase hover:text-[#1A1A1A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück zu allen Bestellungen
          </Link>
          <h1 className="font-serif text-3xl font-light text-[#1A1A1A]">
            Bestellung {order.number}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <LuxuryBadge variant={order.paymentStatus === "PAID" ? "green" : "red"}>
            Zahlung: {order.paymentStatus}
          </LuxuryBadge>
          <LuxuryBadge
            variant={
              order.fulfillmentStatus === "DELIVERED"
                ? "green"
                : order.fulfillmentStatus === "SHIPPED"
                  ? "gold"
                  : order.fulfillmentStatus === "CANCELLED"
                    ? "red"
                    : "dark"
            }
          >
            Versand: {order.fulfillmentStatus}
          </LuxuryBadge>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left: Items & Financials */}
        <div className="space-y-6 lg:col-span-8">
          {/* Items */}
          <div className="space-y-4 border border-[#E8E5DC] bg-white p-6">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
              Bestellte Einzelstücke ({order.items.length})
            </h3>
            <div className="divide-y divide-[#E8E5DC]">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <h4 className="font-serif text-sm font-medium text-[#1A1A1A]">{item.title}</h4>
                    <span className="font-mono text-[10px] text-[#6B6B6B]">
                      SKU: {item.sku} · Menge: {item.quantity}x
                    </span>
                  </div>
                  <PriceTag resalePriceCents={item.totalCents} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Financials */}
          <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
            <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
              Finanzaufschlüsselung
            </h3>
            <div className="flex justify-between text-[#6B6B6B]">
              <span>Zwischensumme:</span>
              <PriceTag resalePriceCents={order.subtotalCents} size="sm" />
            </div>
            {order.discountCents > 0 && (
              <div className="flex justify-between text-[#15803D]">
                <span>Rabatt ({order.promoCode}):</span>
                <span>-{(order.discountCents / 100).toFixed(2)} €</span>
              </div>
            )}
            <div className="flex justify-between text-[#6B6B6B]">
              <span>Versand (DHL Express):</span>
              <span>{order.shippingCents === 0 ? "Kostenfrei" : "15,00 €"}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-[#E8E5DC] pt-3 font-semibold text-[#1A1A1A]">
              <span className="font-serif text-lg">Gesamtsumme:</span>
              <PriceTag resalePriceCents={order.totalCents} size="lg" />
            </div>
            <p className="font-mono text-[10px] text-[#6B6B6B]">
              Enthält 19% MwSt. ({(order.taxCents / 100).toFixed(2)} €)
            </p>
          </div>
        </div>

        {/* Right: Customer & Action Controls */}
        <div className="space-y-6 lg:col-span-4">
          {/* Interactive Order Actions Component */}
          <AdminOrderActions
            orderId={order.id}
            currentStatus={order.fulfillmentStatus}
            paymentStatus={order.paymentStatus}
            orderTotalCents={order.totalCents}
            partialRefundCents={order.partialRefundCents}
          />

          {/* Customer Info */}
          <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
            <div className="flex items-center gap-2 border-b border-[#E8E5DC] pb-2 text-[#C5A880]">
              <User className="h-4 w-4" />
              <h3 className="font-serif text-base text-[#1A1A1A]">Kundeninformationen</h3>
            </div>
            <p className="font-medium text-[#1A1A1A]">
              {order.firstName} {order.lastName}
            </p>
            <p className="font-mono text-[#6B6B6B]">{order.email}</p>
            {order.phone && <p className="font-mono text-[#6B6B6B]">{order.phone}</p>}
          </div>

          {/* Shipping Address */}
          <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
            <div className="flex items-center gap-2 border-b border-[#E8E5DC] pb-2 text-[#C5A880]">
              <MapPin className="h-4 w-4" />
              <h3 className="font-serif text-base text-[#1A1A1A]">Lieferadresse</h3>
            </div>
            <address className="space-y-1 text-[#1A1A1A] not-italic">
              <p className="font-medium">
                {order.shippingFirstName} {order.shippingLastName}
              </p>
              <p>{order.shippingStreet1}</p>
              {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
              <p>
                {order.shippingPostalCode} {order.shippingCity}
              </p>
              <p>{order.shippingCountry}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
