---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SandboxOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                                                     | Presence | Meaning                                                                                                                                                                                           |
| -------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `includeUncommitted` | `boolean \| undefined`                                   | Optional | Also send the managed worktree's uncommitted changes and untracked, non-ignored files to a remote sandbox. Host checkout edits reach it only through copies.                                      |
| `agent`              | `DispatchAgent \| undefined`                             | Optional | Default agent for dispatches on this sandbox: a single agent or a createFallbackAgent(). Only the first candidate is bootstrapped during allocation; attach() requires a single CLI agent.        |
| `sandboxProvider`    | `SandboxProvider \| undefined`                           | Optional | Execution environment backend.                                                                                                                                                                    |
| `workspace`          | `Workspace \| undefined`                                 | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                                                               |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands: workspaceReady runs on the host once the worktree exists; hostReady (in order, on the host) and sandboxReady (in parallel, in the sandbox) run concurrently after allocation. |
| `signal`             | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                                                                                                                      |
| `logging`            | `Logging \| undefined`                                   | Optional | Configure the dispatch journal transport, verbose event retention and replayable commit recording.                                                                                                |
| `bootstrap`          | `boolean \| undefined`                                   | Optional | Whether to install a missing selected agent automatically.                                                                                                                                        |
| `conversationHome`   | `string \| undefined`                                    | Optional | Host home used for native transcript storage.                                                                                                                                                     |
| `recoveryTransport`  | `Transport \| undefined`                                 | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.                                            |
| `activityTransport`  | `Transport \| undefined`                                 | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state.                                          |
| `observation`        | `ObservationHub \| undefined`                            | Optional | Optional caller-owned hub for workspace, allocation, transfer and cleanup operations; creating a workspace does not close the hub.                                                                |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                                                                 |
| `repository`         | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                                                                                                                         |
| `branch`             | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                                                                   |
| `copies`             | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                                                                                                                             |
| `limits`             | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                                                                        |
| `label`              | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                                                                                                                 |

## Signature

```ts
export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: DispatchAgent;
  readonly sandboxProvider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
  readonly recoveryTransport?: Transport;
  readonly activityTransport?: Transport;
}
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Transport](../transport/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
