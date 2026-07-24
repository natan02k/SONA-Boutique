import * as React from "react";

type PasswordResetEmailProps = {
  customerName?: string;
  resetUrl?: string;
};

export function PasswordResetEmail({
  customerName = "Mitglied",
  resetUrl = "https://sona-boutique.de/reset/confirm?token=demo_token",
}: PasswordResetEmailProps) {
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
                Konto-Sicherheit
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
                Passwort zurücksetzen
              </h1>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4A4A4A" }}>
                Guten Tag {customerName},
              </p>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#4A4A4A" }}>
                Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Kundenkonto bei SONA
                Boutique gestellt. Klicken Sie auf die folgende Schaltfläche, um ein neues Passwort
                zu vergeben:
              </p>

              <div style={{ textAlign: "center", margin: "30px 0" }}>
                <a
                  href={resetUrl}
                  style={{
                    backgroundColor: "#1A1A1A",
                    color: "#FAF9F6",
                    border: "1px solid #C5A880",
                    padding: "14px 28px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Passwort Jetzt Zurücksetzen →
                </a>
              </div>

              <p style={{ fontSize: "12px", color: "#6B6B6B", lineHeight: "1.6" }}>
                <strong>Sicherheitshinweis:</strong> Dieser Link ist aus Sicherheitsgründen nur 1
                Stunde lang gültig. Falls Sie diese Anfrage nicht selbst veranlasst haben, können
                Sie diese E-Mail ignorieren. Ihr Passwort bleibt unverändert.
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
              }}
            >
              <p style={{ margin: "0" }}>SONA Boutique GmbH · Sicherheit & Datenschutz</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default PasswordResetEmail;
