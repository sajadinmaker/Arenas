# 005 — HTTP routes (Phase 1, task 4)

Status: proposed, awaiting human approval
Owner: founding engineer
Depends on: 004-tournaments (committed, pushed to github.com/sajadinmaker/Arenas)

## Why now

Every module so far is only callable from inside the Worker. Nobody can post a task or read a leaderboard, so the loop we closed in 004 cannot actually run. This task wires the three modules to HTTP and makes the system usable for the first time. Nothing blocks it.

## Goal

Serve three routes from the Worker with zod on every request and response: post a task, read a tournament, read its rankings. Secrets (fork tokens) are returned once at creation and never readable afterwards.

## Files to touch (only these)

1. `src/routes/schema.ts` (new) — `CreateTournamentBody` (reuses `TournamentInputSchema`), `CreateTournamentResponse` (`tournamentId`, `remotes`, plus `secrets` returned once), `TournamentResponse`, `RankingsResponse` (reuses leaderboard schemas plus `tournamentId`). No runtime imports.
2. `src/routes/router.ts` (new) — pure request router: `route(method, path) → { handler } | null`. No Workers imports, so plain vitest covers every path including 404s and trailing-slash handling.
3. `src/routes/handlers.ts` (new) — `handleCreateTournament(env, client, body)`, `handleGetTournament(env, id)`, `handleGetRankings(env, id)`. Reads go straight to the DOs; create calls `createTournament` with the stub client for now (client selection stays one line to swap later).
4. `src/index.ts` — `fetch` delegates to the router; keeps the `/health` behavior; 404 stays JSON.
5. `tests/routes.test.ts` (new) — router mapping tests plus response-schema tests. Handler integration against live DOs stays out; same reasoning as 002–004.
6. `docs/FEATURE_MAP.md` — new row: HTTP routes, entry `src/routes/router.ts`, tests `tests/routes.test.ts`, depends on all three modules.

## Explicit non-goals

No dashboard HTML, no operator auth (open endpoint with a TODO at the boundary, same as 004), no push-event ingress route (judge triggering stays internal until real webhooks exist), no changes to the three modules.

## Verification

`npm install && npx tsc --noEmit && npm test && npx wrangler deploy --dry-run`. Commit only if all green, then push.

## Risks

- Route shape guesses (path conventions) become the de facto API: kept to the three ARCHITECTURE already names (`POST /api/tournaments`, `GET /api/tournaments/:id`, rankings under it). If that disagrees with where the dashboard wants to go, STOP and ask before adding more.
