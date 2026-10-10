---
title: "Run in CI"
description: "Run an Outpost script in a CI job and keep the results you need after the runner stops."
---

## What the runner needs

<!-- features -->

- **Node.js 24+**: Runs Outpost and your scripts.
- **Git history**: A full clone, so the agent can read the history and cloud sandboxes can upload it.
- **A sandbox**: Docker or Podman on the runner, or the SDK of a [cloud sandbox](../cloud-sandboxes/) and its allocation credentials.
- **The agent image**: Built in the job from `.outpost-image/Dockerfile`, prepared during [installation](../setup/) and committed with your scripts.
- **An unattended credential**: An API key or a dedicated account token, stored as a CI secret.
- **Your scripts and configuration**: `package.json`, the lockfile, `outpost.config.ts` and your scripts, committed.

## Authenticate without a person

For API-key access in CI, configure `coder` in `outpost.config.ts` to read a key from the job’s environment. Declare that key in your CI secret settings, so the runner can use it without an interactive login.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

Claude Code and Copilot CLI also take a subscription token through `{ account: { variable } }`, such as `CLAUDE_CODE_OAUTH_TOKEN`. See [Authentication](../authentication/) for the supported credentials, their billing and where Outpost installs them.

## Add the workflow

This GitHub Actions job runs `review.ts` from [Your first task](../first-request/) on every pull request.

```yaml title=".github/workflows/outpost.yml"
name: Outpost review
on: pull_request

jobs:
  review:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v5
        with:
          node-version: 24
      - run: npm ci
      - run: npx outpost image build --directory .outpost-image --image outpost:dev
      - run: npx outpost doctor --image outpost:dev --json
      - run: node review.ts
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

Build the image in the job so its user ID matches the runner. The Docker provider refuses an image built for another user ID. If your image recipe is in another directory, adjust `--directory`.

`doctor` exits with status 1 when the engine, the image or the agent CLI is missing ([Diagnostics](../diagnostics/)). It checks Codex on Docker unless you pass `--agent` or `--sandbox-provider`, and it does not test the API key.

[Fix a failing CI build](../fix-failing-ci/) is a complete script to run this way.

## Fail the job when the work fails

A job fails when the script exits with a non-zero status. Printing an error is not enough.

| What fails                        | What Outpost does                            | What you do                  |
| --------------------------------- | -------------------------------------------- | ---------------------------- |
| `dispatch()`, sandbox allocation  | Rejects; Node exits with status 1            | Nothing, or log and rethrow  |
| A `sandbox.command()`             | Resolves with its non-zero `status`          | Throw when `status` is not 0 |
| A workflow started with `start()` | Resolves with a `status` other than `"done"` | Call `result.unwrap()`       |
| `outpost doctor`                  | Exits with status 1                          | Nothing                      |

```ts title="fix.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const signal = AbortSignal.timeout(30 * 60_000);
await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: `outpost/fix-${process.env.GITHUB_RUN_ID}` },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit the fix." },
  signal,
});
const tests = await sandbox.command({
  executable: "npm",
  arguments: ["test"],
  signal,
});
if (tests.status !== 0) throw new Error(`npm test failed:\n${tests.stderr}`);
```

Keep the `signal` deadline shorter than the job’s `timeout-minutes`. Outpost then stops the agent and the step fails, instead of GitHub cancelling the job and skipping your `if: failure()` steps ([Limits and cancellation](../limits-and-cancellation/)).

## Name the branch per run

A `named` branch that already exists is reused, with the commits of the earlier run. Put the run ID in the name, as in `fix.ts`, so each job starts from the checked-out commit. This matters on self-hosted runners, which keep branches between jobs.

## Deliver the changes

Outpost commits on the branch and stops there. Push from the job once your checks pass, with a token allowed to write.

```yaml
permissions:
  contents: write
steps:
  # ...the steps above, running fix.ts
  - run: git push origin "outpost/fix-${GITHUB_RUN_ID}"
```

Open the pull request or merge through your usual review and approval rules. To wait for a person inside the run, use [Approvals](../approvals/).

## Keep recovery data

A hosted runner is deleted after the job, with the repository’s `.outpost/` directory. Upload what you need to inspect or resume a failed run.

:::caution
Journals and transfers can themselves contain secrets or credential files. Selecting these paths does not sanitize their contents. Inspect the data before uploading and restrict archive access; do not automatically publish sensitive data.
:::

After reviewing their contents, add the selected recovery paths to the failure step. This example keeps the artifact for seven days.

```yaml
- if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: outpost-recovery
    include-hidden-files: true
    if-no-files-found: ignore
    retention-days: 7
    path: |
      .outpost/recovery/
      .outpost/storage/objects/checkpoints/
      .outpost/storage/objects/logs/
```

These paths hold the transfers kept after a failed synchronization, workflow checkpoints and [journals](../journals/) ([Where data lives](../storage/)). Never upload conversations, `.env` or credential files: anyone with read access to the repository can download CI artifacts.

The agent’s commits stay on its branch: push it from an `if: failure()` step to keep them. A checkpoint in [S3 or R2](../object-storage/) does not save Git worktrees or native conversations. Resume on a retained runner with those resources, or explicitly restore and validate them first. Pushing a branch alone is insufficient.

## Start runs without a CI job

<!-- features -->

- [Cron schedules](../cron-schedules/): Publish a workflow job at fixed times from a long-running process.
- [Webhooks](../webhooks/): Publish a job when a repository event arrives, after checking its signature.
- [Job queues and workers](../job-queues/): Run the published jobs on your own workers.

## Limits

- Outpost never pushes, opens pull requests or merges on a remote.
- `doctor` does not test sign-in, API keys or model access.
- Commits use the repository’s `user.name` and `user.email`, or `Outpost <outpost@localhost>` when the runner sets none.

API: [dispatch](../../reference/dispatch/) · [createSandbox](../../reference/createsandbox/) · [WorkflowResult](../../reference/workflowresult/) · [WorkflowFailure](../../reference/workflowfailure/) · [createCodexHarness](../../reference/createcodexharness/).
