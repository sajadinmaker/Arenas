# Arena — Agent-Driven Engineering Playbook

How we build this product with AI agents, at high quality, without shipping garbage to production. Based on Laura Tan's agent guide: spec first, skills and maps for the agents, evals as unit tests, pipelines with human gates, verify before every push.

---

## 0. Repo layout (docs-as-code)

All of this lives in the repo so agents read it automatically:

```
/
├── AGENTS.md                  # entry point every agent reads first
├── docs/
│   ├── SPEC.md                # product spec (source of truth)
│   ├── ARCHITECTURE.md        # system design + module boundaries
│   ├── FEATURE_MAP.md         # where every feature lives in the code
│   ├── EVAL_PLAYBOOK.md       # how we test the agents themselves
│   └── adr/                   # architecture decision records, one per file
├── skills/                    # agent skills, one folder each (SKILL.md + scripts)
│   ├── spawn-tournament/
│   ├── run-judge-pipeline/
│   └── merge-winner/
├── evals/                     # eval definitions + expected outputs
├── pipelines/                 # CI / auto-merge workflow definitions
└── src/
```

The rule: if a piece of knowledge only exists in a chat with an agent, it doesn't exist. Write it down, in the repo, in a file the next agent will read.

---

## 1. SPEC.md — write the spec for the agent, not the human

Agents fail on ambiguity, not on difficulty. The spec has to be explicit enough that an agent can't creatively misinterpret it.

Required sections:

1. **Problem** — one paragraph. "Git workflows assume one human author at a time. Arena lets N agents attempt the same task concurrently and ranks the results."
2. **User stories with acceptance criteria** — not "users can create tournaments" but:
   - US-1: User posts a task with a test suite. AC: task appears in dashboard within 2s; at least 3 agent forks are created via Artifacts; each fork is isolated.
3. **Non-goals** — a list of things we are explicitly NOT building (auth, comments, notifications). This section matters more for agents than humans, because agents will happily build things nobody asked for.
4. **Constraints** — must use Workers + Artifacts bindings; MIT license; repo must run with `wrangler deploy` from a clean checkout.
5. **Definition of done** — per feature: code + tests + FEATURE_MAP updated + eval passing.

Review gate: a human reviews every spec change before an agent touches code. The spec is the contract. If the agent's output is wrong but the spec was ambiguous, fix the spec, not just the code.

---

## 2. ARCHITECTURE.md — AI-friendly architecture

"AI-friendly" means an agent can hold one module in its head without needing the whole codebase as context. Concretely:

- **Small, single-purpose modules.** Tournament engine, judge pipeline, leaderboard state, and dashboard are separate modules with explicit interfaces. No shared grab-bag utils files — those are where agents go to hallucinate.
- **Boring, consistent patterns.** One way to do things, everywhere. If every event handler looks the same, the agent writes the tenth one correctly. Novelty is the enemy.
- **Types as documentation.** Strict TypeScript with zod schemas at every boundary (event payloads, API shapes, config). The type checker catches agent mistakes before a human ever sees them.
- **ADRs for anything non-obvious.** When we choose Durable Objects over KV for leaderboard state, that decision goes in `docs/adr/003-leaderboard-state.md` with the reasoning. Six weeks later, an agent asked to "optimize the leaderboard" reads why it is the way it is before rewriting it.
- **Refactor toward agent-legibility.** If a file needs a comment explaining what it does, split it until the filename explains it.

---

## 3. FEATURE_MAP.md — tell agents where things live

Agents waste most of their tokens (and make most of their mistakes) exploring. A feature map kills that problem.

Format — a flat table, updated by the agent as part of every PR's definition of done:

| Feature | Entry point | Core files | Tests | Depends on |
|---|---|---|---|---|
| Create tournament | `src/tournaments/create.ts` | `src/tournaments/*` | `tests/tournaments.test.ts` | Artifacts binding |
| Judge pipeline | `src/judge/queue-consumer.ts` | `src/judge/*`, `pipelines/judge.yml` | `tests/judge.test.ts` | Workflows, Queues |
| Leaderboard | `src/leaderboard/durable-object.ts` | `src/leaderboard/*` | `tests/leaderboard.test.ts` | Durable Objects |

Rule baked into AGENTS.md: "Before writing code, read FEATURE_MAP.md. If you touch a feature, update its row. If you add a feature, add a row."

---

## 4. Skills — teach the agent our specific workflows

General agents know git; they don't know *our* tournament workflow. Skills close that gap. Each skill is a folder with a SKILL.md (what it does, when to use it, exact steps) plus any helper scripts.

Skills to build for Arena:

1. **spawn-tournament** — given a task description: validate input with zod → call Artifacts binding to fork N repos → mint scoped tokens → register the tournament in the DO → return tournament ID. The skill encodes the *correct order* of these calls so the agent doesn't improvise it.
2. **run-judge-pipeline** — subscribe to push events, run build → test → benchmark → score, write results to the leaderboard. Includes the retry policy and what to do when a build times out (the kind of thing agents otherwise handle differently every time).
3. **merge-winner** — the auto-merge sequence: verify all gates green → merge winning branch → confirm Workers Builds deploy succeeded → tag the release → archive losing attempts' reasoning traces into the memory store.

Skill hygiene: a skill is versioned like code, reviewed like code, and has its own evals (see next section). When a workflow changes, update the skill in the same PR.

---

## 5. EVAL_PLAYBOOK.md — evals are unit tests for agents

You wouldn't ship code without tests. Don't ship a skill or a prompt without evals.

**What an eval looks like here.** Each eval in `/evals` is: input fixture + the skill/prompt under test + expected output + a scoring function. Example:

- `evals/spawn-tournament/valid-task.eval.ts` — given fixture task JSON, the skill must produce exactly N forks, tokens scoped to one repo each, and a tournament record. Score is binary: pass/fail on each assertion.
- `evals/merge-winner/refuses-unsafe-merge.eval.ts` — given a tournament where tests failed, the skill MUST refuse to merge. This is a negative test, and it's the most important one in the repo.

**The loop.** Run evals → agent fails one → fix the skill or prompt → re-run the full eval suite (not just the failing one, regressions hide in the others) → repeat until green → only then does a human review the change.

**Evals run in CI.** Any PR that touches `skills/`, prompts, or the judge pipeline triggers the eval suite. Eval failure blocks merge, same as a failing unit test.

**Playbook rules:**

- Eval outputs are committed. "The agent usually gets it right" is not a result.
- Keep a flakiness budget: run each eval 3x; anything that isn't deterministic gets investigated, not ignored.
- When production behavior surprises us, that surprise becomes a new eval before it becomes a fix. The eval suite is the memory of every way the agent has ever betrayed us.

---

## 6. Spawning agents — the working model

How we actually use agents day to day on this project:

1. **Plan first, in the cloud.** For any multi-step task, a planning agent (cloud agent, long context) produces a written plan: files to touch, order of operations, risks. That plan is reviewed by a human before any code is written. Plans are saved to `docs/plans/` so future agents can see what was intended vs. what happened.
2. **Spawn narrowly.** One agent, one task, one module from the feature map. "Fix the leaderboard scoring bug" not "improve the backend." Parallel agents work on different modules only — two agents in the same files is how you get the merge conflicts this whole product is supposed to solve.
3. **Every spawned agent gets the same context pack:** AGENTS.md, the relevant SPEC.md section, the FEATURE_MAP row, and the skill it should use. Context is assembled, not improvised.

---

## 7. The auto-merge pipeline — with human gates where they matter

Yes to automated merging, no to unreviewed production. The pipeline:

```
agent opens PR
  → lint + typecheck + unit tests          (block merge)
  → eval suite (if skills/prompts touched) (block merge)
  → build + deploy to preview Worker       (block merge)
  → automated diff review agent            (advisory comment, not a gate)
  → HUMAN REVIEW                           (required for main)
  → auto-merge on approval                 (squash, tagged)
  → post-deploy verification agent         (smoke-tests the live preview)
```

Two principles here. First, **verify before pushing is the agent's job**: the agent runs tests and evals locally and pastes results in the PR body — a PR with failing local checks is closed unread. Second, **careful shipping is the pipeline's job**: production deploys only from main, main only through this pipeline, and the post-deploy agent smoke-tests what actually shipped, not what we hope shipped.

---

## 8. AGENTS.md — the constitution

The file every agent reads first. Keep it under a page:

1. What this product is (2 sentences, from SPEC.md)
2. Read FEATURE_MAP.md before writing code
3. Which skills exist and when to use them
4. Never bypass the pipeline; never commit secrets; never expand scope beyond the task
5. How to run tests and evals
6. If the spec and the code disagree, stop and ask — don't pick one silently

---

## 9. The quality loop, end to end

```
SPEC (human-written, human-reviewed)
  → PLAN (agent-written, human-reviewed)
    → CODE (agent, scoped by feature map, using skills)
      → VERIFY (agent runs tests + evals before pushing)
        → PIPELINE (CI gates + human review + auto-merge)
          → DEPLOY + SMOKE TEST
            → any surprise becomes a new eval
```

Every stage has a written artifact and a named owner. That's the whole trick: agents are fast, so the bottleneck is judgment — and judgment needs paper trails.
