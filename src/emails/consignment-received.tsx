import * as React from "react";

interface ConsignmentReceivedEmailProps {
  firstName: string;
  brandName: string;
  modelName: string;
  requestId: string;
}

export const ConsignmentReceivedEmail: React.FC<Readonly<ConsignmentReceivedEmailProps>> = ({
  firstName,
  brandName,
  modelName,
  requestId,
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
          SONA BOUTIQUE · CONCIERGE
        </span>
        <h1 style={{ fontSize: "24px", color: "#1A1A1A", fontWeight: "300", marginTop: "8px" }}>
          Anfrage Erhalten
        </h1>
      </div>

      <p style={{ fontSize: "14px", color: "#4A4A4A", lineHeight: "1.6" }}>
        Sehr geehrte/r {firstName},
      </p>

      <p style={{ fontSize: "14px", color: "#4A4A4A", lineHeight: "1.6" }}>
        vielen Dank für Ihre Einreichung Ihrer{" "}
        <strong>
          {brandName} {modelName}
        </strong>{" "}
        über unser Concierge-Portal. Wir haben Ihre Daten und Fotos erfolgreich erhalten.
      </p>

      <div
        style={{
          backgroundColor: "#FAF9F6",
          border: "1px solid #E8E5DC",
          padding: "16px",
          margin: "24px 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "11px",
            color: "#6B6B6B",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Anfrage-Referenz
        </p>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "16px",
            color: "#1A1A1A",
            fontFamily: "monospace",
            fontWeight: "bold",
          }}
        >
          {requestId}
        </p>
      </div>

      <p style={{ fontSize: "14px", color: "#4A4A4A", lineHeight: "1.6" }}>
        Unsere Experten prüfen Ihr Objekt sorgfältig. Sie erhalten innerhalb von{" "}
        <strong>48 Stunden</strong> ein unverbindliches Wertangebot per E-Mail.
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

export default ConsignmentReceivedEmail;
