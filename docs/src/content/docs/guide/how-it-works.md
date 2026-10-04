---
title: "How it works"
description: "Three independent pieces, the life of one run, who owns each resource and what stays on disk."
---

<!-- features -->

- [Agent](../choose-an-agent/): Who does the work: a harness that runs the agent loop, plus an optional model.
  - `createAgent()`
  - `createCodexHarness()`
  - `createHarness()`
- [Sandbox](../choose-a-sandbox/): Where commands run. Docker by default.
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

`run.ts` opens a workspace, a branch and its checkout, then opens sandboxes on it. Each `dispatch()` runs an agent there with a **brief**, the instruction for the agent. Agents come from `agents.ts` and sandboxes from `sandboxes.ts`: swapping a piece means importing another name.

- **Same sandbox, another harness**: each `dispatch()` can take its own agent. Here Claude reviews what Codex fixed, with the same files and installed dependencies.
- **Same workspace, another sandbox**: a new sandbox picks up the branch and its commits. Close the previous one first: a workspace holds one open sandbox at a time.

<!-- tabs -->

```ts title="run.ts" {21,29}
import { openWorkspace } from "@elie-laloum/outpost";
import { claude, codex } from "./agents.ts";
import { dockerProvider, vercelProvider } from "./sandboxes.ts";

await using workspace = await openWorkspace({
  repository: process.cwd(),
  branch: { mode: "named", name: "outpost/fix-links" },
});

const dockerSandbox = await workspace.sandbox({
  sandboxProvider: dockerProvider,
  agent: codex,
});

await dockerSandbox.dispatch({
  brief: { text: "Fix the broken links in the README." },
});

// Same sandbox, another harness.
await dockerSandbox.dispatch({
  agent: claude,
  brief: { text: "Review the fix and commit it." },
});

await dockerSandbox.close();

// Same workspace and branch, another sandbox.
const vercelSandbox = await workspace.sandbox({
  sandboxProvider: vercelProvider,
  agent: claude,
});

await vercelSandbox.dispatch({
  brief: { text: "Add a link check to the CI and commit it." },
});

await vercelSandbox.close();
```

```ts title="agents.ts"
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";

export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});

export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

```ts title="sandboxes.ts"
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { createVercelSandboxProvider } from "@elie-laloum/outpost/providers/vercel";

export const dockerProvider = createDockerSandboxProvider({
  image: "outpost:dev",
});

export const vercelProvider = createVercelSandboxProvider();
```

## The life of one run

A run puts these objects to work together. Each link shows who talks to whom, in the direction of the arrow.

<!-- canvas -->

- [Triggers](../webhooks/): `serveTriggers()` receives GitHub, GitLab and Slack webhooks; `runSchedules()` follows cron schedules.
  - CLI · HTTP
  - → **Workflow**: jobs
- [Workflow](../typed-workflows/): `defineWorkflow()` chains typed tasks and stops at gates.
  - workflow
  - → **Tasks**: runs
  - → **Checkpoints**: state and outputs
- [Tasks](../task-dependencies/): Each one hands a typed value to the tasks that depend on it.
  - workflow
  - **Host task**: `defineTask()`
    - → **Artifacts**: `publishArtifact()`
  - **Isolated task**: `defineIsolatedTask()`
    - → **Workspace**: `dispatch()`
  - **Agent task**: `defineAgentTask()`
    - → **Sandbox**: `sandbox.dispatch()`
  - **Gate**: `defineApprovalTask()`
    - → **Person**: decision needed
  - **Question**: `defineInteractiveAgentTask()`
    - → **Person**: question
    - → **Workspace**: each turn
- [Person](../approvals/): Your CLI or HTTP service calls `workflow.start()` again with the decision or answer.
  - CLI · HTTP
  - → **Gate**: decision
  - → **Question**: answer
- [Your code](../first-request/): `run.ts` starts a workflow, or an agent directly with `dispatch()`.
  - host
  - → **Workflow**: `workflow.start()`
  - → **Workspace**: `dispatch()`
- **Git repository**: Your local checkout and its base branch.
  - host
  - → **Workspace**: work branch
- [Workspace](../repository-and-branch/): Locks the branch and creates its worktree under `.outpost/workspaces`.
  - host
  - → **Sandbox**: worktree
  - → **Git repository**: `integrate`
- [Sandbox](../choose-a-sandbox/): Docker, Podman, Vercel, Daytona or Firecracker. Released whatever happens.
  - sandbox
  - → **Agents**: one call at a time
  - → **Workspace**: commits
- [Agents](../choose-an-agent/): Each one gets its credentials in a private home and runs its turns.
  - sandbox
  - **Codex**: fixes the links
  - **Claude Code**: reviews the fix
  - **Any other agent**: as many calls as needed
  - → **Model**: requests
  - → **Conversations**: transcript
  - → **Journals**: events
- [Model](../authentication/): The provider's API, with your account or an API key.
  - provider
  - → **Agents**: responses
- [Storage](../storage/): `.outpost/storage` by default, or any other `Transport`.
  - host
  - **Conversations**: to resume or fork
  - **Checkpoints**: to resume a workflow
  - **Artifacts**: outputs published by tasks
  - **Journals**: the course of each `dispatch()`

When a run fails, nothing that matters is lost:

<!-- cards -->

- **Sandbox released**: Closed whatever happens, so no container or cloud machine keeps running.
- **Workspace kept**: Its branch, directory and commits stay on disk.
- **History saved**: Checkpoints, artifacts, conversations and journals stay in [storage](../storage/).
- **Work restored**: To resume your run, you can [recover your work](../recovery/).

## Cold or warm

`dispatch()` starts from a fresh environment every time. `sandbox.dispatch()` runs in a sandbox that stays open, so files and installed dependencies carry over from one operation to the next.

<!-- tabs -->

```ts title="cold.mts"
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

const options = { agent: coder, sandboxProvider, repository };
await dispatch({ ...options, brief: { text: "Fix the failing date tests." } });
// A new sandbox: the first call's files and dependencies are gone.
await dispatch({ ...options, brief: { text: "Document the date helpers." } });
```

```ts title="warm.mts"
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.mts";

await using sandbox = await createSandbox({
  agent: coder,
  sandboxProvider,
  repository,
  branch: { mode: "integrate" },
});
await sandbox.dispatch({ brief: { text: "Fix the failing date tests." } });
// Same sandbox: the test run sees the agent's edits right away.
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
// You decide when the branch merges.
if (tests.status === 0) await sandbox.workspace.integrate();
```

<!-- compare -->

- `dispatch()`: Cold: a fresh environment for every call.
  - **Files and dependencies**: Discarded after the call
  - **Conversations**: `result.resume()` restores one in a new sandbox
  - **Integration**: Automatic, from the branch policy
  - **Use it for**: A one-shot task
- `sandbox.dispatch()`: Warm: one environment, open until `close()`.
  - **Files and dependencies**: Kept between operations
  - **Conversations**: A new one per call, unless you [resume](../conversations/) one
  - **Integration**: You call `sandbox.workspace.integrate()`
  - **Use it for**: Deterministic or more complex workflows

## Who closes what

Whoever opens a resource closes it.

| Opened with                           | Closed by                                                                              |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `dispatch()`                          | `dispatch()` itself, when the call ends, with its sandbox and workspace.               |
| `createSandbox()` without `workspace` | You, with `sandbox.close()`, which also closes its workspace.                          |
| `openWorkspace()`                     | You: each sandbox with `sandbox.close()`, then the workspace with `workspace.close()`. |

<!-- features -->

- **Safe to repeat**: `close()` can be called twice; it stops the running operation and waits for it to end.
- **Reverse order**: `await using` closes in the reverse order of opening: a sandbox before its workspace.
- **One operation at a time**: A second operation is rejected, not queued. To run work in parallel, open several sandboxes and coordinate them with [task dependencies](../task-dependencies/).

## What stays in `.outpost`

Outpost keeps its runtime state in the target repository and hides it from Git through `.git/info/exclude`.

<!-- files -->

- `.outpost/`
  - `workspaces/`: Worktrees of `named` and `integrate` branches, including retained ones.
  - `locks/`: Ownership of checkouts, branches and integration.
  - `storage/`: [Journals](../journals/) and resource activity by default, plus checkpoints, artifacts and caches whose store you point at it ([Where data lives](../storage/)).
  - `conversations/`: Built-in harness transcripts, Copilot and Kimi sessions.
  - `recovery/`: Transfers kept after a failed synchronization.

Claude Code and Codex keep their transcripts in their own store, inside your home directory. The `.outpost` directory can hold the only copy of unfinished work: inspect it with [Recover work](../recovery/) and prune it with [Retention and cleanup](../retention/), never by hand.
