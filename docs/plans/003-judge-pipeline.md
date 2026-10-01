# 003 — Judge pipeline module (Phase 1, task 2)

Status: proposed, awaiting human approval
Owner: founding engineer
Depends on: 002-leaderboard (committed, pushed to github.com/sajadinmaker/Arenas)

## Why this module second

FEATURE_MAP has two TBD rows left. `Create tournament` is blocked on Artifacts beta access (TBD-gated). `Judge pipeline` is unblocked: its score sink (`LeaderboardDO.recordScore`) now exists. One module, no scope expansion.

## Goal

Implement `src/judge/` so a push event on a tournament fork flows through build → test → benchmark → score and lands in the Leaderboard DO, with zod at every boundary and tests green. Real orchestration structure; step executors stubbed (real runners are a later task, same as Artifacts gating in 001).

## Files to touch (only these)

1. `src/judge/schema.ts` (new) — zod schemas: `PushEvent` (repo, sha, tournamentId), `StepResult` (name, pass, durationMs, detail), `AttemptResult` (attemptId + step results + benchmarkScore + score). No runtime imports.
2. `src/judge/score.ts` (new) — pure scoring: `(steps, benchmarkScore) → { score, buildPass, testsPass }`. Rule: score 0 unless build AND tests pass; otherwise `benchmarkScore` scaled to 0–100. No runtime imports, plain vitest.
3. `src/judge/workflow.ts` (new) — `JudgeWorkflow extends WorkflowEntrypoint`: durable steps `build` → `test` → `benchmark` → `score` via `step.do` with retries (2x) and timeouts; timed-out step marks attempt failed, never silently dropped; final step calls `LEADERBOARD.recordScore`. Step executors are stubs returning fixed pass results with a `// TBD: real runner` marker.
4. `src/judge/queue-consumer.ts` (new) — entry point: validate `PushEvent` with zod, derive idempotency key from sha, start/resume one `JUDGE` workflow instance per attempt.
5. `src/index.ts` — export `JudgeWorkflow` (required for deploy; same deviation pattern as 002's `LeaderboardDO` export).
6. `wrangler.jsonc` — add `workflows` binding (`JUDGE` → `JudgeWorkflow`).
7. `pipelines/judge.yml` (new) — CI pipeline stub documenting the gates from the playbook (lint → typecheck → unit tests → evals → preview → human review → auto-merge). Advisory in this task, enforced in a later pipeline task.
8. `tests/judge.test.ts` (new) — unit tests for `score.ts` (green path scores, red build/tests → 0, benchmark scaling) + schema accept/reject tests. No Workflow runtime needed.
9. `docs/FEATURE_MAP.md` — update Judge pipeline row: entry point `src/judge/queue-consumer.ts`, tests `tests/judge.test.ts`.

## Explicit non-goals

No tournament creation, no Artifacts calls, no real build/test runners, no dashboard routes, no eval-suite enforcement in CI.

## Verification

`npm install && npx tsc --noEmit && npm test && npx wrangler deploy --dry-run`. Commit only if all green, then push.

## Risks

- Workflow testing without runtime: mitigated the 002 way — logic in pure `score.ts`; `JudgeWorkflow` stays thin and runtime-untested in this task (integration test lands with a live tournament).
- `wrangler.jsonc` workflows-binding syntax: verify with `dry-run`; if spec and reality disagree, STOP and ask.
