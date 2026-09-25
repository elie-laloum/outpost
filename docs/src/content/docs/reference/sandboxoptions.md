---
title: "SandboxOptions"
description: "SandboxOptions — Outpost API"
sidebar:
  order: 10
---

Public contract for **SandboxOptions**. See the [sandboxes guide](../../guide/environment/lifecycle/) for behavior, defaults and examples.

## Import

```ts
import type { SandboxOptions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Acquire an execution environment and reuse it for sequential commands or agent jobs.

Docker is the default provider. Only one operation may own a sandbox at a time. Closing is idempotent; cancellation of one command does not itself destroy a warm sandbox.

[Complete example and detailed rules](../../guide/environment/lifecycle/).

## Parameters and properties

| Name                 | Type                                                     | Presence | Meaning                                                                        |
| -------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `includeUncommitted` | `boolean \| undefined`                                   | Optional | See the linked contract and this family's rules for its interpretation.        |
| `agent`              | `AgentAdapter \| undefined`                              | Optional | Native coding-agent adapter.                                                   |
| `provider`           | `SandboxProvider \| undefined`                           | Optional | Execution environment backend.                                                 |
| `workspace`          | `Workspace \| undefined`                                 | Optional | Caller-owned Git workspace; excludes new repository/branch choices.            |
| `hooks`              | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                |
| `signal`             | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                   |
| `logging`            | `Logging \| undefined`                                   | Optional | See the linked contract and this family's rules for its interpretation.        |
| `bootstrap`          | `boolean \| undefined`                                   | Optional | Whether to install a missing selected agent automatically.                     |
| `conversationHome`   | `string \| undefined`                                    | Optional | Host home used for native transcript storage.                                  |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |
| `repository`         | `string \| undefined`                                    | Optional | Target host Git checkout.                                                      |
| `branch`             | `BranchPolicy \| undefined`                              | Optional | Git workspace policy or resulting branch identity, according to this contract. |
| `copies`             | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                          |
| `limits`             | `StageLimits \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.        |
| `label`              | `string \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation.        |

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
