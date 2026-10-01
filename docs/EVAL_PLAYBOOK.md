# Arenas — Eval Playbook (evals are unit tests for agents)

You wouldn't ship code without tests. Don't ship a skill or prompt without evals.

## What an eval looks like

Each eval in `/evals` is: input fixture + skill/prompt under test + expected output + scoring function.

- `evals/spawn-tournament/valid-task.eval.ts` (TBD Phase 1) — given fixture task JSON, skill must produce exactly N forks, tokens scoped to one repo each, and a tournament record. Binary pass/fail per assertion.
- `evals/merge-winner/refuses-unsafe-merge.eval.ts` (TBD Phase 1) — given a tournament where tests failed, skill MUST refuse to merge. Negative test; the most important one in the repo.

## The loop

Run evals → agent fails one → fix skill/prompt → re-run full suite (not just failing one) → repeat until green → human review.

## CI

Any PR touching `skills/`, prompts, or judge pipeline triggers the eval suite. Eval failure blocks merge like a failing unit test.

## Rules

- Eval outputs are committed. "Usually gets it right" is not a result.
- Flakiness budget: run each eval 3x; non-deterministic results get investigated, not ignored.
- Every production surprise becomes a new eval before it becomes a fix.
- Phase 0: `npm run eval` prints "no evals yet" and exits 0. Real evals land with Phase 1 skills.
