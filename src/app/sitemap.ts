import { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sona-boutique.de";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statische Seiten
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/verkaufen`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/versandkosten`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/impressum`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/datenschutz`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/agb`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/widerruf`, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Produkte (nur PUBLISHED)
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Brands
  const brands = await db.brand.findMany({
    select: { slug: true },
  });

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${BASE_URL}/catalog?brand=${b.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...brandPages];
}