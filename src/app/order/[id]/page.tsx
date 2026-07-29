import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { ShimmerImage } from "@/components/luxury/ShimmerImage";
import { PriceTag } from "@/components/luxury/PriceTag";
import { LuxuryButton } from "@/components/luxury/LuxuryButton";
import { LuxuryBadge } from "@/components/luxury/LuxuryBadge";
import { getTrackingUrl } from "@/lib/tracking";
import { ShieldCheck, CheckCircle2, Package, Mail, ArrowRight, Truck, FileText } from "lucide-react";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" } },
            },
          },
        },
      },
      payments: true,
      shipments: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Access Control: Customer owner, Admin, or Guest within 30 minutes
  const currentCustomer = await getCurrentCustomer();
  const now = new Date();
  const placedTime = new Date(order.placedAt);
  const diffMinutes = (now.getTime() - placedTime.getTime()) / (1000 * 60);

  const isOwner = currentCustomer && order.customerId === currentCustomer.id;
  const isAdmin = currentCustomer && currentCustomer.role === "ADMIN";
  const isGuestRecent = !order.customerId && diffMinutes <= 30;

  if (!isOwner && !isAdmin && !isGuestRecent) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-12 pb-24">
      <div className="container-luxury max-w-4xl space-y-8">
        {/* Success Header Banner */}
        <div className="space-y-4 border border-[#E8E5DC] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#C5A880]/40 bg-[#FAF4EB] text-[#C5A880]">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <span className="label-luxury text-xs text-[#C5A880]">Bestellung Erfolgreich</span>
            <h1 className="font-serif text-3xl font-light text-[#1A1A1A] sm:text-4xl">
              Vielen Dank für Ihre Bestellung!
            </h1>
            <p className="mx-auto max-w-md text-xs text-[#6B6B6B]">
              Wir haben Ihre Bestellung erhalten und bereiten den gesicherten Expressversand vor.
            </p>
          </div>

          {/* Prominent Order Number */}
          <div className="inline-flex items-center gap-3 border border-[#E8E5DC] bg-[#FAF9F6] px-6 py-3 font-mono text-sm">
            <span className="text-[#6B6B6B]">Bestellnummer:</span>
            <span className="text-base font-bold text-[#1A1A1A]">{order.number}</span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          {/* Left Column: Items & Summary */}
          <div className="space-y-6 md:col-span-8">
            {/* Items */}
            <div className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h2 className="border-b border-[#E8E5DC] pb-3 font-serif text-xl text-[#1A1A1A]">
                Bestellte Einzelstücke
              </h2>

              <div className="divide-y divide-[#E8E5DC]">
                {order.items.map((item) => {
                  const primaryImage =
                    item.product?.images[0]?.url ||
                    PLACEHOLDER_IMAGE

                  return (
                    <div key={item.id} className="flex items-center justify-between gap-4 py-4">
                      <div className="relative h-16 w-16 flex-shrink-0 border border-[#E8E5DC] bg-[#F5F4EE]">
                        <ShimmerImage
                          src={primaryImage}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-serif text-sm font-medium text-[#1A1A1A]">
                          {item.title}
                        </h4>
                        <span className="font-mono text-[10px] text-[#6B6B6B]">
                          SKU: {item.sku} · Menge: {item.quantity}x
                        </span>
                      </div>
                      <PriceTag resalePriceCents={item.totalCents} size="sm" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Summary */}
            <div className="space-y-3 border border-[#E8E5DC] bg-white p-6 text-xs">
              <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
                Zahlungsaufschlüsselung
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

              <p className="pt-1 font-mono text-[10px] text-[#6B6B6B]">
                Inkl. 19% MwSt. ({((order.taxCents || 0) / 100).toFixed(2)} €)
              </p>
            </div>
          </div>

          {/* Right Column: Status & Next Steps */}
          <div className="space-y-6 md:col-span-4">
            {/* Order Status Card */}
            <div className="space-y-4 border border-[#E8E5DC] bg-white p-6">
              <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
                Bestellstatus
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6B6B]">Zahlungsstatus:</span>
                  <LuxuryBadge variant={order.paymentStatus === "PAID" ? "green" : "red"}>
                    {order.paymentStatus === "PAID" ? "Bezahlt" : "Ausstehend"}
                  </LuxuryBadge>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B6B6B]">Versandstatus:</span>
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
                    {order.fulfillmentStatus === "PENDING" && "In Bearbeitung"}
                    {order.fulfillmentStatus === "SHIPPED" && "Versendet"}
                    {order.fulfillmentStatus === "DELIVERED" && "Zugestellt"}
                    {order.fulfillmentStatus === "CANCELLED" && "Storniert"}
                  </LuxuryBadge>
                </div>

                {/* Tracking Links */}
                {order.shipments?.map((shipment) => (
                  <div key={shipment.id} className="border-t border-[#E8E5DC] pt-3">
                    <p className="font-mono text-[10px] text-[#6B6B6B]">
                      Versendet via {shipment.carrier}
                    </p>
                    {shipment.trackingNo && (
                      <>
                        <p className="font-mono text-[10px] text-[#6B6B6B]">
                          Sendungsnr: {shipment.trackingNo}
                        </p>
                        <a
                          href={getTrackingUrl(shipment.carrier, shipment.trackingNo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-[#C5A880] hover:underline"
                        >
                          <Truck className="h-3 w-3" /> Sendung verfolgen →
                        </a>
                      </>
                    )}
                  </div>
                )) || null}

                <div className="border-t border-[#E8E5DC] pt-2 font-mono text-[10px] text-[#6B6B6B]">
                  Bestelldatum:{" "}
                  <span className="text-[#1A1A1A]">
                    {new Date(order.placedAt).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Address Card */}
            <div className="space-y-3 border border-[#E8E5DC] bg-white p-6">
              <h3 className="border-b border-[#E8E5DC] pb-3 font-serif text-lg text-[#1A1A1A]">
                Lieferadresse
              </h3>
              <address className="space-y-1 text-xs text-[#1A1A1A] not-italic">
                <p className="font-medium">
                  {order.shippingFirstName} {order.shippingLastName}
                </p>
                <p>{order.shippingStreet1}</p>
                {order.shippingStreet2 && <p>{order.shippingStreet2}</p>}
                <p>
                  {order.shippingPostalCode} {order.shippingCity}
                </p>
                <p>{order.shippingCountry}</p>
                <p className="pt-1 font-mono text-[#6B6B6B]">{order.email}</p>
              </address>
            </div>

            {/* Next Steps Card */}
            <div className="space-y-3 border border-[#C5A880]/50 bg-[#FAF4EB] p-6">
              <span className="label-luxury text-[9px] text-[#C5A880]">Nächste Schritte</span>
              <ul className="space-y-2 text-xs text-[#1A1A1A]">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C5A880]" />
                  <span>Bestätigung per E-Mail versendet</span>
                </li>
                {/* Product certificate links */}
                {order.items.filter((item) => item.product?.certificateUrl).length > 0 && (
                  <li className="flex flex-col gap-2 pt-1">
                    <span className="label-luxury text-[8px]">Prüfzertifikate</span>
                    {order.items
                      .filter((item) => item.product?.certificateUrl)
                      .map((item) => (
                        <a
                          key={item.id}
                          href={item.product!.certificateUrl!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-[#C5A880] underline hover:no-underline"
                        >
                          <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{item.title} — Prüfzertifikat</span>
                        </a>
                      ))}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#C5A880]" />
                  <span>Versicherter DHL Express Versand</span>
                </li>
              </ul>
            </div>

            <Link href="/catalog" className="block w-full">
              <LuxuryButton variant="gold" size="lg" className="w-full">
                Weiter Stöbern <ArrowRight className="ml-2 h-4 w-4" />
              </LuxuryButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
