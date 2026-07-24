import * as React from "react";

type PasswordResetEmailProps = {
  resetUrl?: string;
};

export function PasswordResetEmail({
  resetUrl = "https://sona-boutique.de/reset/confirm?token=xyz",
}: PasswordResetEmailProps) {
  return (
    <div
      style={{ fontFamily: "serif", padding: "20px", color: "#1A1A1A", backgroundColor: "#FAF9F6" }}
    >
      <h1 style={{ color: "#C5A880", fontStyle: "italic" }}>SONA BOUTIQUE</h1>
      <h2>Passwort zurücksetzen</h2>
      <p>
        Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt. Klicken Sie auf den
        folgenden Link:
      </p>
      <p>
        <a href={resetUrl} style={{ color: "#C5A880", fontWeight: "bold" }}>
          Passwort jetzt zurücksetzen
        </a>
      </p>
      <p style={{ fontSize: "11px", color: "#6B6B6B" }}>
        Dieser Link ist 1 Stunde lang gültig. Wenn Sie diese Anfrage nicht gestellt haben, können
        Sie diese E-Mail ignorieren.
      </p>
    </div>
  );
}

export default PasswordResetEmail;
