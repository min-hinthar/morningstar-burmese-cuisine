import { z } from "zod";

export const customizationTypeEnum = z.enum([
  "DEFAULT",
  "NO_PORK",
  "BEEF_GOAT",
  "VEGETARIAN",
]);

export const subscriptionCreateSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  customerEmail: z.string().email(),
  customerName: z.string().min(1),
  addressId: z.string().uuid().optional(),
  customizationType: customizationTypeEnum,
});

export const subscriptionUpdateSchema = z.object({
  subscriptionId: z.string().uuid(),
  userId: z.string().min(1),
  customizationType: customizationTypeEnum,
});

export const subscriptionCancelSchema = z.object({
  subscriptionId: z.string().uuid(),
  userId: z.string().min(1),
});
