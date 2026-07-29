import * as React from "react";

interface ConsignmentOfferEmailProps {
  firstName: string;
  brandName: string;
  modelName: string;
  requestId: string;
  offeredType: "SALE" | "CONSIGNMENT";
  offeredAmountFormatted: string;
  offerUrl: string;
}

export const ConsignmentOfferEmail: React.FC<Readonly<ConsignmentOfferEmailProps>> = ({
  firstName,
  brandName,
  modelName,
  requestId,
  offeredType,
  offeredAmountFormatted,
  offerUrl,
}) => (
  <div style={{ fontFamily: "serif", backgroundColor: "#FAF9F6", padding: "40px 20px" }}>
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#FFFFFF",
        border: "1px solid #E8E5DC",
        padding: "32px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "2px",
            color: "#C5A880",
            textTransform: "uppercase",
          }}
        >
          SONA BOUTIQUE · LUXUS ANKAUF & KOMMISSION
        </span>
        <h1 style={{ fontSize: "24px", color: "#1A1A1A", fontWeight: "300", marginTop: "8px" }}>
          Ihr Exklusives Angebot
        </h1>
      </div>

      <p style={{ fontSize: "14px", color: "#4A4A4A", lineHeight: "1.6" }}>
        Sehr geehrte/r {firstName},
      </p>

      <p style={{ fontSize: "14px", color: "#4A4A4A", lineHeight: "1.6" }}>
        unsere Experten haben Ihre Einreichung für die{" "}
        <strong>
          {brandName} {modelName}
        </strong>{" "}
        geprüft. Wir freuen uns, Ihnen folgendes Angebot unterbreiten zu können:
      </p>

      <div
        style={{
          backgroundColor: "#FAF9F6",
          border: "1px solid #C5A880",
          padding: "24px",
          margin: "24px 0",
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "#C5A880",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {offeredType === "SALE" ? "Sofortankauf-Angebot" : "Kommissions-Angebot"}
        </span>
        <h2 style={{ fontSize: "28px", color: "#1A1A1A", margin: "8px 0" }}>
          {offeredAmountFormatted}
        </h2>
        <p style={{ fontSize: "12px", color: "#6B6B6B", margin: 0 }}>
          {offeredType === "SALE"
            ? "Direkte Auszahlung nach Wareneingang & Prüfung"
            : "Geschätzter Erlös nach erfolgreichem Verkauf"}
        </p>
      </div>

      <div style={{ textAlign: "center", margin: "32px 0" }}>
        <a
          href={offerUrl}
          style={{
            backgroundColor: "#1A1A1A",
            color: "#FAF9F6",
            padding: "14px 28px",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "2px",
            textDecoration: "none",
            display: "inline-block",
            border: "1px solid #C5A880",
          }}
        >
          Angebot Prüfen & Annehmen
        </a>
      </div>

      <p style={{ fontSize: "12px", color: "#6B6B6B", lineHeight: "1.6" }}>
        Dieses Angebot ist <strong>7 Tage gültig</strong>. Nach Ihrer Zusage erhalten Sie von uns
        ein vollversichertes DHL-Express Versandetikett zur kostenfreien Einsendung.
      </p>

      <div
        style={{
          marginTop: "32px",
          borderTop: "1px solid #E8E5DC",
          paddingTop: "16px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "11px", color: "#6B6B6B" }}>
          © {new Date().getFullYear()} SONA Boutique GmbH · Maximilianstraße 12, München
        </p>
      </div>
    </div>
  </div>
);

export default ConsignmentOfferEmail;
