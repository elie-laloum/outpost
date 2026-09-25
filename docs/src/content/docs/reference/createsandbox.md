---
title: "createSandbox"
description: "createSandbox — Outpost API"
sidebar:
  order: 10
---

Public contract for **createSandbox**. See the [sandboxes guide](../../guide/environment/lifecycle/) for behavior, defaults and examples.

## Import

```ts
import { createSandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Acquire an execution environment and reuse it for sequential commands or agent jobs.

Docker is the default provider. Only one operation may own a sandbox at a time. Closing is idempotent; cancellation of one command does not itself destroy a warm sandbox.

[Complete example and detailed rules](../../guide/environment/lifecycle/).

## Parameters and properties

| Name                         | Type                                                     | Presence | Meaning                                                                                  |
| ---------------------------- | -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions \| undefined`                            | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.includeUncommitted` | `boolean \| undefined`                                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.agent`              | `AgentAdapter \| undefined`                              | Optional | Native coding-agent adapter.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                           | Optional | Execution environment backend.                                                           |
| `options.workspace`          | `Workspace \| undefined`                                 | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                          |
| `options.signal`             | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                             |
| `options.logging`            | `Logging \| undefined`                                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.bootstrap`          | `boolean \| undefined`                                   | Optional | Whether to install a missing selected agent automatically.                               |
| `options.conversationHome`   | `string \| undefined`                                    | Optional | Host home used for native transcript storage.                                            |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.repository`         | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                              | Optional | Git workspace policy or resulting branch identity, according to this contract.           |
| `options.copies`             | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                    |
| `options.limits`             | `StageLimits \| undefined`                               | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.label`              | `string \| undefined`                                    | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<Sandbox>`

## Signature

```ts
export declare function createSandbox(
  options?: SandboxOptions,
): Promise<Sandbox>;
```

## Related contracts

- [Sandbox](../sandbox/)
- [SandboxOptions](../sandboxoptions/)
