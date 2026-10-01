import { describe, expect, it } from "vitest";
import { computeScore } from "../src/judge/score.js";
import {
  PushEventSchema,
  type StepResult,
} from "../src/judge/schema.js";

function step(
  name: StepResult["name"],
  pass: boolean,
): StepResult {
  return { name, pass, durationMs: 100, detail: "stub" };
}

describe("computeScore", () => {
  it("scores the benchmark when build and tests pass", () => {
    expect(
      computeScore([step("build", true), step("test", true)], 0.85),
    ).toEqual({ score: 85, buildPass: true, testsPass: true });
  });

  it("scores 0 when the build fails", () => {
    expect(
      computeScore([step("build", false), step("test", true)], 0.9),
    ).toEqual({ score: 0, buildPass: false, testsPass: true });
  });

  it("scores 0 when tests fail", () => {
    expect(
      computeScore([step("build", true), step("test", false)], 0.9),
    ).toEqual({ score: 0, buildPass: true, testsPass: false });
  });

  it("clamps the benchmark into 0–100", () => {
    expect(
      computeScore([step("build", true), step("test", true)], 1.5).score,
    ).toBe(100);
    expect(
      computeScore([step("build", true), step("test", true)], -0.5).score,
    ).toBe(0);
  });
});

describe("PushEventSchema", () => {
  it("accepts a valid push event", () => {
    expect(
      PushEventSchema.parse({
        repo: "arenas-default/a1",
        sha: "abc123",
        tournamentId: "t1",
      }),
    ).toBeTruthy();
  });

  it("rejects empty fields", () => {
    expect(() =>
      PushEventSchema.parse({ repo: "", sha: "s", tournamentId: "t" }),
    ).toThrow();
  });
});
