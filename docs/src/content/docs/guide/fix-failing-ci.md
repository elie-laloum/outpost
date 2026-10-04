---
title: "Fix a failing CI build"
description: "An agent fixes failing tests on a branch while Outpost reruns them after each attempt and feeds the failures back. You get a branch to review and a summary for the CI log; the job fails when the rounds, attempts or tokens run out."
---

## What you use

<!-- features -->

- [Sandbox sessions](../sandbox-sessions/): One warm sandbox keeps dependencies between agent turns and test runs.
  - `createSandbox()`
  - `sandbox.command()`
- [Repository and branch](../repository-and-branch/): The fix lands on a named branch, never on your checkout.
  - `named`
- [Prepare the environment](../environment-setup/): Dependencies are installed once, before the first round.
  - `sandboxReady`
- [Verification loops](../verification-loops/): Attempt, check, feed the failure back, repeat.
  - `defineLoopTask()`
  - `defineAgentTask()`
- [Budgets](../budgets/): Cap the attempts and tokens of the whole run.
  - `budget`
- [Run in CI](../ci-automation/): A failed run throws, so the job exits non-zero.
  - `unwrap()`

## The script

Place it next to the `outpost.config.mts` from [Setup](../setup/).

```ts title="fix-ci.mts"
import {
  createSandbox,
  defineAgentTask,
  defineLoopTask,
  defineWorkflow,
} from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-ci" },
  hooks: { sandboxReady: [{ executable: "npm", arguments: ["ci"] }] },
});

const fix = defineLoopTask({
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
            "`npm test` fails. Fix the code so that it passes, then commit the fix.",
            feedback ? `The last check failed:\n${feedback}` : "",
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
    return status.stdout.trim()
      ? {
          done: false,
          feedback: `Tests pass. Commit these changes:\n${status.stdout}`,
        }
      : { done: true };
  },
});

const result = await defineWorkflow("fix-ci", [fix]).start({
  budget: { attempts: 4, usage: { input: 5_000_000, output: 200_000 } },
});

const rounds = result.tasks.find((task) => task.key === "fix")?.rounds;
console.log(`status: ${result.status}`);
console.log(`branch: ${sandbox.workspace.branch}`);
console.log(`rounds: ${rounds?.length ?? 0}`);
console.log(`tokens: ${JSON.stringify(result.usage.tokens)}`);
if (result.status === "done") console.log(result.value(fix).summary);
result.unwrap();
```

```sh
node fix-ci.mts
git log --oneline HEAD..outpost/fix-ci
```

:::caution
The agent can edit the tests or the `test` script. Review the diff, and let your CI run the tests again on the pushed branch.
:::

## How it works

Each link shows who hands what to whom, in the direction of the arrow.

<!-- canvas -->

- [Your script](../ci-automation/): `fix-ci.mts` opens the sandbox, starts the workflow with its `budget` and settles the exit code.
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

## Adapt it

| Variation      | Change                                                                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Another agent  | Pass a [fallback agent](../fallback-agents/) as `agent`: `createFallbackAgent([claude, codex], { on: ["quota", "unavailable"] })` switches on a usage limit or an outage. |
| Run it in CI   | Use an [unattended credential](../ci-automation/), name the branch per run (`` `outpost/fix-ci-${process.env.GITHUB_RUN_ID}` ``), then `git push origin` that branch.     |
| Stricter check | Add `npm run lint` or a typecheck after the tests, or ask a reviewer agent from `check` ([Verification loops](../verification-loops/)).                                   |
| Cloud sandbox  | Replace `sandboxProvider` with a [Vercel or Daytona provider](../cloud-sandboxes/). Commits come back to the branch on the host.                                          |

API: [createSandbox](../../reference/createsandbox/) · [defineLoopTask](../../reference/definelooptask/) · [defineAgentTask](../../reference/defineagenttask/) · [WorkflowBudget](../../reference/workflowbudget/) · [LoopTaskExhausted](../../reference/looptaskexhausted/) · [WorkflowFailure](../../reference/workflowfailure/).
