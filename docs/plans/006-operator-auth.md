# 006 — Operator auth on the write path (Phase 1, task 5)

Status: proposed, awaiting human approval
Owner: founding engineer
Depends on: 005-http-routes (committed, pushed to github.com/sajadinmaker/Arenas)

## Why now

005 left `POST /api/tournaments` open and returning fork secrets. That was fine as a stub boundary, but the endpoint now exists, so auth moved to the top of the list. Reads stay public; only the write path gets gated. Single operator token, matching the spec's non-goals (no auth system, just one token).

## Goal

`POST /api/tournaments` requires `Authorization: Bearer <OPERATOR_TOKEN>`. Missing or wrong token gets a 401 with no detail. If the secret is not configured at all, the endpoint fails closed with a 503 instead of silently staying open.

## Files to touch (only these)

1. `src/routes/auth.ts` (new) — pure helpers: `parseBearer(header) → string | null`, `isAuthorized(header, expected)` with a length-checked comparison. No Workers imports, plain vitest.
2. `src/routes/handlers.ts` — `handleCreateTournament` takes the request headers, checks auth first, returns 401/503 before touching validation or the stub client. Reads untouched.
3. `src/index.ts` — passes headers through on the create path.
4. `.dev.vars.example` (new, committed) — `OPERATOR_TOKEN=local-dev-token`. Real `.dev.vars` stays gitignored and is never committed.
5. `tests/routes.test.ts` — auth cases: valid bearer passes, wrong token fails, missing header fails, malformed scheme fails, empty expected token fails closed.
6. `README.md` — three lines: set `OPERATOR_TOKEN` via `wrangler secret put` for deploys, `.dev.vars` locally.
7. `docs/FEATURE_MAP.md` — new row for operator auth pointing at `src/routes/auth.ts`.

## Explicit non-goals

No multi-user auth, no token rotation endpoint, no per-agent credential flow (fork tokens already cover that), no rate limiting.

## Verification

`npm install && npx tsc --noEmit && npm test && npx wrangler deploy --dry-run`. Commit only if all green, then push. Also confirm no secret value appears in `git status` or the diff.

## Risks

- Failing closed when the secret is missing breaks local POSTs until `.dev.vars` exists: intended, and documented in the README note.
- `Env` needs the `OPERATOR_TOKEN` binding declared: secrets are not in `wrangler.jsonc`, so `wrangler types` will not add it. If `tsc` complains about `env.OPERATOR_TOKEN`, the fallback is a local `Env` augmentation in `src/routes/auth.ts` guarded by a comment, not a wrangler config change. If that fights reality, STOP and ask.
