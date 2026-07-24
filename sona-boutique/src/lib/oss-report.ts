import { db } from "@/lib/db";
import { isEUCountry } from "./tax";

export type OSSCountryReport = {
  countryCode: string;
  orderCount: number;
  totalAmountCents: number;
  taxAmountCents: number;
};

export type OSSReport = {
  year: number;
  quarter: number;
  startDate: Date;
  endDate: Date;
  countryReports: OSSCountryReport[];
  totalEUAmountCents: number;
  totalEUTaxCents: number;
};

/**
 * Calculates OSS EU VAT report for specified year and quarter.
 */
export async function getOSSReport(year: number, quarter: 1 | 2 | 3 | 4): Promise<OSSReport> {
  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(Date.UTC(year, startMonth, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));

  const orders = await db.order.findMany({
    where: {
      paymentStatus: "PAID",
      placedAt: {
        gte: startDate,
        lte: endDate,
      },
      shippingCountry: {
        not: "DE",
      },
    },
    select: {
      id: true,
      shippingCountry: true,
      totalCents: true,
      taxCents: true,
    },
  });

  const countryMap: Record<string, OSSCountryReport> = {};

  for (const order of orders) {
    const country = order.shippingCountry.toUpperCase();
    if (!isEUCountry(country)) continue;

    if (!countryMap[country]) {
      countryMap[country] = {
        countryCode: country,
        orderCount: 0,
        totalAmountCents: 0,
        taxAmountCents: 0,
      };
    }

    countryMap[country].orderCount += 1;
    countryMap[country].totalAmountCents += order.totalCents;
    countryMap[country].taxAmountCents += order.taxCents;
  }

  const countryReports = Object.values(countryMap);
  const totalEUAmountCents = countryReports.reduce((sum, r) => sum + r.totalAmountCents, 0);
  const totalEUTaxCents = countryReports.reduce((sum, r) => sum + r.taxAmountCents, 0);

  return {
    year,
    quarter,
    startDate,
    endDate,
    countryReports,
    totalEUAmountCents,
    totalEUTaxCents,
  };
}

/**
 * Formats OSS report data as CSV string for tax accountants.
 */
export function exportOSSReportCsv(report: OSSReport): string {
  const headers = "Land,Anzahl_Bestellungen,Umsatz_Euro,MwSt_Euro\n";
  const rows = report.countryReports
    .map(
      (r) =>
        `${r.countryCode},${r.orderCount},${(r.totalAmountCents / 100).toFixed(2)},${(r.taxAmountCents / 100).toFixed(2)}`,
    )
    .join("\n");

  const totals = `\nGESAMT_EU,,${(report.totalEUAmountCents / 100).toFixed(2)},${(report.totalEUTaxCents / 100).toFixed(2)}`;

  return headers + rows + totals;
}
