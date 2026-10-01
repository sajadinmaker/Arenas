# ADR 0001 — Why Workers + Artifacts + Durable Objects + Workflows

Date: 2026-10-01 | Status: accepted (Artifacts part TBD-gated)

## Context

Arenas needs N isolated agent forks per task, automatic judging (build/test/bench), ranked state, and a merge gate — all with per-request isolation and no servers to manage.

## Decision

- **Workers** for stateless API/dashboard/routing (`wrangler deploy` clean checkout).
- **Artifacts** for fork/token lifecycle: one repo per agent/task, repo-scoped tokens, `fork()` from baseline, Git-protocol compatible so agents use plain `git`.
- **Durable Objects (SQLite-backed)** for tournament + leaderboard state: single-threaded per tournament (`idFromName`), RPC methods, `init()` pattern. Chosen over KV because leaderboard needs strongly consistent serialized writes.
- **Workflows** for judge pipeline: durable steps with retries/sleeps, human-in-the-loop gates, per-attempt instance.

## Alternatives rejected

- KV/R2 for leaderboard: no coordination primitive, race-prone.
- Raw Queues + cron for judge: no durable step retries/sleep, more glue code.
- External Git hosting for forks: no repo-scoped token minting inside Worker, no namespace isolation.

## Consequences / TBDs

- **TBD (blocking):** docs list Artifacts as closed/private beta (form-gated), not open beta. Requires `wrangler>=4.145.0`, `artifacts` binding non-inheritable per-env, local dev needs `remote:true`+auth. Until access is confirmed, all Artifacts paths are stubbed and `SPEC.md` US-1/US-2 cannot go live.
- Limits to design around: 2k req/10s per-namespace/per-artifact, 10GB/repo, 1TB/account; naming `^[A-Za-z0-9][A-Za-z0-9._-]*`.
- `get()` returns a `Disposable` RPC handle (use `using`).
