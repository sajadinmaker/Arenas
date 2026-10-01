import { describe, expect, it } from "vitest";
import { rankScores, sortScores } from "../src/leaderboard/rank.js";
import {
  RecordScoreInputSchema,
  type ScoreEntry,
} from "../src/leaderboard/schema.js";

function entry(overrides: Partial<ScoreEntry> = {}): ScoreEntry {
  return {
    attemptId: "a1",
    repo: "arenas-default/a1",
    sha: "abc123",
    buildPass: true,
    testsPass: true,
    benchmarkScore: 1.0,
    score: 10,
    createdAt: "2026-10-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("sortScores", () => {
  it("orders by score descending", () => {
    const out = sortScores([
      entry({ attemptId: "low", score: 1 }),
      entry({ attemptId: "high", score: 9 }),
    ]);
    expect(out[0]?.attemptId).toBe("high");
  });

  it("breaks score ties by earliest createdAt", () => {
    const out = sortScores([
      entry({ attemptId: "late", createdAt: "2026-10-01T00:00:02.000Z" }),
      entry({ attemptId: "early", createdAt: "2026-10-01T00:00:01.000Z" }),
    ]);
    expect(out[0]?.attemptId).toBe("early");
  });
});

describe("rankScores", () => {
  it("returns empty rankings for no entries", () => {
    expect(rankScores([])).toEqual([]);
  });

  it("assigns competition ranks with ties (1,2,2,4)", () => {
    const out = rankScores([
      entry({ attemptId: "a", score: 30 }),
      entry({ attemptId: "b", score: 20 }),
      entry({ attemptId: "c", score: 20 }),
      entry({ attemptId: "d", score: 10 }),
    ]);
    expect(out.map((r) => [r.attemptId, r.rank])).toEqual([
      ["a", 1],
      ["b", 2],
      ["c", 2],
      ["d", 4],
    ]);
  });
});

describe("RecordScoreInputSchema", () => {
  it("accepts input without createdAt", () => {
    const parsed = RecordScoreInputSchema.parse({
      attemptId: "a1",
      repo: "arenas-default/a1",
      sha: "abc123",
      buildPass: true,
      testsPass: false,
      benchmarkScore: 0.5,
      score: 5,
    });
    expect(parsed.createdAt).toBeUndefined();
  });

  it("rejects NaN scores and empty ids", () => {
    expect(() =>
      RecordScoreInputSchema.parse({
        attemptId: "",
        repo: "r",
        sha: "s",
        buildPass: true,
        testsPass: true,
        benchmarkScore: Number.NaN,
        score: 5,
      }),
    ).toThrow();
  });
});
