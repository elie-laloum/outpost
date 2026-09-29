---
title: "How Outpost works"
description: "The mental model behind Outpost: agent, sandbox provider and workspace, the lifecycle of one dispatch, who owns each resource and what stays on disk."
---

Outpost runs a coding agent against a Git checkout, inside an environment you choose, and hands your code the answer, the usage and the commits. This page explains the pieces involved and what happens between the call and the result. Read it once before the tutorials; the rest of the Guide builds on it.

## Three independent pieces

Every agent task combines three choices. Each answers a different question, and changing one never forces you to change the others.

- **Agent**: who does the work. `createAgent({ harness, model })` pairs a **harness**, the program that runs the agent loop, with an optional model. A harness is either a CLI preset such as `createCodexHarness()` or `createClaudeHarness()`, or Outpost’s [built-in harness](../harness/) driving a model provider directly. See [Choose an agent](../choose-an-agent/).
- **Sandbox provider**: where commands run. Docker, Podman, Firecracker, a cloud sandbox or the host itself. Omitting it uses Docker. See [Choose a sandbox](../choose-a-sandbox/).
- **Workspace**: which checkout the agent edits and where its commits land. `repository` selects the checkout and `branch` sets the branch policy: `current` (the checkout itself), `named` or `integrate` (a separate worktree). See [Repository and branch](../repository-and-branch/).

`dispatch()` takes all three with a **brief**, the instruction for the agent:

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

Swapping Codex for Claude Code changes only `coder`. Moving from Docker to a cloud sandbox changes only `sandboxProvider`. The brief, the branch policy and the code reading `result` stay the same.

## The life of one dispatch

A top-level `dispatch()` goes through these steps, in this order:

```text
host                sandbox
──────────────────  ──────────────────
1 check request
2 open workspace
                    3 allocate
4 ready hooks ───── 4 ready hooks
                    5 credentials
                    6 agent turns
7 changes back  ◀── (remote only)
8 integrate
9 close, clean up
```

1. **Check the request.** Outpost validates the options and the agent before allocating anything. When you continue a conversation, it also locates the saved transcript.
2. **Open the workspace.** Outpost takes a lock on the checkout or branch under `.outpost/locks`. For `named` and `integrate`, it creates a Git worktree under `.outpost/workspaces` on the work branch; `current` works in the checkout directly. It copies the `copies` inputs, then runs `workspaceReady` [hooks](../environment-setup/) on the host.
3. **Allocate the sandbox.** The provider starts the environment. Containers mount the worktree and its Git metadata. Remote providers receive the Git history and selected inputs instead, and install a supported CLI when the image lacks it.
4. **Run the ready hooks.** `hostReady` commands run on the host while `sandboxReady` commands run inside the sandbox. The first failure stops both.
5. **Prepare the agent.** For a CLI harness, Outpost copies the credential files it declares into the sandbox’s private agent home, applies CLI configuration such as [MCP servers](../mcp-servers/), and restores the conversation being continued.
6. **Run the agent.** Outpost records the current commit, renders the brief and runs the agent turn. Extra passes and [typed-response](../typed-responses/) repairs run as further turns. After each turn, it saves the conversation on the host when the agent supports capture.
7. **Bring changes back.** Remote providers download the new commits and files, validate them, back up the host state and apply them. Outpost then lists the commits made since step 6 in `result.commits`.
8. **Integrate.** With `integrate`, Outpost merges the work branch into the base branch, which must still be checked out on the host. `current` and `named` leave the commits where they are. Nothing is pushed.
9. **Close.** Outpost releases the sandbox and removes the worktree if it is clean. A `named` branch stays for review. The lock is released and `dispatch()` returns.

If a later step fails, Outpost still closes the sandbox but keeps the workspace, and the error carries what you need to recover: branch, directory, commits and transcript, read with [recoveryDetails()](../../reference/recoverydetails/). Remote transfers that could not be applied stay under `.outpost/recovery`. A dirty or detached worktree is also kept after a success and reported as `result.retainedDirectory`. See [Recover work](../recovery/).

## Cold and warm execution

A top-level `dispatch()` is **cold**: it allocates a sandbox, runs one task and closes everything. The next call starts from a fresh environment.

`createSandbox()` is **warm**: it keeps one environment open across `sandbox.dispatch()`, `sandbox.command()` and `sandbox.attach()`, until you call `sandbox.close()`. Installed dependencies, build outputs and edited files persist between operations. Integration is then under your control, as [Repository and branch](../repository-and-branch/) shows.

Files persist, conversations do not. Each `sandbox.dispatch()` starts a new conversation unless you resume one explicitly. See [Conversations](../conversations/) and [Sandbox sessions](../sandbox-sessions/).

## Who owns what

Whoever opens a resource closes it.

- `dispatch()` opens and closes its own workspace and sandbox.
- `createSandbox()` without `workspace` opens a workspace and owns it: `sandbox.close()` closes both.
- `openWorkspace()` gives you a workspace to lend to `createSandbox({ workspace })` or `workspace.sandbox()`. Close the sandbox first, then the workspace. A workspace serves one sandbox at a time.

`close()` is idempotent: calling it again returns the same result. It stops the running operation, waits for it to settle, then disposes what the object owns. `await using` works too. On `SIGINT` or `SIGTERM`, Outpost closes open sandboxes and keeps their worktrees.

A sandbox runs one operation at a time: a second `dispatch()` or `command()` started before the first settles is rejected. For parallel work, open one sandbox per task, each on its own `named` or `integrate` branch, since the `current` checkout accepts only one workspace at a time. [Task dependencies](../task-dependencies/) coordinate them.

## From tasks to workflows

A workflow is a graph of tasks built on top of the same calls. `defineAgentTask()` runs a request on a sandbox you provide, `defineIsolatedTask()` runs a cold dispatch with its own sandbox, and `defineTask()` runs plain application code. `defineWorkflow()` validates the graph; nothing runs until `start()`. A checkpoint store saves each successful task under a run ID, so a restarted run skips completed work. Start with [From a task to a workflow](../first-workflow/), then [Tasks and dependencies](../task-dependencies/) and [Durable runs](../durable-runs/).

## What Outpost keeps in `.outpost`

Outpost writes its runtime state in the target repository’s `.outpost` directory and adds these paths to the repository’s `.git/info/exclude`, so Git ignores them.

| Path                      | Contents                                                                                      |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| `.outpost/workspaces/`    | Worktrees of `named` and `integrate` workspaces, including retained ones.                     |
| `.outpost/locks/`         | Ownership locks for checkouts, branches and integration.                                      |
| `.outpost/storage/`       | Default local transport: [journals](../journals/), checkpoints, artifacts, resource activity. |
| `.outpost/conversations/` | Built-in harness transcripts and Copilot and Kimi session bundles.                            |
| `.outpost/recovery/`      | Remote transfers kept after a failed synchronization, and conversation staging.               |

Claude Code and Codex transcripts go to their CLI’s own store in your home directory, as [Conversations](../conversations/) explains.

This directory can hold the only copy of unfinished work. Do not delete it as routine cleanup: inspect it with [Recover work](../recovery/) and prune it with a policy from [Retention and cleanup](../retention/).

## Read the API names

A function’s name tells you when its work happens.

- `create*` builds an object that you keep and pass around: `createAgent()`, `createCodexHarness()`, `createDockerSandboxProvider()`, `createLocalTransport()`. Creating one starts no process. `createSandbox()` is the exception, because the object it returns is a running environment.
- `define*` declares something an engine runs later: `defineWorkflow()`, `defineAgentTask()`, `defineJsonResponse()`, `defineHarnessTool()`. Nothing runs when you define it.
- Verbs act immediately and return when the work is done: `dispatch()`, `openWorkspace()`, `attach()`, `speculate()`, `readJournal()`.

## Security boundaries

The agent runs project commands with the access you give it. Docker and Podman mount the checkout and its writable Git metadata, which is not a boundary against a hostile agent. The host provider has no isolation at all. Credentials are copied into a private agent home that disappears with the sandbox; the host provider receives variables only. Read [Security](../security/) before running agents on untrusted code.
