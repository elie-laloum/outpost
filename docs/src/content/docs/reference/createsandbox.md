---
title: "createSandbox"
description: "createSandbox — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createSandbox } from "@elie-laloum/outpost";
```

## Purpose and behavior

Allocate an environment around a new or caller-owned workspace. The returned sandbox supports sequential commands and agent turns on the same lease; the caller must close it. A supplied workspace keeps its independent lifetime.

[Complete example and detailed rules](../../guide/environment/lifecycle/).

## Parameters and properties

| Name                         | Type                                                     | Presence | Meaning                                                                                                                                                  |
| ---------------------------- | -------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions \| undefined`                            | Optional | Workspace ownership, provider allocation, default agent and lifecycle setup.                                                                             |
| `options.includeUncommitted` | `boolean \| undefined`                                   | Optional | Include uncommitted host changes when preparing a remote repository snapshot.                                                                            |
| `options.agent`              | `Agent \| undefined`                                     | Optional | Native coding-agent adapter.                                                                                                                             |
| `options.sandboxProvider`    | `SandboxProvider \| undefined`                           | Optional | Execution environment backend.                                                                                                                           |
| `options.workspace`          | `Workspace \| undefined`                                 | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                            | Optional | Lifecycle commands in declared execution order.                                                                                                          |
| `options.signal`             | `AbortSignal \| undefined`                               | Optional | Cooperative cancellation for this operation.                                                                                                             |
| `options.logging`            | `Logging \| undefined`                                   | Optional | Configure the dispatch journal file and verbose event retention.                                                                                         |
| `options.bootstrap`          | `boolean \| undefined`                                   | Optional | Whether to install a missing selected agent automatically.                                                                                               |
| `options.conversationHome`   | `string \| undefined`                                    | Optional | Host home used for native transcript storage.                                                                                                            |
| `options.recoveryTransport`  | `Transport \| undefined`                                 | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.   |
| `options.activityTransport`  | `Transport \| undefined`                                 | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state. |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                        |
| `options.repository`         | `string \| undefined`                                    | Optional | Target host Git checkout.                                                                                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                              | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                          |
| `options.copies`             | `readonly string[] \| undefined`                         | Optional | Repository-relative inputs copied into the workspace.                                                                                                    |
| `options.limits`             | `StageLimits \| undefined`                               | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                               |
| `options.label`              | `string \| undefined`                                    | Optional | Human-readable label used in execution reporting.                                                                                                        |

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
