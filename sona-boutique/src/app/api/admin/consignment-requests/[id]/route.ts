import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (body.status) dataToUpdate.status = body.status;
    if (body.adminNotes !== undefined) dataToUpdate.adminNotes = body.adminNotes;
    if (body.receivedAt) dataToUpdate.receivedAt = new Date(body.receivedAt);
    if (body.finalPayoutCents !== undefined)
      dataToUpdate.finalPayoutCents = Number(body.finalPayoutCents);

    const updated = await db.consignmentRequest.update({
      where: { id },
      data: dataToUpdate,
      include: { consignor: true },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Patch consignment request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
