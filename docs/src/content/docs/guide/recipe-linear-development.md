---
title: Develop from a Linear issue
description: Validate a local Linear credential, approve a plan and implement an issue through the recipe CLI.
---

The source checkout includes `test-recipe-linear-development/`: two YAML files, host extensions and a small TypeScript HTTP application under `repo/`. The workflow reads a Linear issue, prepares a plan, requests approval, implements the approved work, enforces `npm test` and produces a summary. It uses the existing [durable recipe engine](../recipe-durability/).

## Prepare the application

The application needs Node.js 24+ and no runtime dependencies. It serves `/health` and `/hello?name=Jean` on port 3000; `PORT` selects another port. Its tests start a temporary HTTP server.

```sh
npm --prefix test-recipe-linear-development/repo test
npm --prefix test-recipe-linear-development/repo start
```

The recipe initializes a separate Git repository inside `repo/` on first execution. Existing repositories must already have a commit; their Git configuration is preserved. Agents receive only that repository. The credential cache and recipe checkpoint storage stay in the parent directory.

## Run through the CLI

Use the CLI built from this checkout. Link it after building, then run the recipe. The supplied configuration selects Docker image `outpost:sandbox` and the usual host Codex account session. Prepare these through [agent images](../agent-images/) and [authentication](../authentication/) before agent execution.

```sh
bun run build
bun link
outpost recipe run \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml
```

The host extension checks `LINEAR_API_KEY`, then its cache at `test-recipe-linear-development/.private/linear-token`. It validates the selected personal API key using Linear's [viewer query](https://linear.app/developers/graphql) on every run or resume. Missing or rejected keys trigger a masked terminal prompt; only a successfully validated key replaces the saved file. Network failures stop the invocation and preserve the cache.

The cache is a plaintext file excluded from Git, with file mode `0600` and directory mode `0700` on POSIX. The key never becomes a workflow answer, checkpoint input, agent variable or prompt. Only selected issue fields reach the agents. Use a personal API key with read access; this recipe makes no Linear mutations.

## Choose and approve the work

Enter an identifier such as `ENG-123`, an issue UUID, a Linear issue URL or a number. A number prompts for the team key. Unknown or inaccessible issues prompt again.

The CLI displays the saved planning result at the approval gate. Select **Approve** and enter a reason to continue, **Reject** to stop dependent work, or **Leave pending** to review later. Planning's no-edit instruction is agent guidance; the native gate enforces that the implementation task cannot start before approval. The shared workspace integrates into `repo/` only after the full workflow succeeds.

The configured observer displays task states, durations, tool names, commits, token totals and the final summary on stderr. It omits raw protocol events and checkpoint noise. Add `--json` for automation or `--interactive --json` for terminal questions with a final machine-readable report.

## Resume or start another issue

The default run ID is `linear-development`. Resume an existing run to display its pending question or saved plan without replaying completed tasks. For another issue, start a new run with a fresh `--run-id`; the validated credential cache is reused.

```sh
outpost recipe resume \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml \
  --run-id linear-development
outpost recipe run \
  --file test-recipe-linear-development/recipe.yaml \
  --config test-recipe-linear-development/outpost.yaml \
  --run-id next-issue
```

Offline tests cover credential rejection, replacement, caching, outages and secret exclusion, plus the complete CLI flow with simulated Linear and model responses, real Git workspaces and the application's tests. Live Linear credentials and paid Codex calls are not exercised by these tests.
