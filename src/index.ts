import {
  HealthResponseSchema,
  SERVICE_VERSION,
  type HealthResponse,
} from "./health.js";

export { LeaderboardDO } from "./leaderboard/durable-object.js";

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      const body: HealthResponse = { ok: true, service: "arenas", version: SERVICE_VERSION };
      const parsed = HealthResponseSchema.parse(body);
      return Response.json(parsed);
    }
    return Response.json({ error: "not_found" }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
