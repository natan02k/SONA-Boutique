import { getTrackingUrl } from "@/lib/tracking";
import { CheckCircle2, Clock, Truck, Package, XCircle, CreditCard } from "lucide-react";

type TimelineEvent = {
  status: string;
  date: Date | null;
  label: string;
  icon: React.ReactNode;
  details?: string;
  trackingUrl?: string;
};

type ShipmentInfo = {
  carrier: string;
  trackingNo: string | null;
  shippedAt: Date;
  deliveredAt: Date | null;
};

type OrderTimelineProps = {
  placedAt: Date;
  paidAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  fulfillmentStatus: string;
  paymentStatus: string;
  shipments?: ShipmentInfo[];
};

export function OrderTimeline({
  placedAt,
  paidAt,
  shippedAt,
  deliveredAt,
  cancelledAt,
  fulfillmentStatus,
  paymentStatus,
  shipments = [],
}: OrderTimelineProps) {
  const events: TimelineEvent[] = [
    {
      status: "PLACED",
      date: placedAt,
      label: "Bestellung aufgegeben",
      icon: <Package className="h-4 w-4" />,
    },
    {
      status: "PAID",
      date: paidAt || null,
      label: "Zahlung erhalten",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  // Add shipment events with tracking links
  for (const ship of shipments) {
    events.push({
      status: "SHIPPED",
      date: ship.shippedAt,
      label: `Versendet via ${ship.carrier}`,
      icon: <Truck className="h-4 w-4" />,
      details: ship.trackingNo || undefined,
      trackingUrl: ship.trackingNo ? getTrackingUrl(ship.carrier, ship.trackingNo) : undefined,
    });

    if (ship.deliveredAt) {
      events.push({
        status: "DELIVERED",
        date: ship.deliveredAt,
        label: "Zugestellt",
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }
  }

  if (cancelledAt) {
    events.push({
      status: "CANCELLED",
      date: cancelledAt,
      label: "Storniert",
      icon: <XCircle className="h-4 w-4" />,
    });
  }

  const formatDate = (d: Date) =>
    d.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-0">
      {events.map((event, idx) => {
        const isActive = !!event.date;
        const isLast = idx === events.length - 1;

        return (
          <div key={event.status} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical Line */}
            {!isLast && (
              <div
                className={`absolute left-[13px] top-7 h-full w-px ${
                  isActive ? "bg-[#C5A880]" : "bg-[#E8E5DC]"
                }`}
              />
            )}

            {/* Icon Circle */}
            <div
              className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                isActive
                  ? "border-[#C5A880] bg-[#FAF4EB] text-[#C5A880]"
                  : "border-[#E8E5DC] bg-white text-[#BBB8AD]"
              }`}
            >
              {event.icon}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              <p
                className={`text-xs font-medium ${
                  isActive ? "text-[#1A1A1A]" : "text-[#BBB8AD]"
                }`}
              >
                {event.label}
              </p>
              {isActive && event.date && (
                <p className="font-mono text-[10px] text-[#6B6B6B]">{formatDate(event.date)}</p>
              )}
              {event.details && (
                <p className="mt-0.5 font-mono text-[10px] text-[#6B6B6B]">
                  Sendungsnr: {event.details}
                </p>
              )}
              {event.trackingUrl && (
                <a
                  href={event.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] text-[#C5A880] hover:underline"
                >
                  Sendung verfolgen →
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}