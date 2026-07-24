export type TaxInfo = {
  rate: number;
  name: string;
  isEU: boolean;
};

export const TAX_RATES: Record<string, TaxInfo> = {
  DE: { rate: 0.19, name: "Deutschland (19%)", isEU: true },
  AT: { rate: 0.20, name: "Österreich (20%)", isEU: true },
  FR: { rate: 0.20, name: "Frankreich (20%)", isEU: true },
  IT: { rate: 0.22, name: "Italien (22%)", isEU: true },
  NL: { rate: 0.21, name: "Niederlande (21%)", isEU: true },
  CH: { rate: 0.00, name: "Schweiz (0% — MwSt. wird beim Zoll erhoben)", isEU: false },
};

/**
 * Returns tax rate decimal for given country code (default 0.19 DE).
 */
export function getTaxRate(countryCode: string): number {
  if (isSmallBusiness()) return 0.0;
  const uppercaseCode = countryCode.toUpperCase();
  return TAX_RATES[uppercaseCode]?.rate ?? 0.19;
}

export function getTaxInfo(countryCode: string): TaxInfo {
  const uppercaseCode = countryCode.toUpperCase();
  const info = TAX_RATES[uppercaseCode];
  if (info) return info;
  return TAX_RATES["DE"]!;
}

export function isEUCountry(countryCode: string): boolean {
  const uppercaseCode = countryCode.toUpperCase();
  return TAX_RATES[uppercaseCode]?.isEU ?? false;
}

export function isSmallBusiness(): boolean {
  return process.env.NEXT_PUBLIC_SMALL_BUSINESS === "true";
}
