import { z } from "zod";

export const productQuerySchema = z.object({
  search: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  category: z.string().trim().optional(),
  collection: z.string().trim().optional(),
  condition: z.enum(["PRISTINE", "EXCELLENT", "VERY_GOOD", "GOOD"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(["featured", "newest", "price-asc", "price-desc"]).default("featured"),
  limit: z.coerce.number().min(1).max(100).default(24),
  page: z.coerce.number().min(1).default(1),
});

export type ProductQueryInput = z.infer<typeof productQuerySchema>;
