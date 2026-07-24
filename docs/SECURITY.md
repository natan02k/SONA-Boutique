# SONA Boutique — IT-Security & Compliance Audit

Dokumentation aller implementierten Sicherheitsmaßnahmen, Schutzmechanismen und Compliance-Standards.

---

## 1. Security Summary & Architektur-Härtung

| Sicherheitsbereich | Maßnahme / Standard | Status |
| :--- | :--- | :--- |
| **Passwort-Hashing** | Argon2id (`@node-rs/argon2`, memoryCost: 19456, timeCost: 2) | ✅ Aktiviert |
| **Session-Sicherheit** | 32-Byte Entropie-Tokens, HttpOnly, Secure, SameSite=Strict Cookies | ✅ Aktiviert |
| **CSRF-Schutz** | Origin- & Referer-Verifikation für alle mutierenden API-Methoden | ✅ Aktiviert |
| **Rate-Limiting** | In-Memory Sliding Window (IP-basiert) mit Retry-After Header | ✅ Aktiviert |
| **Security Headers** | CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff | ✅ Aktiviert |
| **Stripe Webhooks** | HMAC-SHA256 Signatur-Verifikation via `stripe.webhooks.constructEvent` | ✅ Aktiviert |
| **SQL-Injection** | Prisma ORM parametrisierte SQL-Abfragen | ✅ Immunität |
| **XSS-Schutz** | React JSX Auto-Escaping, 0x `dangerouslySetInnerHTML` | ✅ Aktiviert |

---

## 2. Security Headers (HTTP Response Headers)

Die HTTP-Response-Header werden sowohl über `next.config.ts` als auch über `middleware.ts` erzwungen:

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://api.resend.com; frame-src https://js.stripe.com https://hooks.stripe.com; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com;
```

---

## 3. Rate-Limiting Schwellenwerte

| Endpunkt | Limit | Zeitfenster | Aktion bei Überschreitung |
| :--- | :--- | :--- | :--- |
| `POST /api/auth/login` | 5 Anfragen | 15 Minuten | `429 Too Many Requests` |
| `POST /api/auth/register` | 3 Anfragen | 60 Minuten | `429 Too Many Requests` |
| `POST /api/auth/reset/*` | 3 Anfragen | 60 Minuten | `429 Too Many Requests` |
| `POST /api/checkout` | 3 Anfragen | 15 Minuten | `429 Too Many Requests` |
| `POST/PATCH /api/cart/*` | 30 Anfragen | 1 Minute | `429 Too Many Requests` |
| Allgemeine API-Routen | 60 Anfragen | 1 Minute | `429 Too Many Requests` |

---

## 4. Input-Validierung (Zod Schemas)

Jede API-Route validiert eingehende Payload-Daten strikt über Zod-Schemas vor der Ausführung von Geschäftslogik:
- `authSchema` (`registerSchema`, `loginSchema`, `passwordResetRequestSchema`)
- `checkoutSchema` (Lieferanschrift, Rechnungsanschrift, E-Mail, Telefon)
- `cartItemSchema`, `updateCartItemSchema`, `applyPromoSchema`
- `adminProductSchema`, `adminOrderUpdateSchema`, `refundSchema`

---

## 5. Security Audit Checklist

- [x] Passwörter werden niemals im Klartext gespeichert
- [x] Kein Aufruf von `dangerouslySetInnerHTML` im gesamten Codebase
- [x] Keine hartcodierten API-Keys oder Live-Geheimnisse im Quellcode
- [x] Stripe Webhook verifiziert ungepuffertes Roh-Body-Event mit Signatur
- [x] Admin-Routen leiten unauthentifizierte Zugriffe automatisch ab
- [x] Inventar-Restaurierung bei Erstattungen ist an strikte Voll-Erstattungs-Bedingungen gekoppelt
