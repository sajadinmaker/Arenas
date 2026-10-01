import { ZodError } from "zod";
import {
  HealthResponseSchema,
  SERVICE_VERSION,
  type HealthResponse,
} from "./health.js";
import {
  handleCreateTournament,
  handleGetRankings,
  handleGetTournament,
} from "./routes/handlers.js";
import { route } from "./routes/router.js";

export { LeaderboardDO } from "./leaderboard/durable-object.js";
export { TournamentDO } from "./tournaments/tournament-do.js";
export { JudgeWorkflow } from "./judge/workflow.js";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/" || url.pathname === "/health") {
      const body: HealthResponse = { ok: true, service: "arenas", version: SERVICE_VERSION };
      const parsed = HealthResponseSchema.parse(body);
      return Response.json(parsed);
    }
    const matched = route(request.method, url.pathname);
    if (!matched) {
      return Response.json({ error: "not_found" }, { status: 404 });
    }
    try {
      switch (matched.name) {
        case "createTournament": {
          const body = await request.json().catch(() => null);
          return handleCreateTournament(
            env,
            body,
            request.headers.get("authorization"),
          );
        }
        case "getTournament":
          return handleGetTournament(env, matched.tournamentId);
        case "getRankings":
          return handleGetRankings(env, matched.tournamentId);
      }
    } catch (err) {
      if (err instanceof ZodError) {
        return Response.json(
          { error: "invalid_request", issues: err.issues },
          { status: 400 },
        );
      }
      throw err;
    }
  },
} satisfies ExportedHandler<Env>;
