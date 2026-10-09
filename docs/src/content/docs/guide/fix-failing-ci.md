---
title: "Fix a failing CI build"
description: "Let an agent fix code and retry until your test command passes."
---

## What this example covers

<!-- features -->

- [Sandbox sessions](../sandbox-sessions/): One warm sandbox keeps dependencies between agent turns and test runs.
- [Repository and branch](../workspaces/): The fix lands on a named branch, never on your checkout.
- [Prepare the environment](../environment-setup/): Dependencies are installed once, before the first round.
- [Verification loops](../verification-loops/): Attempt, check, feed the failure back, repeat.
- [Budgets](../budgets/): Cap the attempts and tokens of the whole run.
- [Run in CI](../ci-automation/): A failed run throws, so the job exits non-zero.

## Write the script

Save the files shown in the tabs next to the configuration from [Installation](../setup/). The entry script keeps one sandbox open so the agent’s edits and your test command use the same files.

Keep sandbox allocation, the agent attempt and commit checks in separate files.

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

```ts title="fix-request.ts"
export function fixRequest(feedback?: string) {
  return {
    brief: {
      text: [
        "`npm test` fails. Fix the code so that it passes, then commit the fix.",
        feedback ? `The last check failed:\n${feedback}` : "",
      ].join("\n\n"),
    },
  };
}
```

```ts title="fix-attempt.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";
import { defineAgentTask } from "@elie-laloum/outpost";
import { fixRequest } from "./fix-request.ts";

export function createAttempt(sandbox: Sandbox) {
  return async (context: LoopTaskContext, feedback: string | undefined) => {
    const agent = defineAgentTask({
      key: "coder",
      sandbox,
      request: () => fixRequest(feedback),
    });
    const result = await agent.perform(context);
    return { summary: result.text, commits: result.commits.length };
  };
}
```

```ts title="test-command.ts"
import type { Sandbox, LoopTaskContext } from "@elie-laloum/outpost";

export async function testCommand(sandbox: Sandbox, context: LoopTaskContext) {
  return sandbox.command({
    executable: "npm",
    arguments: ["test"],
    retain: 20_000,
    signal: context.signal,
  });
}
```

```ts title="check-commit.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";

export async function checkCommit(
  sandbox: Sandbox,
  context: LoopTaskContext,
): Promise<LoopCheckResult> {
  const status = await sandbox.command({
    executable: "git",
    arguments: ["status", "--porcelain"],
    signal: context.signal,
  });
  const feedback = `Tests pass. Commit these changes:\n${status.stdout}`;
  return status.stdout.trim() ? { done: false, feedback } : { done: true };
}
```

Compose the loop and run `fix-ci.ts`, which owns and closes the sandbox.

<!-- tabs -->

```ts title="fix-check.ts"
import type {
  Sandbox,
  LoopTaskContext,
  LoopCheckResult,
} from "@elie-laloum/outpost";
import { testCommand } from "./test-command.ts";
import { checkCommit } from "./check-commit.ts";

export function createCheck(sandbox: Sandbox) {
  return async (context: LoopTaskContext): Promise<LoopCheckResult> => {
    const tests = await testCommand(sandbox, context);
    if (tests.status !== 0)
      return { done: false, feedback: `${tests.stdout}\n${tests.stderr}` };
    return checkCommit(sandbox, context);
  };
}
```

```ts title="fix-task.ts"
import type { Sandbox } from "@elie-laloum/outpost";
import { defineLoopTask } from "@elie-laloum/outpost";
import { createAttempt } from "./fix-attempt.ts";
import { createCheck } from "./fix-check.ts";

export function defineFix(sandbox: Sandbox) {
  return defineLoopTask({
    key: "fix",
    maxRounds: 4,
    timeoutMs: 1_200_000,
    attempt: createAttempt(sandbox),
    check: createCheck(sandbox),
  });
}
```

```ts title="fix-ci.ts"
import { reportValue } from "./reporter.ts";
import { openFixSandbox } from "./fix-sandbox.ts";
import { defineFix } from "./fix-task.ts";
import { defineWorkflow } from "@elie-laloum/outpost";
await using sandbox = await openFixSandbox();
export const fix = defineFix(sandbox);
export const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});
reportValue(`status: ${result.status}`);
// Example output: status: done
reportValue(`branch: ${sandbox.workspace.branch}`);
// Example output: branch: outpost/fix-ci
reportValue(`rounds: ${result.tasks[0]?.rounds?.length ?? 0}`);
// Example output: rounds: 2
reportValue(`tokens: ${JSON.stringify(result.usage.tokens)}`);
// Example output: tokens: {"input":1200,"cached":0,"output":320}
if (result.status === "done") reportValue(result.value(fix).summary);
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

<!-- canvas -->

- [Your script](../ci-automation/): `fix-ci.ts` opens the sandbox, starts the workflow with its `budget` and settles the exit code.
  - host
  - → **Sandbox**: `createSandbox()`
  - → **Attempt**: `workflow.start()`
- [Loop](../verification-loops/): `defineLoopTask()`, at most 4 rounds, each bounded by `timeoutMs`.
  - workflow
  - **Attempt**: the brief, plus the last failure
    - → **Agent**: `perform(context)`
  - **Check**: `npm test` must exit 0, then the tree must be clean; the last 20,000 characters of output become the feedback
    - → **Commands**: `sandbox.command()`
- [Sandbox](../sandbox-sessions/): Stays open between rounds, so dependencies and edits carry over.
  - sandbox
  - **Commands**: `npm ci` once, before the first turn; `npm test` each round
  - **Agent**: edits and commits; its tokens count against `budget`
  - → **Branch**: commits
- **Branch**: `outpost/fix-ci` in `.outpost/workspaces`; `await using` closes the sandbox and keeps it. Nothing is merged or pushed.
  - host

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
