/**
 * Cloudinary image transformation helpers.
 * Automatically appends optimised transformation parameters to Cloudinary URLs.
 */

type TransformOptions = {
  width?: number;
  height?: number;
  quality?: "auto" | "auto:best" | "auto:good" | "auto:eco" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb" | "crop" | "pad";
  gravity?: "auto" | "face" | "center";
  dpr?: "auto" | number;
};

const CLOUDINARY_BASE = "https://res.cloudinary.com";

/**
 * Returns true if the URL is hosted on Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  return url?.startsWith(CLOUDINARY_BASE) || url?.includes("res.cloudinary.com");
}

/**
 * Builds a Cloudinary transformation string from options.
 */
function buildTransformation(opts: TransformOptions): string {
  const parts: string[] = [];
  if (opts.width) parts.push(`w_${opts.width}`);
  if (opts.height) parts.push(`h_${opts.height}`);
  if (opts.crop) parts.push(`c_${opts.crop}`);
  if (opts.gravity) parts.push(`g_${opts.gravity}`);
  if (opts.quality) parts.push(`q_${opts.quality}`);
  if (opts.format) parts.push(`f_${opts.format}`);
  if (opts.dpr) parts.push(`dpr_${opts.dpr}`);
  return parts.join(",");
}

/**
 * Injects Cloudinary transformations into an existing Cloudinary URL.
 * Non-Cloudinary URLs are returned unchanged.
 *
 * @example
 * cloudinaryTransform("https://res.cloudinary.com/demo/image/upload/sample.jpg", { width: 800, format: "auto", quality: "auto" })
 * // → "https://res.cloudinary.com/demo/image/upload/w_800,f_auto,q_auto/sample.jpg"
 */
export function cloudinaryTransform(url: string, opts: TransformOptions): string {
  if (!url || !isCloudinaryUrl(url)) return url;

  const transformation = buildTransformation(opts);
  if (!transformation) return url;

  // Insert transformation after "/upload/" or "/fetch/"
  return url.replace(/\/(upload|fetch)\//, `/$1/${transformation}/`);
}

/** Pre-built helpers for common image sizes used in SONA Boutique */

/** Product thumbnail — 400x400, auto quality & format */
export function productThumb(url: string): string {
  return cloudinaryTransform(url, {
    width: 400,
    height: 400,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/** Product gallery main image — 900x900, auto quality & format */
export function productGallery(url: string): string {
  return cloudinaryTransform(url, {
    width: 900,
    height: 900,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "auto",
  });
}

/** Hero / full-bleed banner — 1920w, auto quality & format */
export function heroBanner(url: string): string {
  return cloudinaryTransform(url, {
    width: 1920,
    crop: "scale",
    quality: "auto",
    format: "auto",
  });
}

/** Small card / email thumbnail — 200x200, auto quality & format */
export function cardThumb(url: string): string {
  return cloudinaryTransform(url, {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "auto",
  });
}
