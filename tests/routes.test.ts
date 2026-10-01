import { describe, expect, it } from "vitest";
import { route } from "../src/routes/router.js";
import { CreateTournamentResponseSchema } from "../src/routes/schema.js";
import { TournamentInputSchema } from "../src/tournaments/schema.js";

describe("route", () => {
  it("maps POST /api/tournaments to creation", () => {
    expect(route("POST", "/api/tournaments")).toEqual({
      name: "createTournament",
    });
    expect(route("POST", "/api/tournaments/")).toEqual({
      name: "createTournament",
    });
  });

  it("maps GET /api/tournaments/:id to the tournament", () => {
    expect(route("GET", "/api/tournaments/t-abc")).toEqual({
      name: "getTournament",
      tournamentId: "t-abc",
    });
  });

  it("maps GET /api/tournaments/:id/rankings to rankings", () => {
    expect(route("GET", "/api/tournaments/t-abc/rankings")).toEqual({
      name: "getRankings",
      tournamentId: "t-abc",
    });
  });

  it("returns null for unknown paths and wrong methods", () => {
    expect(route("GET", "/api/tournaments")).toBeNull();
    expect(route("POST", "/api/tournaments/t-abc")).toBeNull();
    expect(route("GET", "/nope")).toBeNull();
    expect(route("DELETE", "/api/tournaments/t-abc")).toBeNull();
  });
});

describe("route schemas", () => {
  it("accepts the same body as tournament input", () => {
    const body = {
      taskMarkdown: "Do the thing.",
      testSuiteRef: "tests/x.test.ts",
      agentCount: 4,
    };
    expect(TournamentInputSchema.parse(body)).toBeTruthy();
  });

  it("rejects a creation response leaking nothing shaped wrong", () => {
    expect(() =>
      CreateTournamentResponseSchema.parse({
        tournamentId: "t-1",
        remotes: ["not-a-url"],
        secrets: [],
      }),
    ).toThrow();
  });
});
