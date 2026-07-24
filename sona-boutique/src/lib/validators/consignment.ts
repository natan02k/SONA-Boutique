import { z } from "zod";

export const consignmentRequestSchema = z.object({
  firstName: z.string().min(1, "Vorname ist erforderlich").max(100),
  lastName: z.string().min(1, "Nachname ist erforderlich").max(100),
  email: z.string().email("Gültige E-Mail-Adresse erforderlich"),
  phone: z.string().max(50).optional(),
  brandName: z.string().min(1, "Markenname ist erforderlich").max(100),
  modelName: z.string().min(1, "Modellbezeichnung ist erforderlich").max(150),
  estimatedCondition: z.enum(["PRISTINE", "EXCELLENT", "VERY_GOOD", "GOOD"]),
  description: z
    .string()
    .min(10, "Bitte beschreiben Sie Zustand & Zubehör (mind. 10 Zeichen)")
    .max(2000),
  photos: z.array(z.string()).min(1, "Bitte fügen Sie mindestens 1 Bild-URL hinzu").max(10),
  desiredType: z.enum(["SALE", "CONSIGNMENT", "UNDECIDED"]).default("UNDECIDED"),
});

export type ConsignmentRequestInput = z.infer<typeof consignmentRequestSchema>;
