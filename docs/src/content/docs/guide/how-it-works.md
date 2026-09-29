---
title: "How Outpost works"
description: "Three independent pieces, the life of one dispatch, who owns each resource and what stays on disk."
---

## Three independent pieces

Every agent task combines three choices. Changing one never forces you to change the others.

<!-- features -->

- [Agent](../choose-an-agent/): Who does the work: a harness that runs the agent loop, plus an optional model.
  - `createAgent()`
  - `createCodexHarness()`
  - `createHarness()`
- [Sandbox provider](../choose-a-sandbox/): Where commands run. Omitting it uses Docker.
  - Docker
  - Podman
  - Vercel
  - Daytona
  - Firecracker
  - host
- [Workspace](../repository-and-branch/): Which checkout the agent edits and where its commits land.
  - `current`
  - `named`
  - `integrate`

## Swap one, keep the rest

`dispatch()` takes the three pieces and a **brief**, the instruction for the agent.

Swapping Codex for Claude Code changes only `coder`. Moving to a cloud sandbox changes only `sandboxProvider`. The rest of the code stays the same.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const result = await dispatch({
  agent: coder,
  sandboxProvider,
  repository,
  branch: { mode: "named", name: "outpost/fix-links" },
  brief: { text: "Fix the broken links in the README and commit the change." },
});
console.log(result.branch, result.commits.length);
```

## The life of one dispatch

<!-- flow -->

1. **Prepare**: Before the agent starts.
   - **Check the request**: Options and agent are validated before anything is allocated.
   - **Open the workspace**: Lock the branch, create its worktree under `.outpost/workspaces`, run `workspaceReady` hooks.
     - host
   - **Allocate the sandbox**: Containers mount the worktree. Cloud sandboxes receive the Git history and install the CLI if needed.
     - sandbox
   - **Prepare the agent**: Run `hostReady` and `sandboxReady` hooks, copy credentials into a private home, restore a conversation.
     - host
     - sandbox
2. **Run**: The agent works in the worktree.
   - **Run the turns**: The brief, extra passes and typed-response repairs each run as a turn.
     - sandbox
   - **Save the conversation**: After each turn, when the agent supports capture.
     - host
3. **Finish**: Whatever happens, the sandbox is released.
   - **Bring changes back**: Cloud sandboxes download, validate and apply the new commits.
     - host
   - **Integrate**: `integrate` merges the work branch into its base. Nothing is pushed.
     - host
   - **Close**: Release the sandbox, remove a clean worktree, keep a `named` branch.
     - host
     - sandbox

When a step fails, Outpost still releases the sandbox and keeps the workspace. [`recoveryDetails()`](../../reference/recoverydetails/) reads the branch, directory, commits and transcript from the error; [Recover work](../recovery/) restores them.

## Cold or warm

|                        | `dispatch()`                      | `createSandbox()`                              |
| ---------------------- | --------------------------------- | ---------------------------------------------- |
| Environment            | Fresh for each call               | Kept open until `close()`                      |
| Files and dependencies | Discarded after the call          | Kept between operations                        |
| Operations             | One agent task                    | `dispatch()`, `command()`, `attach()`, in turn |
| Integration            | Automatic, from the branch policy | You call `sandbox.workspace.integrate()`       |
| Use it for             | A one-shot task                   | Tests between agent turns                      |

Files persist in a warm sandbox, conversations do not: each `sandbox.dispatch()` starts a new one unless you [resume](../conversations/) it.

## Who closes what

Whoever opens a resource closes it. `close()` can be called twice, stops the running operation and waits for it; `await using` works too.

| Opened by                             | Closed by                                          |
| ------------------------------------- | -------------------------------------------------- |
| `dispatch()`                          | Itself, workspace and sandbox                      |
| `createSandbox()` without `workspace` | `sandbox.close()`, which also closes its workspace |
| `openWorkspace()`                     | You: close its sandbox first, then the workspace   |

A sandbox runs one operation at a time; a second one is rejected, not queued. Run parallel work in separate sandboxes, each on its own branch, and coordinate them with [task dependencies](../task-dependencies/).

## From tasks to workflows

A workflow is a graph of tasks built on the same calls: `defineIsolatedTask()` runs a cold dispatch, `defineAgentTask()` uses a sandbox you own, `defineTask()` runs plain code. A checkpoint saves each finished task so a restarted run skips it. Start with [From a task to a workflow](../first-workflow/).

## What stays in `.outpost`

Outpost keeps its runtime state in the target repository and hides it from Git through `.git/info/exclude`.

<!-- files -->

- `.outpost/`
  - `workspaces/`: Worktrees of `named` and `integrate` branches, including retained ones.
  - `locks/`: Ownership of checkouts, branches and integration.
  - `storage/`: [Journals](../journals/), checkpoints, artifacts and resource activity.
  - `conversations/`: Built-in harness transcripts, Copilot and Kimi sessions.
  - `recovery/`: Transfers kept after a failed synchronization.

Claude Code and Codex keep their transcripts in their own store in your home directory. The `.outpost` directory can hold the only copy of unfinished work: inspect it with [Recover work](../recovery/) and prune it with [Retention and cleanup](../retention/), never by hand.

## Read the API names

| Name      | When it runs                                                           | Examples                                                                   |
| --------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `create*` | Builds an object you keep; starts no process, except `createSandbox()` | `createAgent()`, `createDockerSandboxProvider()`, `createLocalTransport()` |
| `define*` | Declares what an engine runs later                                     | `defineWorkflow()`, `defineAgentTask()`, `defineJsonResponse()`            |
| verbs     | Act now and return when done                                           | `dispatch()`, `openWorkspace()`, `attach()`, `readJournal()`               |

## Security

:::caution
The agent runs project commands with the access you give it. Docker and Podman mount the checkout and its Git metadata; the host provider has no isolation. Read [Security](../security/) before running agents on untrusted code.
:::
