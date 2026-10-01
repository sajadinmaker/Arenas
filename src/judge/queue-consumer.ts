import { PushEventSchema, type PushEvent } from "./schema.js";
import type { JudgeParams } from "./workflow.js";

export async function handlePush(env: Env, raw: unknown): Promise<string> {
  const event: PushEvent = PushEventSchema.parse(raw);
  const attemptId = `${event.tournamentId}:${event.sha}`;
  const params: JudgeParams = { event, attemptId };
  const instance = await env.JUDGE.create({ id: attemptId, params });
  return instance.id;
}
