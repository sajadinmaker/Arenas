# spawn-tournament

Use when: given a task description, create N isolated agent forks and register the tournament.

## Steps (exact order — do not improvise)

1. Validate input with zod (`TournamentInput`: task markdown + test suite ref + N>=3).
2. Authorize caller (operator token check).
3. Call Artifacts binding: `create(baseline)` once, then `fork(name)` N times into namespace `arenas-default`. **TBD-gated (no beta access in Phase 0): stub this call in code, assert N forks would be created.**
4. For each fork: mint repo-scoped token (`createToken`, minimal TTL). Never reuse a token across repos.
5. Register tournament record in the Tournament Durable Object (`idFromName(tournamentId)`).
6. Return `{ tournamentId, remotes[], }` — never return plaintext tokens in bulk; hand per-agent.

## Do not

Expand scope (no auth system, no extra branches), bypass zod, log tokens.

## Eval

`evals/spawn-tournament/valid-task.eval.ts` (Phase 1): exactly N forks, tokens repo-scoped, tournament record exists.
