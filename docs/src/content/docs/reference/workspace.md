---
title: "Workspace"
description: "Workspace — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Workspace } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                    | Type                                                                                                                                                                                                         | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dispatch`              | `<T = undefined>(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & DispatchOptions<T> & { readonly agent: DispatchAgent; }) => Promise<DispatchResult<T>>` | Required | Run a dispatch in a new sandbox on this workspace. On success it merges an integrate branch, then closes the sandbox and leaves the workspace open. Fails with code configuration while another sandbox holds the workspace or after close().                                                                                                                                                                                           |
| `sandbox`               | `(options?: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace">) => Promise<Sandbox>`                                                                                   | Required | Allocate a reusable sandbox on this workspace. Hooks passed to it replace the workspace's hostReady and sandboxReady; closing it leaves the workspace open and never merges. A second open sandbox fails with code configuration.                                                                                                                                                                                                       |
| `attach`                | `(options: Omit<SandboxOptions, Exclude<keyof WorkspaceOptions, "hooks" \| "label"> \| "workspace"> & AttachOptions & { readonly agent: Agent; }) => Promise<AttachResult>`                                  | Required | Open an interactive agent terminal in a new sandbox on this workspace. When the terminal exits with status 0 it merges an integrate branch; the sandbox closes and the workspace stays open.                                                                                                                                                                                                                                            |
| `close`                 | `(options?: { readonly preserve?: boolean; }) => Promise<Disposal>`                                                                                                                                          | Required | Release the lock and remove a clean managed worktree; an integrate branch is deleted once merged, a named branch is kept. After a diff guard refusal, with preserve: true, a detached HEAD or uncommitted, untracked or ignored files, the worktree stays and is returned as retainedDirectory. Fails with code configuration while a sandbox is open; later calls return the first result.                                             |
| `integrate`             | `{ (): Promise<void>; (options: IntegrationOptions): Promise<ConflictResolution \| void>; }`                                                                                                                 | Required | Merge the work branch only in integrate mode. Without onConflict, uses the existing direct host merge and returns no value. With onConflict, requires a closed sandbox, preflights frozen commits, invokes the strategy only for an actual Git conflict, checks final ancestry and guard, then integrates the exact verified commit. Returns ConflictResolution when the strategy ran; refusals retain source and resolution worktrees. |
| `[Symbol.asyncDispose]` | `() => Promise<void>`                                                                                                                                                                                        | Required | Close the workspace like close() without options, for await using.                                                                                                                                                                                                                                                                                                                                                                      |
| `repository`            | `string`                                                                                                                                                                                                     | Required | Real path of the host checkout's top-level directory.                                                                                                                                                                                                                                                                                                                                                                                   |
| `directory`             | `string`                                                                                                                                                                                                     | Required | Host directory the agent works in: the worktree under .outpost/workspaces, or the checkout itself in current mode.                                                                                                                                                                                                                                                                                                                      |
| `branch`                | `string`                                                                                                                                                                                                     | Required | Work branch name. In current mode, the checked-out branch, or HEAD when detached.                                                                                                                                                                                                                                                                                                                                                       |
| `baseBranch`            | `string`                                                                                                                                                                                                     | Required | Branch checked out in the host checkout when the workspace opened, and the target of integrate(). Empty when HEAD was detached.                                                                                                                                                                                                                                                                                                         |
| `baseline`              | `string`                                                                                                                                                                                                     | Required | Commit checked out in the workspace when it opened. Each dispatch lists commits from its own starting commit, not from this one.                                                                                                                                                                                                                                                                                                        |
| `gitDirectories`        | `readonly string[]`                                                                                                                                                                                          | Required | Host paths of the worktree's Git directory and the repository's common Git directory. Container providers mount them unless repositoryMode is isolated.                                                                                                                                                                                                                                                                                 |
| `policy`                | `BranchPolicy`                                                                                                                                                                                               | Required | Branch policy in effect, { mode: "current" } when none was given.                                                                                                                                                                                                                                                                                                                                                                       |

## Signature

```ts
export interface Workspace extends WorkspaceRecord {
  dispatch<T = undefined>(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      DispatchOptions<T> & {
        readonly agent: DispatchAgent;
      },
  ): Promise<DispatchResult<T>>;
  sandbox(
    options?: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    >,
  ): Promise<Sandbox>;
  attach(
    options: Omit<
      SandboxOptions,
      Exclude<keyof WorkspaceOptions, "hooks" | "label"> | "workspace"
    > &
      AttachOptions & {
        readonly agent: Agent;
      },
  ): Promise<AttachResult>;
  close(options?: { readonly preserve?: boolean }): Promise<Disposal>;
  integrate(): Promise<void>;
  integrate(options: IntegrationOptions): Promise<ConflictResolution | void>;
  [Symbol.asyncDispose](): Promise<void>;
}
```

## Related contracts

- [Agent](../type-agent/)
- [AttachOptions](../attachoptions/)
- [AttachResult](../attachresult/)
- [ConflictResolution](../conflictresolution/)
- [DispatchAgent](../dispatchagent/)
- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [Disposal](../disposal/)
- [IntegrationOptions](../integrationoptions/)
- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
- [WorkspaceOptions](../workspaceoptions/)
- [WorkspaceRecord](../workspacerecord/)
