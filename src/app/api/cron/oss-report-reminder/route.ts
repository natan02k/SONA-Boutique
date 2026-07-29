import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Send quarterly OSS report reminder email to admin
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_FROM, // Send to shop owner
        subject: "📊 EU-OSS Quartalsmeldung fällig",
        html: `<div style="font-family: Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #C5A880;">EU-OSS Quartalsmeldung</h1>
          <p>Sehr geehrte/r Shop-Betreiber/in,</p>
          <p>die quartalsweise EU-OSS Umsatzmeldung steht an. Bitte melden Sie sich in Ihrem
          <a href="https://ec.europa.eu/oss" style="color: #C5A880;">EU-OSS Portal</a> an
          und übermitteln Sie die Umsatzdaten für das vergangene Quartal.</p>
          <p>Sie können den OSS-Report unter <code>/api/admin/oss-report</code> als CSV exportieren.</p>
          <hr style="border: none; border-top: 1px solid #E8E5DC;" />
          <p style="font-size: 12px; color: #6B6B6B;">SONA Boutique · Automatisierte Erinnerung</p>
        </div>`,
      });
    }

    return NextResponse.json({
      status: "ok",
      reminderSent: !!process.env.RESEND_API_KEY,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON_OSS_REPORT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}