import * as React from "react";

type WelcomeEmailProps = {
  customerName?: string;
  catalogUrl?: string;
};

export function WelcomeEmail({
  customerName = "Wertgeschätztes Mitglied",
  catalogUrl = "https://sona-boutique.de/catalog",
}: WelcomeEmailProps) {
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
                Willkommen
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
                Willkommen in der Welt von SONA Boutique, {customerName}.
              </h1>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4A4A4A" }}>
                Herzlich willkommen in unserem erlesenen Kreis. Als registriertes Mitglied genießen
                Sie exklusiven Zugang zu zertifizierten Luxus-Handtaschenikonen von Hermès, Chanel,
                Louis Vuitton und weiteren Haute-Couture Modehäusern.
              </p>

              {/* Welcome Code Box */}
              <div
                style={{
                  backgroundColor: "#FAF9F6",
                  border: "1px dashed #C5A880",
                  padding: "20px",
                  textAlign: "center",
                  margin: "30px 0",
                }}
              >
                <span
                  style={{
                    fontSize: "10px",
                    textTransform: "uppercase",
                    color: "#6B6B6B",
                    display: "block",
                  }}
                >
                  Ihr persönliches Willkommensgeschenk
                </span>
                <span
                  style={{
                    fontSize: "20px",
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    color: "#C5A880",
                    letterSpacing: "0.2em",
                    display: "block",
                    margin: "8px 0",
                  }}
                >
                  WELCOME10
                </span>
                <span style={{ fontSize: "11px", color: "#6B6B6B" }}>
                  Gültig für 10% Rabatt auf Ihre erste Bestellung.
                </span>
              </div>

              <div style={{ textAlign: "center" }}>
                <a
                  href={catalogUrl}
                  style={{
                    backgroundColor: "#1A1A1A",
                    color: "#FAF9F6",
                    padding: "14px 28px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Kollektion Entdecken →
                </a>
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
              }}
            >
              <p style={{ margin: "0" }}>
                SONA Boutique GmbH · Authentizität, Eleganz & Wertbeständigkeit
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default WelcomeEmail;
