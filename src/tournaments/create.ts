import {
  TournamentInputSchema,
  TournamentRecordSchema,
  type ForkRecord,
  type TournamentInput,
  type TournamentRecord,
} from "./schema.js";
import type { ArtifactsClient } from "./artifacts.js";

export interface ForkSecret {
  name: string;
  plaintext: string;
}

export interface AssembledTournament {
  record: TournamentRecord;
  secrets: ForkSecret[];
}

export function hashTask(markdown: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < markdown.length; i++) {
    const code = markdown.charCodeAt(i);
    if (code === -1) continue;
    hash ^= code;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export async function assembleTournament(
  client: ArtifactsClient,
  input: TournamentInput,
  tournamentId: string,
): Promise<AssembledTournament> {
  await client.createRepo(`${tournamentId}-baseline`);

  const forks: ForkRecord[] = [];
  const secrets: ForkSecret[] = [];
  for (let i = 0; i < input.agentCount; i++) {
    const name = `${tournamentId}-fork-${i + 1}`;
    const repo = await client.fork(`${tournamentId}-baseline`, name);
    const token = await client.createToken(name);
    forks.push({ name, remote: repo.remote, tokenId: token.tokenId });
    secrets.push({ name, plaintext: token.plaintext });
  }

  const record = TournamentRecordSchema.parse({
    id: tournamentId,
    taskHash: hashTask(input.taskMarkdown),
    testSuiteRef: input.testSuiteRef,
    forks,
    status: "open",
    createdAt: new Date().toISOString(),
  });
  return { record, secrets };
}

export interface CreatedTournament {
  tournamentId: string;
  remotes: string[];
  secrets: ForkSecret[];
}

export async function createTournament(
  env: Env,
  client: ArtifactsClient,
  raw: unknown,
): Promise<CreatedTournament> {
  const input = TournamentInputSchema.parse(raw);
  const tournamentId = `t-${crypto.randomUUID().slice(0, 8)}`;
  const { record, secrets } = await assembleTournament(
    client,
    input,
    tournamentId,
  );
  const stub = env.TOURNAMENT.get(env.TOURNAMENT.idFromName(tournamentId));
  await stub.register(record);
  return {
    tournamentId,
    remotes: record.forks.map((f) => f.remote),
    secrets,
  };
}
