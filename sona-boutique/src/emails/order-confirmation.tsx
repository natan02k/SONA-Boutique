import * as React from "react";

type OrderItem = {
  title: string;
  brandName: string;
  sku: string;
  quantity: number;
  totalEuro: string;
};

type OrderConfirmationEmailProps = {
  customerName?: string;
  orderNumber?: string;
  placedAtDate?: string;
  items?: OrderItem[];
  subtotalEuro?: string;
  shippingEuro?: string;
  discountEuro?: string;
  taxEuro?: string;
  totalEuro?: string;
  shippingAddress?: {
    street1: string;
    street2?: string | null;
    city: string;
    postalCode: string;
    country: string;
  };
};

export function OrderConfirmationEmail({
  customerName = "Wertgeschätzte/r Kundin/Kunde",
  orderNumber = "SONA-2026-10001",
  placedAtDate = new Date().toLocaleDateString("de-DE"),
  items = [
    {
      title: "Hermès Birkin 30 Togo Gold",
      brandName: "Hermès",
      sku: "HERMES-BIRKIN-30-GOLD",
      quantity: 1,
      totalEuro: "22.500,00 €",
    },
  ],
  subtotalEuro = "22.500,00 €",
  shippingEuro = "Kostenfrei",
  discountEuro = "0,00 €",
  taxEuro = "3.592,44 €",
  totalEuro = "22.500,00 €",
  shippingAddress = {
    street1: "Maximilianstraße 12",
    city: "München",
    postalCode: "80539",
    country: "Deutschland",
  },
}: OrderConfirmationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        backgroundColor: "#FAF9F6",
        color: "#1A1A1A",
        margin: "0",
        padding: "40px 20px",
      }}
    >
      <table
        align="center"
        width="100%"
        style={{
          maxWidth: "600px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E8E5DC",
          borderCollapse: "collapse",
        }}
      >
        {/* Header Logo */}
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: "#1A1A1A",
                padding: "30px 40px",
                textAlign: "center",
                borderBottom: "2px solid #C5A880",
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#C5A880",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Maison de Haute Maroquinerie
              </span>
              <span
                style={{
                  fontSize: "24px",
                  letterSpacing: "0.2em",
                  color: "#FAF9F6",
                  fontWeight: "300",
                }}
              >
                SONA BOUTIQUE
              </span>
            </td>
          </tr>

          {/* Main Content */}
          <tr>
            <td style={{ padding: "40px" }}>
              <span
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#C5A880",
                  fontWeight: "bold",
                }}
              >
                Bestellbestätigung
              </span>
              <h1
                style={{
                  fontSize: "22px",
                  fontWeight: "300",
                  color: "#1A1A1A",
                  marginTop: "8px",
                  marginBottom: "20px",
                }}
              >
                Vielen Dank für Ihre Bestellung, {customerName}.
              </h1>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4A4A4A" }}>
                Wir haben Ihre Bestellung <strong>{orderNumber}</strong> vom {placedAtDate} dankend
                erhalten. Ihr exklusives Einzelstück wird nun der finalen Echtheitsprüfung
                unterzogen und für den versicherten Expressversand vorbereitet.
              </p>

              {/* Order Items Table */}
              <div style={{ marginTop: "30px", marginBottom: "30px" }}>
                <h3
                  style={{
                    fontSize: "14px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    borderBottom: "1px solid #E8E5DC",
                    paddingBottom: "8px",
                    color: "#1A1A1A",
                  }}
                >
                  Bestellte Positionen
                </h3>
                <table width="100%" style={{ borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid #E8E5DC",
                        color: "#6B6B6B",
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "8px 0" }}>Artikel</th>
                      <th style={{ padding: "8px 0", textAlign: "center" }}>Menge</th>
                      <th style={{ padding: "8px 0", textAlign: "right" }}>Gesamt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid #FAF9F6" }}>
                        <td style={{ padding: "12px 0" }}>
                          <span style={{ fontSize: "10px", color: "#C5A880", display: "block" }}>
                            {it.brandName}
                          </span>
                          <strong style={{ color: "#1A1A1A" }}>{it.title}</strong>
                          <span style={{ fontSize: "10px", color: "#6B6B6B", display: "block" }}>
                            SKU: {it.sku}
                          </span>
                        </td>
                        <td style={{ padding: "12px 0", textAlign: "center" }}>{it.quantity}x</td>
                        <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "bold" }}>
                          {it.totalEuro}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary & Shipping Address Grid */}
              <table width="100%" style={{ borderCollapse: "collapse", marginTop: "20px" }}>
                <tbody>
                  <tr>
                    {/* Shipping Address */}
                    <td width="50%" style={{ verticalAlign: "top", paddingRight: "15px" }}>
                      <h4
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          color: "#1A1A1A",
                          marginBottom: "8px",
                        }}
                      >
                        Lieferadresse
                      </h4>
                      <p
                        style={{
                          fontSize: "12px",
                          lineHeight: "1.6",
                          color: "#6B6B6B",
                          margin: "0",
                        }}
                      >
                        {customerName}
                        <br />
                        {shippingAddress.street1}
                        <br />
                        {shippingAddress.street2 ? `${shippingAddress.street2}<br />` : ""}
                        {shippingAddress.postalCode} {shippingAddress.city}
                        <br />
                        {shippingAddress.country}
                      </p>
                    </td>

                    {/* Financial Summary */}
                    <td width="50%" style={{ verticalAlign: "top", paddingLeft: "15px" }}>
                      <h4
                        style={{
                          fontSize: "12px",
                          textTransform: "uppercase",
                          color: "#1A1A1A",
                          marginBottom: "8px",
                        }}
                      >
                        Zusammenfassung
                      </h4>
                      <table width="100%" style={{ fontSize: "12px", color: "#6B6B6B" }}>
                        <tbody>
                          <tr>
                            <td>Zwischensumme:</td>
                            <td style={{ textAlign: "right" }}>{subtotalEuro}</td>
                          </tr>
                          {discountEuro !== "0,00 €" && (
                            <tr style={{ color: "#15803D" }}>
                              <td>Rabatt:</td>
                              <td style={{ textAlign: "right" }}>-{discountEuro}</td>
                            </tr>
                          )}
                          <tr>
                            <td>Expressversand:</td>
                            <td style={{ textAlign: "right" }}>{shippingEuro}</td>
                          </tr>
                          <tr style={{ fontWeight: "bold", color: "#1A1A1A", fontSize: "14px" }}>
                            <td style={{ paddingTop: "8px" }}>Gesamtsumme:</td>
                            <td style={{ textAlign: "right", paddingTop: "8px" }}>{totalEuro}</td>
                          </tr>
                          <tr>
                            <td
                              colSpan={2}
                              style={{ fontSize: "10px", color: "#6B6B6B", paddingTop: "4px" }}
                            >
                              Enthält 19% MwSt. ({taxEuro})
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Next Steps Infobox */}
              <div
                style={{
                  backgroundColor: "#FAF9F6",
                  borderLeft: "3px solid #C5A880",
                  padding: "16px",
                  marginTop: "30px",
                }}
              >
                <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#1A1A1A" }}>
                  Wie es weitergeht:
                </h4>
                <ol
                  style={{
                    margin: "0",
                    paddingLeft: "20px",
                    fontSize: "12px",
                    color: "#6B6B6B",
                    lineHeight: "1.6",
                  }}
                >
                  <li>Zertifizierung & Echtheitsprüfung im Tresor.</li>
                  <li>Versicherter Expressversand via DHL Express.</li>
                  <li>Sie erhalten eine E-Mail mit Ihrer Sendungsverfolgungsnummer.</li>
                </ol>
              </div>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                backgroundColor: "#FAF9F6",
                padding: "24px 40px",
                textAlign: "center",
                borderTop: "1px solid #E8E5DC",
                fontSize: "11px",
                color: "#6B6B6B",
                lineHeight: "1.6",
              }}
            >
              <p style={{ margin: "0 0 8px 0" }}>
                SONA Boutique GmbH · Boutiquen & Kuratierung für Investment Pieces
              </p>
              <p style={{ margin: "0 0 12px 0" }}>
                <a
                  href="https://sona-boutique.de/agb"
                  style={{ color: "#C5A880", textDecoration: "none" }}
                >
                  AGB
                </a>{" "}
                ·{" "}
                <a
                  href="https://sona-boutique.de/widerruf"
                  style={{ color: "#C5A880", textDecoration: "none" }}
                >
                  Widerruf
                </a>{" "}
                ·{" "}
                <a
                  href="https://sona-boutique.de/impressum"
                  style={{ color: "#C5A880", textDecoration: "none" }}
                >
                  Impressum
                </a>
              </p>
              <p style={{ fontSize: "9px", color: "#999999", margin: "0" }}>
                Rechtlicher Hinweis: SONA Boutique steht in keiner offiziellen Verbindung mit den
                präsentierten Markenherstellern (Hermès, Chanel, Louis Vuitton u.a.). Alle
                Markenrechte liegen bei den Rechteinhabern.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default OrderConfirmationEmail;
