# SONA Boutique — Stripe Testing & Refund / Dispute Audit

Dieses Dokument beschreibt das schrittweise Testen von Stripe Rückerstattungen (Full & Partial Refunds) sowie Dispute-Szenarien.

---

## 1. Test-Karten & Trigger

| Testfall | Kartennummer | Verhalten |
| :--- | :--- | :--- |
| **Standard Erfolgreich** | `4242 4242 4242 4242` | Checkout schließt mit `PAID` ab. Erstattbar via Admin UI. |
| **Dispute Simulation** | `4000 0000 0000 0259` | Simuliert Zahlungsanfechtung / Chargeback. |

---

## 2. Testen von Rückerstattungen (Admin UI)

1. Rufen Sie die Admin-Konsole unter `/admin/orders` auf.
2. Wählen Sie eine bezahlte Bestellung (`paymentStatus: PAID`).
3. Klicken Sie auf **"Rückerstattung Veranlassen"**:
   - **Volle Rückerstattung**: 
     - Veranlasst die Erstattung des gesamten Betrags via Stripe API.
     - Setzt `paymentStatus = REFUNDED`.
     - **WICHTIG (Inventar-Restaurierung)**: Nur bei einer VOLLEN Rückerstattung wird das Inventar der Tasche in der DB wieder aufgestockt.
   - **Partielle Rückerstattung**:
     - Betrag in € eingeben.
     - Setzt `paymentStatus = PARTIALLY_REFUNDED`.
     - Erhöht das Feld `partialRefundCents`.
     - **WICHTIG**: Das Inventar wird NICHT restauriert (Tasche verbleibt beim Kunden).

---

## 3. Testen von Disputes via Stripe CLI

Um den Dispute Webhook lokal zu testen, führen Sie in Ihrem Terminal aus:

```bash
# 1. Webhook Listener starten
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 2. In einem zweiten Terminal: Dispute-Event simulieren
stripe trigger charge.dispute.created
```

**Erwartetes Systemverhalten:**
- Webhook empfängt `charge.dispute.created`.
- Der Bestellstatus wird auf `CANCELLED` gesetzt, um die Bearbeitung zu blockieren.
- Eine E-Mail-Warnung wird an `support@sona-boutique.de` gesendet.

Bei Entscheidung des Disputes (`stripe trigger charge.dispute.closed`):
- `won`: Der Bestellstatus wird auf `PENDING` zurückgesetzt.
- `lost`: Der Bezahlstatus wird auf `REFUNDED` gesetzt.
