import { StubArtifactsClient } from "../tournaments/artifacts.js";
import { createTournament } from "../tournaments/create.js";
import { TournamentRecordSchema } from "../tournaments/schema.js";
import {
  CreateTournamentBodySchema,
  CreateTournamentResponseSchema,
  TournamentRankingsSchema,
} from "./schema.js";

// TODO: operator auth at this boundary. Open endpoint until the auth task.
export async function handleCreateTournament(
  env: Env,
  body: unknown,
): Promise<Response> {
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
