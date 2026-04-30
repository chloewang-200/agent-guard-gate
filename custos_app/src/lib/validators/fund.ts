import { z } from "zod/v4";

export const addFundsSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  reference: z.string().max(200).optional(),
});

export type AddFundsValues = z.infer<typeof addFundsSchema>;
