# Arenas — Architecture

## Module boundaries

| Module | Responsibility | Interface | State |
|---|---|---|---|
| `src/tournaments/` | Create tournament, fork N repos, mint scoped tokens, register in DO | `createTournament(input: TournamentInput): Promise<Tournament>` (zod-validated) | Tournament record in DO |
| `src/judge/` | Queue consumer: build → test → benchmark → score, retries | `handlePush(event: PushEvent): Promise<Score>` (zod-validated) | Workflow instance per attempt |
| `src/leaderboard/` | Ranked scores, single-threaded per tournament | DO RPC: `recordScore`, `getRankings` | SQLite-backed Durable Object, one per tournament |
| `src/dashboard/` | Read-only views (tasks, leaderboard) | `GET /`, `GET /api/tournaments/:id` (zod response) | Stateless Worker, routes to DOs |

Workers stay stateless (auth, validation, routing). DOs own coordination. No shared grab-bag `utils/` — split until the filename explains the module.

## Why this shape (AI-friendly)

- **Small, single-purpose modules.** An agent holds one module in its head without full-repo context.
- **Boring, consistent patterns.** Every event handler: parse with zod → authorize → call DO/Workflow → return zod-serialized response. Novelty is the enemy.
- **Types as documentation.** Strict TS; zod schemas at every boundary (event payloads, API shapes, config, tokens). Type checker catches agent mistakes pre-review.
- **ADRs for non-obvious choices.** DO over KV for leaderboard, Workflows over raw Queues for judge — see `docs/adr/0001-stack.md`.
- **Refactor toward legibility.** If a file needs a comment explaining what it does, split it.

## Data flow

```
POST /api/tournaments → Worker validates (zod) → Tournament DO (idFromName) → Artifacts fork xN + scoped tokens → Workflow per attempt
push event → judge consumer → steps (build/test/bench/score, retries) → Leaderboard DO → dashboard polls DO
merge → verify gates → merge winner → Workers Builds preview check → tag → archive losers
```

Phase 0 ships only a stub Worker (`src/index.ts` health endpoint). Tournament/judge/leaderboard modules land in Phase 1 behind the same boundaries.
