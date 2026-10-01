# Arenas

Arenas is a tournament platform for coding agents. You post one task with a test suite, N agents attempt it at the same time on isolated forks, each attempt gets built, tested, benchmarked, and scored, and a human picks the winner from a ranked leaderboard. Git assumes one author at a time. This exists for the opposite case.

It runs on Cloudflare Workers with Artifacts for the forks, Durable Objects for tournament state, and Workflows for the judging pipeline.

## Status

Early. The bones are in and the meat is not. What works now:

- A deploys-clean Worker with a health endpoint
- A leaderboard Durable Object that records scores and ranks attempts, ties included
- A judge Workflow that runs build, test, benchmark, and score steps with retries and writes results to the leaderboard

What does not work yet: creating tournaments. That needs the Artifacts binding, and Artifacts is still in closed beta, so that whole path is stubbed until access comes through. Real build/test runners and eval enforcement in CI are also still ahead. `docs/FEATURE_MAP.md` tracks exactly what is real and what is TBD.

## Run it

You need Node 22 and a Cloudflare account for deploys. Local checks need neither.

```
npm install
npx tsc --noEmit
npm test
```

`npm run eval` runs the agent eval suite. Right now it prints a placeholder because no evals exist yet.

```
npx wrangler dev      # local
npx wrangler deploy   # needs `wrangler login` first
```

One quirk: install with stock npm 10 fails on a peer-deps resolution bug, so `.npmrc` sets `legacy-peer-deps`. Leave it alone.

## Layout

```
AGENTS.md                  # rules every agent session follows, read this first
docs/                      # spec, architecture, feature map, eval playbook, plans, ADRs
skills/                    # the three agent workflows: spawn-tournament, run-judge-pipeline, merge-winner
src/tournaments/           # TBD, blocked on Artifacts access
src/judge/                 # push event to ranked score
src/leaderboard/           # scores in, rankings out
evals/                     # tests for the agents themselves, Phase 1
pipelines/                 # CI gates, human approval still required for main
```

## How work happens here

Spec before code. Anything bigger than a trivial fix gets a written plan in `docs/plans/` and a human approves it before implementation starts. One task touches one module. Every boundary gets a zod schema. Tests run before every commit, and the feature map gets updated in the same change as the feature.

If the spec and the code disagree, we stop and ask. We do not guess.
