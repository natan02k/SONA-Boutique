import { z } from "zod";

export const adminProductSchema = z.object({
  title: z.string().trim().min(1, "Titel ist erforderlich."),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().min(1, "Beschreibung ist erforderlich."),
  brandId: z.string().min(1, "Marke ist erforderlich."),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  sku: z.string().trim().optional(),

  material: z.string().trim().optional(),
  color: z.string().trim().optional(),
  hardware: z.string().trim().optional(),
  originCountry: z.string().trim().optional(),
  manufacturingYear: z.coerce.number().int().optional().nullable(),
  condition: z.enum(["PRISTINE", "EXCELLENT", "VERY_GOOD", "GOOD"]).default("VERY_GOOD"),
  conditionNotes: z.string().trim().optional(),
  authenticityCertNo: z.string().trim().optional(),
  certificateUrl: z.string().url("Ungültige URL").optional().or(z.literal("")),

  includesOriginalBox: z.boolean().default(false),
  includesDustBag: z.boolean().default(false),
  includesReceipt: z.boolean().default(false),
  includesAuthenticityCard: z.boolean().default(false),

  resalePriceCents: z.coerce.number().int().min(1, "Preis ist erforderlich."),
  compareAtPriceCents: z.coerce.number().int().optional().nullable(),
  retailPriceCents: z.coerce.number().int().optional().nullable(),
  inventoryQuantity: z.coerce.number().int().min(0).default(1),

  weightGrams: z.coerce.number().int().optional().nullable(),
  dimensions: z.string().trim().optional(),
  tags: z.string().trim().optional(),
  isFeatured: z.boolean().default(false),
  featuredRank: z.coerce.number().int().default(0),

  imageUrls: z.array(z.string().url("Bitte eine gültige Bild-URL angeben.")).optional().default([]),
});

export const adminOrderUpdateSchema = z.object({
  fulfillmentStatus: z
    .enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "PARTIALLY_REFUNDED"]).optional(),
  carrier: z.string().trim().optional(),
  trackingNo: z.string().trim().optional(),
  cancellationReason: z.string().trim().optional(),
});

export const adminPromoCodeSchema = z.object({
  code: z.string().trim().min(1, "Code ist erforderlich.").toUpperCase(),
  description: z.string().trim().optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  value: z.coerce.number().min(1, "Wert ist erforderlich."),
  minOrderCents: z.coerce.number().min(0).default(0),
  usageLimit: z.coerce.number().optional().nullable(),
  perCustomerLimit: z.coerce.number().optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminOrderUpdateInput = z.infer<typeof adminOrderUpdateSchema>;
export type AdminPromoCodeInput = z.infer<typeof adminPromoCodeSchema>;
