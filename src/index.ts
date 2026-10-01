import { z } from "zod";

export const HealthResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("arenas"),
  version: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

const VERSION = "0.1.0";

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      const body: HealthResponse = { ok: true, service: "arenas", version: VERSION };
      const parsed = HealthResponseSchema.parse(body);
      return Response.json(parsed);
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
