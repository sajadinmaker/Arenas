# run-judge-pipeline

Use when: subscribed to push events on any tournament fork; must build → test → benchmark → score.

## Steps (exact order)

1. Validate `PushEvent` with zod (repo, sha, tournamentId).
2. Start/resume one Workflow instance per attempt (idempotent on sha).
3. Steps, each durable with retries: `build` (timeout → retry 2x, then fail) → `test` → `benchmark` → `score`. Timeouts are marked failed, never silently dropped.
4. Write result to Leaderboard DO (`recordScore` RPC).
5. On repeated timeout: quarantine attempt, emit advisory comment, do not block other attempts.

## Do not

Score without green build+tests; invent retry counts; write directly to dashboard.

## Eval

Judge evals (Phase 1): green path scores; red path still records failure; timeout path retries then fails.
