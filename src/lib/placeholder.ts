/**
 * Shared fallback placeholder image URL for products without images.
 * Uses a neutral-toned SVG data URI to avoid external dependencies.
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23F5F4EE' width='400' height='400'/%3E%3Ctext x='200' y='200' text-anchor='middle' dy='.3em' fill='%23C5A880' font-family='serif' font-size='14'%3ESONA%3C/text%3E%3Ctext x='200' y='222' text-anchor='middle' fill='%236B6B6B' font-family='monospace' font-size='9'%3EKein Bild%3C/text%3E%3C/svg%3E";