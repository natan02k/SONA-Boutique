import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Generates presigned upload parameters for Cloudinary uploads.
 */
export async function generateUploadSignature(
  folder: string = "sona-boutique/products",
  resourceType: "image" | "auto" = "image"
) {
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "demo_secret";

  const params: Record<string, string | number> = { timestamp, folder };
  if (resourceType === "auto") {
    params.resource_type = "auto";
  }

  const signature = cloudinary.utils.api_sign_request(params, apiSecret);

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY || "demo_key",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo_cloud",
    folder,
    resourceType,
  };
}

/**
 * Generates presigned upload parameters specifically for PDF/documents.
 */
export async function generateDocumentUploadSignature(
  folder: string = "sona-boutique/certificates"
) {
  return generateUploadSignature(folder, "auto");
}
