import * as React from "react";

type ShippingUpdateEmailProps = {
  customerName?: string;
  orderNumber?: string;
  carrier?: string;
  trackingNo?: string;
};

export function ShippingUpdateEmail({
  customerName = "Wertgeschätzte/r Kundin/Kunde",
  orderNumber = "SONA-2026-10001",
  carrier = "DHL Express",
  trackingNo = "JJD000300000000",
}: ShippingUpdateEmailProps) {
  const trackingUrl = carrier.toLowerCase().includes("dhl")
    ? `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=${trackingNo}`
    : `#`;

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

          {/* Content */}
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
                Versandbestätigung
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
                Ihre Bestellung ist auf dem Weg, {customerName}.
              </h1>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4A4A4A" }}>
                Gute Nachrichten: Ihre Bestellung <strong>{orderNumber}</strong> wurde erfolgreich
                an unseren Logistikpartner <strong>{carrier}</strong> übergeben.
              </p>

              {/* Tracking Box */}
              <div
                style={{
                  backgroundColor: "#FAF9F6",
                  border: "1px solid #E8E5DC",
                  padding: "24px",
                  textAlign: "center",
                  margin: "30px 0",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#6B6B6B",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Sendungsverfolgungsnummer ({carrier})
                </span>
                <span
                  style={{
                    fontSize: "18px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#1A1A1A",
                    letterSpacing: "0.1em",
                    display: "block",
                    marginBottom: "16px",
                  }}
                >
                  {trackingNo}
                </span>

                <a
                  href={trackingUrl}
                  style={{
                    backgroundColor: "#C5A880",
                    color: "#1A1A1A",
                    padding: "12px 24px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Sendung Verfolgen →
                </a>
              </div>

              <p style={{ fontSize: "12px", color: "#6B6B6B", lineHeight: "1.6" }}>
                <strong>Versicherungsschutz:</strong> Ihre Lieferung ist durch SONA Boutique
                vollständig gegen Verlust und Beschädigung auf dem Transportweg bis zur persönlichen
                Übergabe versichert.
              </p>
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
              <p style={{ margin: "0 0 8px 0" }}>SONA Boutique GmbH · Kundenservice</p>
              <p style={{ margin: "0" }}>
                Bei Fragen erreichen Sie uns unter{" "}
                <a href="mailto:support@sona-boutique.de" style={{ color: "#C5A880" }}>
                  support@sona-boutique.de
                </a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default ShippingUpdateEmail;
