import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const consignmentRequest = await db.consignmentRequest.findUnique({
      where: { id },
      include: {
        consignor: {
          select: { firstName: true, email: true },
        },
      },
    });

    if (!consignmentRequest) {
      return NextResponse.json({ error: "Anfrage nicht gefunden." }, { status: 404 });
    }

    return NextResponse.json({ request: consignmentRequest });
  } catch (error) {
    console.error("Fetch consignment error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
