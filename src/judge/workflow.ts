import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";
import { computeScore } from "./score.js";
import {
  AttemptResultSchema,
  PushEventSchema,
  StepResultSchema,
  type PushEvent,
  type StepResult,
} from "./schema.js";

export interface JudgeParams {
  event: PushEvent;
  attemptId: string;
}

const STEP_RETRIES = {
  retries: { limit: 2, delay: "5 seconds" as const, backoff: "exponential" as const },
  timeout: "2 minutes" as const,
};

// TBD: real runners (sandboxes/containers) land in a later task.
// These stubs let the orchestration, retries, and scoring paths run end to end.
async function runStubStep(
  name: StepResult["name"],
  event: PushEvent,
): Promise<StepResult> {
  const started = Date.now();
  const step = StepResultSchema.parse({
    name,
    pass: true,
    durationMs: Math.max(Date.now() - started, 0),
    detail: `stub:${name}:${event.sha.slice(0, 7)}`,
  });
  return step;
}

export class JudgeWorkflow extends WorkflowEntrypoint<Env, JudgeParams> {
  async run(event: Readonly<WorkflowEvent<JudgeParams>>, step: WorkflowStep) {
    const params = event.payload as JudgeParams;
    const push = PushEventSchema.parse(params.event);
    const attemptId = params.attemptId;

    const build = await step.do("build", STEP_RETRIES, () =>
      runStubStep("build", push),
    );
    const test = await step.do("test", STEP_RETRIES, () =>
      runStubStep("test", push),
    );
    const benchmark = await step.do("benchmark", STEP_RETRIES, () =>
      runStubStep("benchmark", push),
    );
    const benchmarkScore = 0.5; // TBD: real runner reports this

    const { score, buildPass, testsPass } = computeScore(
      [build, test, benchmark],
      benchmarkScore,
    );

    await step.do("record-score", async () => {
      const id = this.env.LEADERBOARD.idFromName(push.tournamentId);
      const stub = this.env.LEADERBOARD.get(id);
      await stub.recordScore(
        AttemptResultSchema.parse({
          attemptId,
          repo: push.repo,
          sha: push.sha,
          steps: [build, test, benchmark],
          benchmarkScore,
          score,
          buildPass,
          testsPass,
        }),
      );
    });
  }
}
