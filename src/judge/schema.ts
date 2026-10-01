import { z } from "zod";

export const PushEventSchema = z.object({
  repo: z.string().min(1),
  sha: z.string().min(1),
  tournamentId: z.string().min(1),
});

export type PushEvent = z.infer<typeof PushEventSchema>;

export const StepResultSchema = z.object({
  name: z.enum(["build", "test", "benchmark"]),
  pass: z.boolean(),
  durationMs: z.number().int().nonnegative(),
  detail: z.string(),
});

export type StepResult = z.infer<typeof StepResultSchema>;

export const AttemptResultSchema = z.object({
  attemptId: z.string().min(1),
  repo: z.string().min(1),
  sha: z.string().min(1),
  steps: z.array(StepResultSchema).length(3),
  benchmarkScore: z.number().finite(),
  score: z.number().finite(),
  buildPass: z.boolean(),
  testsPass: z.boolean(),
});

export type AttemptResult = z.infer<typeof AttemptResultSchema>;
