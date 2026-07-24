import { z } from "zod";

export const checkoutSchema = z.object({
  email: z.string().trim().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
  firstName: z.string().trim().min(1, "Vorname ist erforderlich.").max(100),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich.").max(100),
  phone: z.string().trim().optional(),

  shippingStreet1: z.string().trim().min(1, "Straße ist erforderlich."),
  shippingStreet2: z.string().trim().optional(),
  shippingCity: z.string().trim().min(1, "Stadt ist erforderlich."),
  shippingPostalCode: z.string().trim().min(1, "Postleitzahl ist erforderlich."),
  shippingCountry: z.enum(["DE", "AT", "CH", "FR", "IT", "NL"]).default("DE"),

  sameAsShipping: z.boolean().default(true),

  billingFirstName: z.string().trim().optional(),
  billingLastName: z.string().trim().optional(),
  billingStreet1: z.string().trim().optional(),
  billingStreet2: z.string().trim().optional(),
  billingCity: z.string().trim().optional(),
  billingPostalCode: z.string().trim().optional(),
  billingCountry: z.enum(["DE", "AT", "CH", "FR", "IT", "NL"]).optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
