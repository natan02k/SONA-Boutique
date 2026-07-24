import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import ConsignmentOfferEmail from "@/emails/consignment-offer";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const offeredType = body.offeredType || "SALE"; // "SALE" | "CONSIGNMENT"
    const offeredPriceCents = body.offeredPriceCents ? Number(body.offeredPriceCents) : null;
    const commissionRate = body.commissionRate ? Number(body.commissionRate) : null;

    const consignmentRequest = await db.consignmentRequest.findUnique({
      where: { id },
      include: { consignor: true },
    });

    if (!consignmentRequest) {
      return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    }

    const updated = await db.consignmentRequest.update({
      where: { id },
      data: {
        status: "OFFER_MADE",
        offeredType,
        offeredPriceCents,
        commissionRate,
        offerExpiresAt: new Date(Date.now() + 7 * 86400 * 1000), // 7 Tage
      },
    });

    const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const offerUrl = `${host}/verkaufen/angebot/${id}`;

    const offeredAmountFormatted = offeredPriceCents
      ? (offeredPriceCents / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })
      : `${((commissionRate || 0.25) * 100).toFixed(0)}% Kommissionserlös`;

    try {
      await sendEmail({
        to: consignmentRequest.consignor.email,
        subject: `Exklusives Wertangebot für Ihre ${consignmentRequest.brandName} ${consignmentRequest.modelName} — SONA Boutique`,
        react: React.createElement(ConsignmentOfferEmail, {
          firstName: consignmentRequest.consignor.firstName,
          brandName: consignmentRequest.brandName,
          modelName: consignmentRequest.modelName,
          requestId: consignmentRequest.id,
          offeredType: offeredType as "SALE" | "CONSIGNMENT",
          offeredAmountFormatted,
          offerUrl,
        }),
      });
    } catch (mailErr) {
      console.error("Failed to send offer email:", mailErr);
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Send offer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
