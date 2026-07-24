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
export async function generateUploadSignature(folder: string = "sona-boutique/products") {
  const timestamp = Math.round(Date.now() / 1000);
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "demo_secret";

  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY || "demo_key",
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "demo_cloud",
    folder,
  };
}
