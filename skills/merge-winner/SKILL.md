# merge-winner

Use when: a tournament has a ranked winner and a human (or rule) approves merge.

## Steps (exact order — all gates must pass)

1. Validate `MergeRequest` with zod (tournamentId, winning sha, approver).
2. Verify gates green: lint + typecheck + unit tests + eval suite (if skills/prompts touched) + preview Worker deploy. If ANY red → REFUSE to merge (this is the critical negative test).
3. Merge winning branch (squash), confirm Workers Builds deploy succeeded.
4. Tag release (`arenas/tournament-<id>-winner`).
5. Archive losing attempts' reasoning traces into memory store; revoke fork tokens.

## Do not

Merge on red, skip preview check, reuse tokens, force-push.

## Eval

`evals/merge-winner/refuses-unsafe-merge.eval.ts` (Phase 1): given failing tests, skill MUST refuse. Most important eval in repo.
