export type Consent = {
  essential: true; // Immer true
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
};

export function getConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/cookie_consent=([^;]+)/);
  if (!match || !match[1]) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function setConsent(consent: Omit<Consent, "essential" | "timestamp">) {
  const full: Consent = {
    essential: true,
    ...consent,
    timestamp: new Date().toISOString(),
  };
  const cookieValue = encodeURIComponent(JSON.stringify(full));
  const maxAge = 365 * 86400; // 1 Jahr
  document.cookie = `cookie_consent=${cookieValue}; max-age=${maxAge}; path=/; SameSite=Strict`;
  window.dispatchEvent(new Event("consent-updated"));
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return getConsent()?.marketing === true;
}
