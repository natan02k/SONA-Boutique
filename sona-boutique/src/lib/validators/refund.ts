import { z } from "zod";

export const refundSchema = z.object({
  type: z.enum(["FULL", "PARTIAL"]).default("FULL"),
  amountEuro: z.coerce.number().min(0.01).optional(),
  reason: z.enum(["Kundenanfrage", "Widerruf", "Defekt", "Andere"]).default("Kundenanfrage"),
});

export type RefundInput = z.infer<typeof refundSchema>;
