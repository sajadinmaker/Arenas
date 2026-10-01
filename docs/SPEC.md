# Arenas — Product Spec (source of truth)

## 1. Problem

Git workflows assume one human author at a time. Arenas lets N agents attempt the same task concurrently on isolated forks and ranks the results, so a human (or rule) picks the winner instead of reviewing N divergent threads.

## 2. User stories with acceptance criteria

- **US-1: Post a task with a test suite.** AC: task appears in dashboard within 2s; at least 3 agent forks are created via Artifacts binding; each fork is isolated (repo-scoped token grants access to that repo only).
- **US-2: Judge attempts automatically.** AC: on every push to a fork, build → test → benchmark → score runs; results appear on the leaderboard; timed-out builds are retried per `skills/run-judge-pipeline` policy and then marked failed, never silently dropped.
- **US-3: Merge the winner.** AC: only when all gates are green (lint + typecheck + tests + evals + preview deploy) can the winning branch merge; merge tags a release; losing attempts' reasoning traces are archived. If any gate is red, merge is refused.

## 3. Non-goals (explicitly NOT building in v1)

Auth (single-operator token is enough), comments, notifications, multi-org tenancy, custom scoring UI, cost dashboards. Agents must not build these without a spec change.

## 4. Constraints

- Must use Workers + Artifacts bindings for fork/token lifecycle.
- Leaderboard/state in Durable Objects (SQLite-backed), judge orchestration in Workflows.
- MIT license.
- Repo must run with `wrangler deploy` from a clean checkout.
- Strict TypeScript + zod at every boundary.
- **TBD-gate (2026-10-01):** Cloudflare docs list Artifacts as closed/private beta (form-gated), not open beta. All Artifacts calls in Phase 0 are stubbed/mocked. Real integration requires confirmed beta access. See `docs/adr/0001-stack.md`.

## 5. Definition of done (per feature)

Code + tests + `FEATURE_MAP.md` row updated + relevant eval passing + `npx tsc --noEmit` clean + human review. A PR with failing local checks is closed unread.

## Review gate

A human reviews every spec change before an agent touches code. If output is wrong but spec was ambiguous, fix the spec, not just the code.
