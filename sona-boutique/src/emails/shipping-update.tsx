import * as React from "react";

type ShippingUpdateEmailProps = {
  customerName?: string;
  orderNumber?: string;
  carrier?: string;
  trackingNo?: string;
};

export function ShippingUpdateEmail({
  customerName = "Kunde",
  orderNumber = "SONA-2026-10001",
  carrier = "DHL Express",
  trackingNo = "JJD000300000000",
}: ShippingUpdateEmailProps) {
  return (
    <div
      style={{ fontFamily: "serif", padding: "20px", color: "#1A1A1A", backgroundColor: "#FAF9F6" }}
    >
      <h1 style={{ color: "#C5A880", fontStyle: "italic" }}>SONA BOUTIQUE</h1>
      <h2>Versandbestätigung — {orderNumber}</h2>
      <p>Sehr geehrte/r {customerName},</p>
      <p>
        Ihre Bestellung <strong>{orderNumber}</strong> wurde per versichertem Expressversand (
        {carrier}) verschickt.
      </p>
      <p>
        Sendungsverfolgungsnummer: <strong>{trackingNo}</strong>
      </p>
      <hr style={{ borderColor: "#E8E5DC", margin: "20px 0" }} />
      <p style={{ fontSize: "12px", color: "#6B6B6B" }}>
        SONA Boutique — Zertifizierte Luxushandtaschen
      </p>
    </div>
  );
}

export default ShippingUpdateEmail;
