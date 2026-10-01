# 001 — Bootstrap Arenas (Phase 0)

Status: approved by human, 2026-10-01
Owner: founding engineer (agent: Muse Spark via OpenCode)
Source: `Arena Agent Engineering Playbook.md` + kickoff prompt

## Goal

Scaffold the `Arenas` repo exactly per playbook §0 so that:
1. Docs exist before code.
2. Agents have constitution (`AGENTS.md`), spec, architecture, feature map, eval playbook, and one ADR.
3. Three skills exist as stubs with correct workflow order.
4. Repo deploys with `wrangler deploy` from a clean checkout (minimal Worker + `wrangler.jsonc`).

Name lock: product is `Arenas` (plural). Wrangler name `arenas`, npm `arenas`, Artifacts namespace placeholder `arenas-default`.

## Non-negotiables (from kickoff)

1. Plan written here, approved before code — this file.
2. Docs before code; chat-only knowledge does not exist.
3. Small single-purpose modules, one consistent pattern, strict TS, zod at every boundary.
4. After every change: run tests, verify, only then commit.
5. Spec vs reality mismatch → STOP and ask.

## Current state (verified 2026-10-01)

- `/home/sajad/Projects/Arenas/` contains only `Arena Agent Engineering Playbook.md`.
- Not a git repo → run `git init` (done).
- Toolchain: node v22.23.2, npm 10.9.8, wrangler 4.146.0 (meets >=4.145 for Artifacts).

## Spec vs reality — STOP item (resolved)

Prompt claims Artifacts "open beta". Live Cloudflare docs say closed/private beta (form-gated). Paid: 10k ops/mo + 1GB-mo included, then $0.15/1k ops, $0.50/GB-mo. Limits: 2k req/10s per-namespace/per-artifact, 10GB/repo, 1TB/account.
Decision (human-approved): TBD-gate + stub. `SPEC.md` and `adr/0001-stack.md` mark Artifacts integration TBD; scaffold compiles and tests pass with a mocked binding. No real fork calls in Phase 0.

## Order of operations

1. This plan (docs/plans/001-bootstrap.md).
2. Docs: `SPEC.md` → `ARCHITECTURE.md` → `FEATURE_MAP.md` → `EVAL_PLAYBOOK.md` → `adr/0001-stack.md` → `AGENTS.md`.
3. Skills: `spawn-tournament`, `run-judge-pipeline`, `merge-winner` (SKILL.md stubs).
4. Placeholders: `evals/.gitkeep`, `pipelines/.gitkeep`.
5. Code scaffold: `package.json` (npm), `wrangler.jsonc`, `tsconfig.json`, `vitest.config.ts`, `src/index.ts`, `worker-configuration.d.ts` (generated), `.gitignore`, `LICENSE` (MIT), `opencode.json` (bash/push approval).
6. Verify: `npm install && npx tsc --noEmit && npm test && npx wrangler types --check && npx wrangler deploy --dry-run`.
7. Commit: single Phase-0 commit only if all green. No push.

## Verification

- `npx tsc --noEmit` clean (strict).
- `vitest run` green (hello + health-schema test).
- `wrangler types --check` clean.
- `git status` shows only intended files.

## Risks

- Artifacts API churn (`get()` Disposable, token shapes differ).
- Wrangler version drift → pin `^4.146.0` in devDeps.
- DO/Workflows not yet wired — Phase 1 work, tracked in FEATURE_MAP as TBD.
