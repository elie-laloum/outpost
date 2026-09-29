---
title: "Sandbox"
description: "Sandbox — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Sandbox } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                         | Presence | Meaning                                                                                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `diagnose`              | `(options?: SandboxDiagnosticOptions) => Promise<SandboxDiagnosticReport>`                   | Required | Probe node, git and command execution in this sandbox, plus an agent CLI and file transfers when requested. Resolves with a report whose hasFailures flags failed checks; it never installs the agent.                                                       |
| `workspace`             | `Workspace`                                                                                  | Required | Workspace this sandbox runs in. close() also closes it only when createSandbox() opened it; close a supplied workspace after the sandbox.                                                                                                                    |
| `root`                  | `string`                                                                                     | Required | Repository path inside the sandbox; commands without a directory run there.                                                                                                                                                                                  |
| `dispatch`              | `<T = undefined>(options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>`             | Required | Run a brief in a new conversation on this sandbox and resolve with a warm result whose resume() and fork() stay here. The branch is not integrated and the sandbox stays open, also on failure, where the error's recovery names the branch and directory.   |
| `resume`                | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | Continue the native conversation with this id on this sandbox, restoring it first when it was captured elsewhere. The agent must support resume.                                                                                                             |
| `fork`                  | `<T = undefined>(id: string, options: DispatchOptions<T>) => Promise<WarmDispatchResult<T>>` | Required | Continue a copy of the native conversation with this id on this sandbox, leaving the original unchanged. The agent must support automated fork.                                                                                                              |
| `attach`                | `(options?: AttachOptions) => Promise<AttachResult>`                                         | Required | Start the agent's CLI in your terminal inside this sandbox, with an optional brief or continuation, and resolve when you quit with its status and commits. Requires a single CLI agent; the session is stopped after 86400000 (24 hours).                    |
| `command`               | `(command: Command) => Promise<CommandResult>`                                               | Required | Run one executable in this sandbox and resolve with its status and output, even when the status is nonzero; it rejects on its deadline, its signal or sandbox close. On a remote provider, the sandbox's changes are then pulled into the host worktree.     |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                          | Required | Abort the running operation, release the environment and, when createSandbox() opened the workspace, close it; resolves with retainedDirectory when the worktree is kept. preserve: true keeps the worktree; repeated calls return the first call's promise. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                        | Required | Call close() without options, so await using closes the sandbox when its block ends.                                                                                                                                                                         |

## Signature

```ts
export interface Sandbox {
  diagnose(
    options?: SandboxDiagnosticOptions,
  ): Promise<SandboxDiagnosticReport>;
  readonly workspace: Workspace;
  readonly root: string;
  dispatch<T = undefined>(
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  resume<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  fork<T = undefined>(
    id: string,
    options: DispatchOptions<T>,
  ): Promise<WarmDispatchResult<T>>;
  attach(options?: AttachOptions): Promise<AttachResult>;
  command(command: Command): Promise<CommandResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [Command](../command/)
- [CommandResult](../commandresult/)
- [DispatchOptions](../dispatchoptions/)
- [Disposal](../disposal/)
- [SandboxDiagnosticOptions](../sandboxdiagnosticoptions/)
- [SandboxDiagnosticReport](../sandboxdiagnosticreport/)
- [WarmDispatchResult](../warmdispatchresult/)
- [Workspace](../workspace/)
