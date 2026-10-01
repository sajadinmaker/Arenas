# pipelines

Definitions for CI and the auto-merge flow. The code for the product lives in `src/`; this folder describes what happens to it on the way to main.

`judge.yml` runs on PRs that touch the judge, leaderboard, skills, or tests. It does the mechanical gates: install, typecheck, unit tests, evals. If any of that is red the PR stops there.

What it does not do yet is the rest of the playbook pipeline: preview deploy, the advisory diff review, the required human approval, and the post-merge smoke test. Those land here in a later task. Nothing merges to main without a human saying so, no matter how green the checks are.

The whole flow is described in the playbook under "The auto-merge pipeline". Short version: agents verify before pushing, the pipeline verifies after, humans decide.
