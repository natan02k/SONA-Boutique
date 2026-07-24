import * as React from "react";

type WelcomeEmailProps = {
  customerName?: string;
};

export function WelcomeEmail({ customerName = "Wertgeschätztes Mitglied" }: WelcomeEmailProps) {
  return (
    <div
      style={{ fontFamily: "serif", padding: "20px", color: "#1A1A1A", backgroundColor: "#FAF9F6" }}
    >
      <h1 style={{ color: "#C5A880", fontStyle: "italic" }}>SONA BOUTIQUE</h1>
      <h2>Willkommen in der Welt von SONA Boutique</h2>
      <p>Sehr geehrte/r {customerName},</p>
      <p>
        herzlich willkommen bei SONA Boutique. Als Mitglied erhalten Sie exklusiven Zugang zu
        zertifizierten Luxus-Handtaschenikonen von Hermès, Chanel, Louis Vuitton und weiteren
        Modehäusern.
      </p>
      <p>
        Verwenden Sie den Gutscheincode <strong>WELCOME10</strong> für 10% Rabatt auf Ihre erste
        Bestellung.
      </p>
      <hr style={{ borderColor: "#E8E5DC", margin: "20px 0" }} />
      <p style={{ fontSize: "12px", color: "#6B6B6B" }}>
        SONA Boutique — Authentizität, Eleganz & Wertbeständigkeit
      </p>
    </div>
  );
}

export default WelcomeEmail;
