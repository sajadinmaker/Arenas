# evals

Evals test the agents, not the app. Each eval hands a skill some fixture input and checks the output against a scoring function. If the skill misbehaves, the eval catches it before a human has to.

An eval has four parts: fixture input, the skill under test, the expected output, and the scoring function. Most scores are plain pass/fail per assertion.

There are no real evals here yet. Phase 1 adds them alongside the skills, starting with the two that matter most: spawn-tournament producing exactly N scoped forks, and merge-winner refusing to merge when tests are red. That second one is a negative test and it is the most important file in this folder.

Run them with `npm run eval`. Right now that just prints a placeholder and exits 0.

The full loop is written up in `docs/EVAL_PLAYBOOK.md`. The rule that bites: any PR touching `skills/`, prompts, or the judge pipeline runs this suite, and a failing eval blocks merge like a failing unit test. Production surprises become new evals before they become fixes.
