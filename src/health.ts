import { z } from "zod";

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("arenas"),
  version: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const SERVICE_VERSION = "0.1.0";
