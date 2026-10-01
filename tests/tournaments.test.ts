import { describe, expect, it } from "vitest";
import { StubArtifactsClient } from "../src/tournaments/artifacts.js";
import {
  assembleTournament,
  hashTask,
} from "../src/tournaments/create.js";
import { TournamentInputSchema } from "../src/tournaments/schema.js";

const input = {
  taskMarkdown: "Fix the off-by-one in rankScores.",
  testSuiteRef: "tests/leaderboard.test.ts",
  agentCount: 3,
};

describe("TournamentInputSchema", () => {
  it("accepts a valid task", () => {
    expect(TournamentInputSchema.parse(input)).toBeTruthy();
  });

  it("rejects fewer than 3 agents", () => {
    expect(() =>
      TournamentInputSchema.parse({ ...input, agentCount: 2 }),
    ).toThrow();
  });

  it("rejects an empty task", () => {
    expect(() =>
      TournamentInputSchema.parse({ ...input, taskMarkdown: "" }),
    ).toThrow();
  });
});

describe("hashTask", () => {
  it("is deterministic and differs per task", () => {
    expect(hashTask("a")).toBe(hashTask("a"));
    expect(hashTask("a")).not.toBe(hashTask("b"));
  });
});

describe("assembleTournament", () => {
  it("creates exactly N forks with unique per-repo tokens", async () => {
    const client = new StubArtifactsClient();
    const { record, secrets } = await assembleTournament(
      client,
      TournamentInputSchema.parse(input),
      "t-test",
    );
    expect(record.forks).toHaveLength(3);
    expect(record.status).toBe("open");
    expect(secrets).toHaveLength(3);
    const tokenIds = new Set(record.forks.map((f) => f.tokenId));
    expect(tokenIds.size).toBe(3);
  });

  it("keeps plaintext out of the stored record", async () => {
    const client = new StubArtifactsClient();
    const { record, secrets } = await assembleTournament(
      client,
      TournamentInputSchema.parse(input),
      "t-test",
    );
    const serialized = JSON.stringify(record);
    for (const s of secrets) {
      expect(serialized).not.toContain(s.plaintext);
    }
  });

  it("fails when forking from a missing baseline", async () => {
    const client = new StubArtifactsClient();
    await expect(client.fork("nope", "x")).rejects.toThrow();
  });
});
