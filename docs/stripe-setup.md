# SONA Boutique — Stripe Integration & Webhook Setup

Dieses Dokument beschreibt die Konfiguration, das lokale Webhook-Testing und die Testkarten für die Stripe Checkout-Integration.

---

## 1. Umgebungsvariablen (.env.local)

Fügen Sie folgende Variablen in Ihre `.env.local` ein:

```env
# Stripe Test-Keys (Dev / Staging)
STRIPE_SECRET_KEY="sk_test_51..."
NEXT_PUBLIC_STRIPE_PUBLIC_KEY="pk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 2. Lokales Webhook-Testing via Stripe CLI

1. **Stripe CLI installieren (macOS):**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Stripe Account verknüpfen:**
   ```bash
   stripe login
   ```

3. **Webhook-Forwarding an den lokalen Server starten:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Webhook Secret kopieren:**
   Der Output der Stripe CLI liefert das Formular `whsec_...`. Kopieren Sie diesen Wert in `STRIPE_WEBHOOK_SECRET` in Ihrer `.env.local`.

---

## 3. Stripe Test-Karten (SCA & 3D Secure)

| Fall | Testkarte | Ablaufdatum | CVC | Verhalten |
| :--- | :--- | :--- | :--- | :--- |
| **Erfolgreiche Zahlung** | `4242 4242 4242 4242` | Zukünftiges Datum | `123` | Session abgeschlossen (`checkout.session.completed`) |
| **SCA / 3D Secure** | `4000 0027 6000 3184` | Zukünftiges Datum | `123` | Löst Authentifizierungs-Modal aus |
| **Fehlgeschlagene Zahlung** | `4000 0000 0000 9995` | Zukünftiges Datum | `123` | `payment_intent.payment_failed` -> Stock wird restauriert |

---

## 4. Unterstützte Webhook Events

- `checkout.session.completed`: Markiert die Bestellung als `PAID` und zieht den Lagerbestand ab.
- `payment_intent.payment_failed`: Markiert die Bestellung als `FAILED` und stellt den Lagerbestand wieder her.
- `charge.dispute.created`: Sperrt die Bestellung und benachrichtigt das Admin-Team.
- `charge.refunded`: Aktualisiert den `paymentStatus` auf `REFUNDED` / `PARTIALLY_REFUNDED`.
