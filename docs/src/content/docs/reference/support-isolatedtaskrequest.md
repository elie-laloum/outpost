---
title: "IsolatedTaskRequest"
description: "IsolatedTaskRequest — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                 | Type                                                             | Presence | Meaning                                                                        |
| -------------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| `includeUncommitted` | `boolean \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation.        |
| `agent`              | `AgentAdapter`                                                   | Optional | Native coding-agent adapter.                                                   |
| `provider`           | `SandboxProvider \| undefined`                                   | Optional | Execution environment backend.                                                 |
| `workspace`          | `Workspace \| undefined`                                         | Optional | Caller-owned Git workspace; excludes new repository/branch choices.            |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optional | Lifecycle commands in declared execution order.                                |
| `signal`             | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                   |
| `logging`            | `Logging \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation.        |
| `bootstrap`          | `boolean \| undefined`                                           | Optional | Whether to install a missing selected agent automatically.                     |
| `conversationHome`   | `string \| undefined`                                            | Optional | Host home used for native transcript storage.                                  |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional | See the linked contract and this family's rules for its interpretation.        |
| `repository`         | `string \| undefined`                                            | Optional | Target host Git checkout.                                                      |
| `branch`             | `BranchPolicy \| undefined`                                      | Optional | Git workspace policy or resulting branch identity, according to this contract. |
| `copies`             | `readonly string[] \| undefined`                                 | Optional | Repository-relative inputs copied into the workspace.                          |
| `limits`             | `StageLimits \| undefined`                                       | Optional | See the linked contract and this family's rules for its interpretation.        |
| `label`              | `string \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.        |
| `brief`              | `Brief`                                                          | Required | Literal text or file-based task input.                                         |
| `passes`             | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                          |
| `until`              | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.                 |
| `idleMs`             | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                       |
| `idleWarningMs`      | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.        |
| `settleMs`           | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.        |
| `deadlineMs`         | `number \| undefined`                                            | Optional | Hard operation deadline in milliseconds.                                       |
| `expansionMs`        | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.        |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.        |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                              |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optional | Notification callback; observer failures are isolated.                         |
| `warn`               | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation.        |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation.        |

## Signature

```ts
export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & {
    readonly agent: AgentAdapter;
  };
```

## Related contracts

- [AgentAdapter](../agentadapter/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
