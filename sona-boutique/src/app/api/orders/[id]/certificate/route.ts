import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch order with customer + product details
    const order = await db.order.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Bestellung nicht gefunden" }, { status: 404 });
    }

    // Access control: only owner or admin
    const currentCustomer = await getCurrentCustomer();
    const isOwner = currentCustomer && order.customerId === currentCustomer.id;
    const isAdmin = currentCustomer?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Zugriff verweigert" }, { status: 403 });
    }

    // Build HTML for the PDF (we'll use a simple approach with native PDF generation)
    const product = order.items[0]?.product;
    if (!product) {
      return NextResponse.json({ error: "Keine Produkte in dieser Bestellung" }, { status: 400 });
    }

    const certNumber = product.authenticityCertNo || `SONA-CERT-${order.number}`;
    const customerName = `${order.firstName} ${order.lastName}`;
    const orderDate = new Date(order.placedAt).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Generate a simple but elegant HTML certificate
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      background: #FAF9F6;
      color: #1A1A1A;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 40mm 25mm;
      position: relative;
    }
    .border-frame {
      position: absolute;
      top: 15mm; left: 15mm;
      right: 15mm; bottom: 15mm;
      border: 1px solid #C5A880;
      pointer-events: none;
    }
    .inner-border {
      position: absolute;
      top: 18mm; left: 18mm;
      right: 18mm; bottom: 18mm;
      border: 0.5px solid #E8E5DC;
      pointer-events: none;
    }
    .header {
      text-align: center;
      margin-bottom: 30mm;
    }
    .logo {
      font-family: 'Georgia', serif;
      font-size: 28px;
      letter-spacing: 6px;
      color: #C5A880;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .subtitle {
      font-family: 'Georgia', serif;
      font-size: 11px;
      letter-spacing: 3px;
      color: #9A9080;
      text-transform: uppercase;
    }
    .divider {
      width: 60%;
      height: 0.5px;
      background: #C5A880;
      margin: 8mm auto;
    }
    .cert-title {
      text-align: center;
      font-family: 'Georgia', serif;
      font-size: 18px;
      letter-spacing: 4px;
      color: #1A1A1A;
      text-transform: uppercase;
      margin-bottom: 15mm;
    }
    .product-name {
      text-align: center;
      font-family: 'Georgia', serif;
      font-size: 22px;
      color: #1A1A1A;
      margin-bottom: 3mm;
    }
    .brand-name {
      text-align: center;
      font-family: 'Georgia', serif;
      font-size: 14px;
      color: #C5A880;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 12mm;
    }
    .details {
      width: 80%;
      margin: 0 auto 15mm;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 3mm 0;
      border-bottom: 0.5px solid #E8E5DC;
      font-size: 10px;
    }
    .detail-label {
      color: #9A9080;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .detail-value {
      color: #1A1A1A;
      font-weight: bold;
    }
    .auth-text {
      width: 80%;
      margin: 0 auto 15mm;
      text-align: center;
      font-size: 9.5px;
      line-height: 1.8;
      color: #6B6B6B;
      font-style: italic;
    }
    .signature-area {
      width: 80%;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      padding-top: 10mm;
    }
    .signature-line {
      width: 45%;
      text-align: center;
    }
    .sig-line {
      border-top: 0.5px solid #1A1A1A;
      padding-top: 3mm;
      font-size: 9px;
      color: #6B6B6B;
    }
    .footer {
      position: absolute;
      bottom: 20mm;
      left: 25mm;
      right: 25mm;
      text-align: center;
      font-size: 7.5px;
      color: #9A9080;
      letter-spacing: 1px;
      border-top: 0.5px solid #E8E5DC;
      padding-top: 4mm;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="border-frame"></div>
    <div class="inner-border"></div>

    <div class="header">
      <div class="logo">SONA Boutique</div>
      <div class="subtitle">Pre-Owned Luxury Handbags</div>
    </div>

    <div class="divider"></div>

    <div class="cert-title">Echtheitszertifikat</div>

    <div class="product-name">${product.title}</div>
    <div class="brand-name">${product.brand.name}</div>

    <div class="details">
      <div class="detail-row">
        <span class="detail-label">Zertifikats-Nummer</span>
        <span class="detail-value">${certNumber}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Bestellnummer</span>
        <span class="detail-value">#${order.number}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Datum</span>
        <span class="detail-value">${orderDate}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Kunde</span>
        <span class="detail-value">${customerName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">SKU</span>
        <span class="detail-value">${product.sku}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Zustand</span>
        <span class="detail-value">${product.condition}</span>
      </div>
    </div>

    <div class="auth-text">
      Hiermit bestätigen wir, dass das oben genannte Produkt einer mehrstufigen Authentifizierung unterzogen wurde. Unsere zertifizierten Gutachter haben Material, Hardware, Stichtechnik, Seriennummern und herstellerspezifische Merkmale geprüft. Die Echtheit wird von SONA Boutique garantiert.
    </div>

    <div class="signature-area">
      <div class="signature-line">
        <div class="sig-line">SONA Boutique Authentication Team</div>
      </div>
      <div class="signature-line">
        <div class="sig-line">${orderDate}</div>
      </div>
    </div>

    <div class="footer">
      SONA Boutique · Echtheitszertifikat · Zertifikat-Nr: ${certNumber}
    </div>
  </div>
</body>
</html>`;

    // Use a simple approach: return HTML that can be printed as PDF
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="echtheitszertifikat-${order.number}.html"`,
      },
    });
  } catch (error) {
    console.error("[CERTIFICATE_ERROR]", error);
    return NextResponse.json(
      { error: "Fehler bei der Generierung des Zertifikats" },
      { status: 500 }
    );
  }
}