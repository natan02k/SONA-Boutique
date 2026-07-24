# SONA Boutique — DNS & E-Mail Infrastruktur Dokumentation

**Domain:** `sona-boutique.de`  
**Hosting / Webserver:** Vercel Inc.  
**E-Mail-Provider:** Resend (`resend.com`) / SMTP Fallback  

---

## 1. DNS Resource Records (Vercel & Domain Registrar)

Für den Betrieb von Frontend, Backend und authentifiziertem E-Mail-Versand sind folgende DNS-Einträge bei Ihrem Domain-Registrar einzutragen:

```text
# 1. Frontend A Record (Vercel Anycast IP)
sona-boutique.de.                   IN A     76.76.21.21

# 2. CNAME Record für Subdomain www
www.sona-boutique.de.               IN CNAME cname.vercel-dns.com.

# 3. MX Records (für E-Mail-Empfang & DMARC-Reports)
sona-boutique.de.                   IN MX    10 mail.sona-boutique.de.

# 4. SPF Record (Sender Policy Framework für Resend)
sona-boutique.de.                   IN TXT   "v=spf1 include:_spf.resend.com ~all"

# 5. DKIM Record (DomainKeys Identified Mail von Resend)
resend._domainkey.sona-boutique.de. IN TXT   "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuW..."

# 6. DMARC Record (Domain-based Message Authentication, Reporting, and Conformance)
_dmarc.sona-boutique.de.            IN TXT   "v=DMARC1; p=quarantine; rua=mailto:dmarc@sona-boutique.de; pct=100; adkim=s; aspf=s"
```

---

## 2. E-Mail-Adressen Struktur

| E-Mail-Adresse | Verwendungszweck | Provider / Weiterleitung |
| :--- | :--- | :--- |
| `noreply@sona-boutique.de` | Transaktions-E-Mails (Bestellbestätigungen, Passwort-Reset, Versand) | Resend API (`RESEND_API_KEY`) |
| `info@sona-boutique.de` | Allgemeine Kundenanfragen & Kontaktformular | Inbound Mailbox |
| `support@sona-boutique.de` | Kundenservice & Retouren-Abwicklung | Inbound Mailbox |
| `dmarc@sona-boutique.de` | Automatische DMARC-Aggregatberichte | DMARC Reporter |

---

## 3. Resend Setup & Umgebungsvariablen

1. **Resend Registrierung:** Account auf `resend.com` anlegen.
2. **Domain Verifizierung:** Domain `sona-boutique.de` hinzufügen und DKIM TXT-Einträge bestätigen lassen.
3. **API-Key Konfiguration:**
   In `.env.local` eintragen:
   ```env
   RESEND_API_KEY="re_123456789_abcdefghijklmnopqrstuvwxyz"
   EMAIL_FROM="SONA Boutique <noreply@sona-boutique.de>"
   ```

---

## 4. Zustellbarkeits-Checklist

- [x] SPF-Eintrag erlaubt `_spf.resend.com`
- [x] DKIM 2048-Bit Schlüssel verifiziert
- [x] DMARC Policy auf `p=quarantine` mit 100% Durchsetzung
- [x] TLS 1.3 Verschlüsselung erzwungen
