import { NextResponse } from "next/server";

// Notice messages shown in the rotating TopNoticeBar
// TODO: Store these in a DB settings table for admin management
const notices = [
  "✦ Authentifiziert durch zertifizierte Gutachter ✦",
  "✦ Versicherter DHL Express Versand inklusive ✦",
  "✦ 14 Tage volles Rückgaberecht ✦",
];

export async function GET() {
  return NextResponse.json({ notices });
}