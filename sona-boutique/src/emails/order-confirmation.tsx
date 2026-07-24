import * as React from "react";

type OrderConfirmationEmailProps = {
  customerName?: string;
  orderNumber?: string;
  totalEuro?: string;
};

export function OrderConfirmationEmail({
  customerName = "Wertgeschätzter Kunde",
  orderNumber = "SONA-2026-10001",
  totalEuro = "2.250,00 €",
}: OrderConfirmationEmailProps) {
  return (
    <div
      style={{ fontFamily: "serif", padding: "20px", color: "#1A1A1A", backgroundColor: "#FAF9F6" }}
    >
      <h1 style={{ color: "#C5A880", fontStyle: "italic" }}>SONA BOUTIQUE</h1>
      <h2>Bestellbestätigung — {orderNumber}</h2>
      <p>Sehr geehrte/r {customerName},</p>
      <p>
        vielen Dank für Ihre Bestellung über <strong>{totalEuro}</strong> bei SONA Boutique. Ihre
        zertifizierte Luxushandtasche wird für den versicherten Expressversand vorbereitet.
      </p>
      <hr style={{ borderColor: "#E8E5DC", margin: "20px 0" }} />
      <p style={{ fontSize: "12px", color: "#6B6B6B" }}>
        SONA Boutique — Zertifizierte Luxushandtaschen & Investment Pieces
      </p>
    </div>
  );
}

export default OrderConfirmationEmail;
