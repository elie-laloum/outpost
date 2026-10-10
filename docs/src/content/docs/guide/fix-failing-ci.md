---
title: "Fix a failing CI build"
description: "Let an agent fix code and retry until your test command passes."
---

[Download all files](../../guide-examples/fix-failing-ci.tar.gz). Extract into a dedicated directory, run `npm install`, then adapt `outpost.config.ts` using [Installation](../setup/). The commands below identify the scripts to run.

<!-- canvas -->

- **Correct**: The agent edits and commits on the work branch.
  - Agent
  - → **Check**: candidate ready
- **Check**: Tests must pass and the working tree must be clean.
  - Your check
  - → **Correct**: needs work
  - → **Review branch**: checks pass
  - → **Stop**: rounds exhausted
- **Review branch**: Inspect outpost/fix-ci; nothing is merged or pushed.
  - You
- **Stop**: Keep the work for inspection.
  - Workflow

## Write the script

Save the files shown in the tabs next to the configuration from [Installation](../setup/). The entry script keeps one sandbox open so the agent’s edits and your test command use the same files.

The repository needs a failing `npm test` and a lockfile for `npm ci`.

Allocation and cleanup stay with the entry point. The loop keeps the attempt and its check together so their sequence is visible.

<!-- tabs -->

```ts title="fix-sandbox.ts"
import { createSandbox } from "@elie-laloum/outpost";
import { repository, sandboxProvider, coder } from "./outpost.config.ts";

export function openFixSandbox() {
  return createSandbox({
    repository,
    sandboxProvider,
    agent: coder,
    branch: { mode: "named", name: "outpost/fix-ci" },
    hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
  });
}
```

```ts title="fix-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineAgentTask, defineLoopTask } from "@elie-laloum/outpost";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
    key: "fix",
    maxRounds: 4,
    timeoutMs: 1_200_000,
    async attempt(context, feedback) {
      const agent = defineAgentTask({
        key: "coder",
        sandbox,
        request: () => ({
          brief: {
            text: [
              "npm test fails. Fix the code, run the tests and commit the fix.",
              feedback ? `Previous check:\n${feedback}` : "",
            ].join("\n\n"),
          },
        }),
      });
      const result = await agent.perform(context);
      return { summary: result.text, commits: result.commits.length };
    },
    async check(context) {
      const tests = await sandbox.command({
        executable: "npm",
        arguments: ["test"],
        retain: 20_000,
        signal: context.signal,
      });
      if (tests.status !== 0)
        return { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
      const status = await sandbox.command({
        executable: "git",
        arguments: ["status", "--porcelain"],
        signal: context.signal,
      });
      if (status.status !== 0) throw new Error(status.stderr);
      if (status.stdout.trim())
        return {
          done: false,
          feedback: `Tests pass. Commit the changes:\n${status.stdout}`,
        };
      return { done: true };
    },
  });
}
```

```ts title="fix-ci.ts"
import { openFixSandbox } from "./fix-sandbox.ts";
import { defineFix } from "./fix-task.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
await using sandbox = await openFixSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});
console.log(`status: ${result.status}`);
// Example output: status: done
console.log(`branch: ${sandbox.workspace.branch}`);
// Example output: branch: outpost/fix-ci
console.log(`rounds: ${result.tasks[0]?.rounds?.length ?? 0}`);
// Example output: rounds: 2
console.log(`tokens: ${JSON.stringify(result.usage.tokens)}`);
// Example output: tokens: {"input":1200,"cached":0,"output":320}
if (result.status === "done") console.log(result.value(fix).summary);
// Example output: Fixed the parser and verified the tests.
result.unwrap();
```

### Run the script

Run the verification loop, then inspect the commits on its branch. The script prints the status, the number of rounds and token usage, and exits with an error if the workflow fails.

```sh
node fix-ci.ts
git log --oneline HEAD..outpost/fix-ci
```

:::caution
The agent can edit the tests or the `test` script. Review the diff, and let your CI run the tests again on the pushed branch.
:::

## Understand the steps

`perform(context)` ties the agent’s usage and cancellation to the workflow, so its tokens count against `budget`. `timeoutMs` bounds each round.

| Outcome                       | `result.status` | `result.errors`                      | Exit code |
| ----------------------------- | --------------- | ------------------------------------ | --------- |
| A check accepts the round     | `"done"`        | Empty                                | 0         |
| The fourth check rejects      | `"failed"`      | `LoopTaskExhausted`, with `feedback` | 1         |
| Tokens or attempts run out    | `"failed"`      | `WorkflowBudgetExceeded`             | 1         |
| The agent or a command throws | `"failed"`      | The thrown error                     | 1         |

`result.unwrap()` throws a `WorkflowFailure` for every row but the first. A token limit also stops the agent that is running.

## Adapt the example

| Variation      | Change                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Another agent  | Pass a [fallback agent](../fallback-agents/) as `agent`: `createFallbackAgent([claude, codex], { on: ["quota", "unavailable"] })` switches on a usage limit or an outage. |
| Run it in CI   | Use an [unattended credential](../ci-automation/), name the branch per run (`` `outpost/fix-ci-${process.env.GITHUB_RUN_ID}` ``), then `git push origin` that branch.     |
| Stricter check | Add `npm run lint` or a typecheck after the tests, or ask a reviewer agent from `check` ([Verification loops](../verification-loops/)).                                   |
| Cloud sandbox  | Replace `sandboxProvider` with a [Vercel or Daytona provider](../cloud-sandboxes/). Commits come back to the branch on the host.                                          |

API: [createSandbox](../../reference/createsandbox/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [WorkflowBudget](../../reference/workflowbudget/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [WorkflowFailure](../../reference/workflowfailure/).
