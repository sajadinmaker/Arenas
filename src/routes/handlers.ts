import { StubArtifactsClient } from "../tournaments/artifacts.js";
import { createTournament } from "../tournaments/create.js";
import { TournamentRecordSchema } from "../tournaments/schema.js";
import { isAuthorized } from "./auth.js";
import {
  CreateTournamentBodySchema,
  CreateTournamentResponseSchema,
  TournamentRankingsSchema,
} from "./schema.js";

// Single operator token. No multi-user auth by design (see SPEC non-goals).
export async function handleCreateTournament(
  env: Env,
  body: unknown,
  authHeader: string | null,
): Promise<Response> {
  const expected = env.OPERATOR_TOKEN;
  if (!expected) {
    return Response.json({ error: "misconfigured" }, { status: 503 });
  }
  if (!isAuthorized(authHeader, expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const parsed = CreateTournamentBodySchema.parse(body);
  const result = await createTournament(
    env,
    new StubArtifactsClient(),
    parsed,
  );
  const response = CreateTournamentResponseSchema.parse(result);
  return Response.json(response, { status: 201 });
}

export async function handleGetTournament(
  env: Env,
  tournamentId: string,
): Promise<Response> {
  const stub = env.TOURNAMENT.get(env.TOURNAMENT.idFromName(tournamentId));
  const record = await stub.get(tournamentId);
  if (!record) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(TournamentRecordSchema.parse(record));
}

export async function handleGetRankings(
  env: Env,
  tournamentId: string,
): Promise<Response> {
  const stub = env.LEADERBOARD.get(env.LEADERBOARD.idFromName(tournamentId));
  const rankings = await stub.getRankings();
  return Response.json(
    TournamentRankingsSchema.parse({ tournamentId, rankings }),
  );
}
