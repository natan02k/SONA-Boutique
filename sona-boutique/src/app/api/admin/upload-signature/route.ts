import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "sona-boutique/products";

    const signature = await generateUploadSignature(folder);

    return NextResponse.json(signature);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Upload signature error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
