import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { db } from "@/lib/db";
import { getCurrentCustomer } from "@/lib/auth";
import { consignmentRequestSchema } from "@/lib/validators/consignment";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email";
import ConsignmentReceivedEmail from "@/emails/consignment-received";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`consignment:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte versuchen Sie es in 1 Stunde erneut." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const parsed = consignmentRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabedaten", details: parsed.error.format() },
        { status: 422 },
      );
    }

    const data = parsed.data;
    const customer = await getCurrentCustomer();

    // Find or create Consignor record
    let consignor = await db.consignor.findUnique({
      where: { email: data.email },
    });

    if (!consignor) {
      consignor = await db.consignor.create({
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || null,
          customerId: customer?.id || null,
        },
      });
    }

    // Create ConsignmentRequest
    const consignmentRequest = await db.consignmentRequest.create({
      data: {
        consignorId: consignor.id,
        brandName: data.brandName,
        modelName: data.modelName,
        estimatedCondition: data.estimatedCondition,
        description: data.description,
        photos: JSON.stringify(data.photos),
        desiredType: data.desiredType,
        status: "SUBMITTED",
      },
    });

    // Send confirmation email to seller
    try {
      await sendEmail({
        to: data.email,
        subject: `Ihre Anfrage für ${data.brandName} ${data.modelName} — SONA Boutique`,
        react: React.createElement(ConsignmentReceivedEmail, {
          firstName: data.firstName,
          brandName: data.brandName,
          modelName: data.modelName,
          requestId: consignmentRequest.id,
        }),
      });
    } catch (mailErr) {
      console.error("Failed to send consignment confirmation email:", mailErr);
    }

    return NextResponse.json({
      success: true,
      requestId: consignmentRequest.id,
    });
  } catch (error) {
    console.error("Consignment Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
