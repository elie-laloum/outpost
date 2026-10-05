---
title: "How Outpost runs a task"
description: "Understand the agent, sandbox and workspace, and what happens when a task finishes."
---

## Three choices for each task

Your TypeScript code gives Outpost an agent, a sandbox provider and a repository. The agent receives your instructions; the provider starts its execution environment; Outpost prepares the Git checkout where the agent works.

| You choose       | What it controls                                  | Learn more                                                    |
| ---------------- | ------------------------------------------------- | ------------------------------------------------------------- |
| Agent            | The CLI or model loop that does the work          | [Choose an agent](../choose-an-agent/)                        |
| Sandbox provider | Where commands run, such as a Docker container    | [Choose a sandbox](../choose-a-sandbox/)                      |
| Branch           | Which checkout is edited and where commits remain | [Choose the repository and branch](../repository-and-branch/) |

You can change the agent without changing the sandbox provider. You can also run the same agent in another supported environment.

## One call to `dispatch()`

A call prepares the workspace, opens a sandbox, runs the agent and collects its answer, commits and usage. It then closes the resources it opened. With a named branch, the commits remain on that branch for review.

```ts
import { dispatch } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

const result = await dispatch({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-links" },
  brief: { text: "Fix the broken links in the README and commit the change." },
});
console.log(result.text);
console.log(result.branch, result.commits);
```

The configuration comes from [Installation](../setup/). Each call opens a fresh sandbox. Installed dependencies and temporary sandbox files do not carry over to the next call; retained Git work depends on the branch policy.

## Keep an environment for several operations

Use `createSandbox()` when you want an agent turn and a test command to share files and installed dependencies. The environment stays open until you close it.

```ts
import { createSandbox } from "@elie-laloum/outpost";
import { coder, repository, sandboxProvider } from "./outpost.config.ts";

await using sandbox = await createSandbox({
  repository,
  sandboxProvider,
  agent: coder,
  branch: { mode: "named", name: "outpost/fix-tests" },
});
await sandbox.dispatch({
  brief: { text: "Fix the failing tests and commit the change." },
});
const tests = await sandbox.command({ executable: "npm", arguments: ["test"] });
console.log(tests.status);
```

Here, `await using` closes the sandbox when the scope ends, including after an error. A sandbox accepts one operation at a time. Use separate sandboxes for parallel work; [Reuse a sandbox](../sandbox-sessions/) covers commands, terminals and explicit integration.

## Separate the workspace from the sandbox

The workspace owns the branch and checkout. The sandbox owns the execution environment. `openWorkspace()` lets you keep a workspace while replacing its sandbox, for example to run the next step in the cloud.

Close the current sandbox before opening another on the same workspace. When you open these resources yourself, close each sandbox first, then the workspace. Repeated `close()` calls are safe.

See [Choose the repository and branch](../repository-and-branch/) for workspace reuse and branch integration.

## Find the files after a run

Runtime files live under the target repository’s `.outpost` directory. Outpost excludes this directory from Git through `.git/info/exclude`.

| Directory        | Contains                                                                   |
| ---------------- | -------------------------------------------------------------------------- |
| `workspaces/`    | Managed worktrees, including work retained after a failure                 |
| `locks/`         | Workspace and branch ownership records                                     |
| `storage/`       | Default journals and resource activity; other stores when configured there |
| `conversations/` | Built-in harness transcripts, Copilot and Kimi sessions                    |
| `recovery/`      | Transfers preserved after a failed synchronization                         |

Claude Code and Codex use their own conversation stores in your home directory. The [storage guide](../storage/) explains which data can move to a transport and which files must remain local.

After a failure, inspect the retained work before cleaning it up. Cleanup can itself fail, and remote recovery depends on the data that was captured. Use [Recover work](../recovery/) to inspect available recovery files and [Clean up stored data](../retention/) to remove eligible data.
