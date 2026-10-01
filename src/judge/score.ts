import type { StepResult } from "./schema.js";

export interface ComputedScore {
  score: number;
  buildPass: boolean;
  testsPass: boolean;
}

export function computeScore(
  steps: readonly StepResult[],
  benchmarkScore: number,
): ComputedScore {
  const buildPass = steps.find((s) => s.name === "build")?.pass ?? false;
  const testsPass = steps.find((s) => s.name === "test")?.pass ?? false;
  if (!buildPass || !testsPass) {
    return { score: 0, buildPass, testsPass };
  }
  const clamped = Math.min(Math.max(benchmarkScore, 0), 1);
  return { score: Math.round(clamped * 100), buildPass, testsPass };
}
