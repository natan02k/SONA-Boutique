/**
 * Generates a tracking URL based on the carrier name and tracking number.
 */
export function getTrackingUrl(carrier: string, trackingNo: string): string {
  const carrierLower = carrier.toLowerCase();

  if (carrierLower.includes("dhl")) {
    return `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?idc=${trackingNo}`;
  }
  if (carrierLower.includes("ups")) {
    return `https://www.ups.com/track?tracknum=${trackingNo}`;
  }
  if (carrierLower.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNo}`;
  }
  if (carrierLower.includes("dpd")) {
    return `https://tracking.dpd.de/parcelstatus?query=${trackingNo}`;
  }
  if (carrierLower.includes("hermes")) {
    return `https://www.myhermes.de/empfangen/sendungsverfolgung/?sendungsnummer=${trackingNo}`;
  }

  // Fallback: generic tracking search
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier} ${trackingNo} Sendungsverfolgung`)}`;
}

/**
 * Available carrier options for the admin fulfillment dropdown.
 */
export const CARRIER_OPTIONS = [
  { value: "DHL Express", label: "DHL Express" },
  { value: "UPS", label: "UPS" },
  { value: "FedEx", label: "FedEx" },
  { value: "DPD", label: "DPD" },
  { value: "Hermes", label: "Hermes" },
] as const;

/**
 * Formats the shipment carrier for display with a badge-like label.
 */
export function formatCarrier(carrier: string): string {
  return carrier || "Nicht angegeben";
}