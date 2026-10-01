# 004 — Tournament creation module (Phase 1, task 3)

Status: proposed, awaiting human approval
Owner: founding engineer
Depends on: 003-judge-pipeline (committed, pushed to github.com/sajadinmaker/Arenas)

## Why this module third

It is the last unbuilt row in FEATURE_MAP and the entry point of the whole flow: post a task, get N forks, judge them, rank them. The judge and leaderboard already exist, so this closes the loop. The Artifacts binding is still TBD-gated (closed beta, no access), so externals stay stubbed exactly like the judge's step runners in 003. One module, no scope expansion.

## Goal

Implement `src/tournaments/` so a validated task produces a baseline repo, N isolated forks with repo-scoped tokens, and a tournament record in a Durable Object. Real validation, real record-keeping, stubbed repo layer with a seam the real binding plugs into later.

## Files to touch (only these)

1. `src/tournaments/schema.ts` (new) — zod schemas: `TournamentInput` (taskMarkdown min 1, testSuiteRef min 1, agentCount int 3–10), `ForkRecord` (name, remote, tokenId, never the plaintext), `TournamentRecord` (id, input hash, forks, status `open|judging|closed`, createdAt). No runtime imports.
2. `src/tournaments/artifacts.ts` (new) — `ArtifactsClient` interface (`createRepo`, `fork`, `createToken`, all returning zod-validated shapes) plus `StubArtifactsClient` (in-memory, deterministic remotes, tokens unique per repo). The real binding implements this interface in a later task; nothing else changes.
3. `src/tournaments/tournament-do.ts` (new) — `TournamentDO` (SQLite `tournaments` table, RPC `register(record)` / `get(id)`). Same thin-wrapper shape as `LeaderboardDO`.
4. `src/tournaments/create.ts` (new) — `createTournament(env, client, raw)`: parse input, create baseline, fork N times, mint one token per fork, register the record in the Tournament DO via `idFromName`, return `{ tournamentId, remotes }`. Plaintext tokens go to the caller only, never into the record.
5. `src/index.ts` — export `TournamentDO` (required for deploy; same pattern as 002/003).
6. `wrangler.jsonc` — `TOURNAMENT` binding + `v2` migration with `new_sqlite_classes: ["TournamentDO"]`.
7. `tests/tournaments.test.ts` (new) — input validation (rejects agentCount < 3, empty task), stub flow (exactly N forks, tokens unique per repo, record registers with status open). The DO class stays runtime-untested like in 002; logic lives in testable functions.
8. `docs/FEATURE_MAP.md` — update Create tournament row: entry point `src/tournaments/create.ts`, tests `tests/tournaments.test.ts`.

## Explicit non-goals

No real Artifacts calls, no operator auth system (caller check stays a TODO at the boundary), no dashboard routes, no auto-merge, no changes to judge or leaderboard.

## Verification

`npm install && npx tsc --noEmit && npm test && npx wrangler deploy --dry-run`. Commit only if all green, then push.

## Risks

- `createTournament` needs both the client and env, which plain vitest cannot provide for the DO half: mitigated by splitting pure assembly (fork/token fan-out against the stub client) from the DO write, and testing the pure half.
- `v2` migration syntax alongside `v1`: verify with `dry-run`; if spec and reality disagree, STOP and ask.
