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

| Name                 | Type                                                     | Presence | Meaning                                                                                           |
| -------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `includeUncommitted` | `boolean \| undefined`                                   | Optional | Include uncommitted host changes when preparing a remote repository snapshot.                     |
| `agent`              | `AgentAdapter \| undefined`                              | Optional | Native coding-agent adapter.                                                                      |
| `provider`           | `SandboxProvider \| undefined`                           | Optional | Execution environment backend.                                                                    |
| `workspace`          | `Workspace \| undefined`                                 | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                               |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                                   |
| `signal`             | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                      |
| `logging`            | `Logging \| undefined`                                   | Optional | Configure the dispatch journal file and verbose event retention.                                  |
| `bootstrap`          | `boolean \| undefined`                                   | Optional | Whether to install a missing selected agent automatically.                                        |
| `conversationHome`   | `string \| undefined`                                    | Optional | Host home used for native transcript storage.                                                     |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory. |
| `repository`         | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                         |
| `branch`             | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.   |
| `copies`             | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                             |
| `limits`             | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.        |
| `label`              | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                 |

## Signature

```ts
export interface SandboxOptions extends WorkspaceOptions {
  readonly includeUncommitted?: boolean;
  readonly agent?: AgentAdapter;
  readonly provider?: SandboxProvider;
  readonly workspace?: Workspace;
  readonly hooks?: LifecycleHooks;
  readonly signal?: AbortSignal;
  readonly logging?: Logging;
  readonly bootstrap?: boolean;
  readonly conversationHome?: string;
}
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [LifecycleHooks](../lifecyclehooks/)
- [Logging](../logging/)
- [SandboxProvider](../sandboxprovider/)
- [Workspace](../workspace/)
- [WorkspaceOptions](../workspaceoptions/)
