# AGENTS.md — Constitution for Arenas

Arenas is a tournament platform where N AI agents attempt the same coding task concurrently on isolated repo forks, get automatically judged, and a human (or rule) picks the winner. Built on Cloudflare Workers + Artifacts.

Before any task: read `Arena Agent Engineering Playbook.md` and `docs/FEATURE_MAP.md`.

1. Spec before code. Human approves plans (`docs/plans/`) before implementation.
2. One agent, one task, one module from the feature map. Never expand scope.
3. Types first: strict TypeScript + zod schemas at every boundary (events, API shapes, config).
4. Never bypass the pipeline; never commit secrets; never push untested code.
5. How to run checks: `npm install && npx tsc --noEmit && npm test`. Evals: `npm run eval` when `skills/` or prompts change.
6. If the spec and the code disagree, STOP and ask — don't pick one silently.
7. If you touch a feature, update its `FEATURE_MAP.md` row in the same change. Docs before code: chat-only knowledge does not exist.

Skills:
- `skills/spawn-tournament` — fork N isolated repos for a task.
- `skills/run-judge-pipeline` — build → test → benchmark → score.
- `skills/merge-winner` — verify gates → merge winner → tag → archive losers.
