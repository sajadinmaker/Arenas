# 002 — Leaderboard module (Phase 1, task 1)

Status: proposed, awaiting human approval
Owner: founding engineer
Depends on: 001-bootstrap (committed, pushed to github.com/sajadinmaker/Arenas)

## Why this module first

FEATURE_MAP has three TBD rows. `Create tournament` is blocked on Artifacts beta access (TBD-gated). `Judge pipeline` needs Workflows + a score sink. `Leaderboard` (SQLite-backed Durable Object) has no external dependency — it ships real code now and becomes the sink the judge writes to later. One module, no scope expansion.

## Goal

Implement `src/leaderboard/` so a tournament's scores can be recorded and ranked, with zod at every boundary and tests green.

## Files to touch (only these)

1. `src/leaderboard/schema.ts` (new) — zod schemas: `ScoreEntry` (attemptId, repo, sha, build/test/bench pass flags, score number, createdAt), `RecordScoreInput`, `RankingsResponse`. No runtime imports.
2. `src/leaderboard/rank.ts` (new) — pure ranking functions (`sortScores`, `assignRanks` with tie handling). No DO imports, so plain vitest can test them.
3. `src/leaderboard/durable-object.ts` (new) — `LeaderboardDO` class: SQLite table `scores`, RPC methods `recordScore(input)`, `getRankings()`. Thin wrapper over `rank.ts`; validates all inputs/outputs with schemas from `schema.ts`.
4. `tests/leaderboard.test.ts` (new) — unit tests for `rank.ts` (ordering, ties, empty) + schema accept/reject tests. No DO runtime needed.
5. `wrangler.jsonc` — add `durable_objects` binding + migration for `LeaderboardDO` (commented pattern, real config).
6. `docs/FEATURE_MAP.md` — update Leaderboard row: entry point `src/leaderboard/durable-object.ts`, tests `tests/leaderboard.test.ts`.

## Explicit non-goals

No judge consumer, no tournament creation, no dashboard routes, no Artifacts calls, no Workflow definitions.

## Verification

`npm install && npx tsc --noEmit && npm test && npx wrangler deploy --dry-run`. Commit only if all green, then push.

## Risks

- DO RPC testing without `@cloudflare/vitest-pool-workers`: mitigated by keeping logic in pure `rank.ts`; DO class stays thin and untested at runtime in this task (integration test lands with judge pipeline).
- `wrangler.jsonc` migration syntax for new DO: verify with `dry-run`; if spec and reality disagree, STOP and ask.
