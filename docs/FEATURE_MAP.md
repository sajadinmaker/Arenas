# Arenas — Feature Map

> Rule: before writing code, read this file. If you touch a feature, update its row. If you add a feature, add a row. Part of every PR's definition of done.

| Feature | Entry point | Core files | Tests | Depends on |
|---|---|---|---|---|
| Create tournament | `src/tournaments/create.ts` | `src/tournaments/*` | `tests/tournaments.test.ts` | Artifacts binding (TBD-gated, stubbed) |
| Judge pipeline | `src/judge/queue-consumer.ts` | `src/judge/*`, `pipelines/judge.yml` | `tests/judge.test.ts` | Workflows, LeaderboardDO |
| Leaderboard | `src/leaderboard/durable-object.ts` | `src/leaderboard/*` | `tests/leaderboard.test.ts` | Durable Objects (SQLite) |
| Health check | `src/index.ts` | `src/index.ts` | `tests/health.test.ts` | Workers |
