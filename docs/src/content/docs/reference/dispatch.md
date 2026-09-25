---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 10
---

Public contract for **dispatch**. See the [dispatch guide](../../guide/agents/dispatch/) for behavior, defaults and examples.

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent task and collect text, typed output, commits, usage and native conversation information.

One pass is the default. Process or response failures reject. An exhausted pass budget can instead return completed: false. Cold dispatch closes owned resources; warm dispatch retains its sandbox.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name                         | Type                                                             | Presence | Meaning                                                                                  |
| ---------------------------- | ---------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & DispatchOptions<T> & RequiredAgent`            | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.includeUncommitted` | `boolean \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.agent`              | `AgentAdapter`                                                   | Optional | Native coding-agent adapter.                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                                   | Optional | Execution environment backend.                                                           |
| `options.workspace`          | `Workspace \| undefined`                                         | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                                    | Optional | Lifecycle commands in declared execution order.                                          |
| `options.signal`             | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                             |
| `options.logging`            | `Logging \| undefined`                                           | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.bootstrap`          | `boolean \| undefined`                                           | Optional | Whether to install a missing selected agent automatically.                               |
| `options.conversationHome`   | `string \| undefined`                                            | Optional | Host home used for native transcript storage.                                            |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.repository`         | `string \| undefined`                                            | Optional | Target host Git checkout.                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                                      | Optional | Git workspace policy or resulting branch identity, according to this contract.           |
| `options.copies`             | `readonly string[] \| undefined`                                 | Optional | Repository-relative inputs copied into the workspace.                                    |
| `options.limits`             | `StageLimits \| undefined`                                       | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.label`              | `string \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.brief`              | `Brief`                                                          | Required | Literal text or file-based task input.                                                   |
| `options.passes`             | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                                    |
| `options.until`              | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.                           |
| `options.idleMs`             | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                                 |
| `options.idleWarningMs`      | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.settleMs`           | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.deadlineMs`         | `number \| undefined`                                            | Optional | Hard operation deadline in milliseconds.                                                 |
| `options.expansionMs`        | `number \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.response`           | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                                        |
| `options.observe`            | `((event: AgentObservation) => void) \| undefined`               | Optional | Notification callback; observer failures are isolated.                                   |
| `options.warn`               | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.diagnostic`         | `((message: string) => void) \| undefined`                       | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Promise<DispatchResult<T>>`

## Signature

```ts
export declare function dispatch<T = undefined>(
  options: SandboxOptions & DispatchOptions<T> & RequiredAgent,
): Promise<DispatchResult<T>>;
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [DispatchResult](../dispatchresult/)
- [RequiredAgent](../support-requiredagent/)
- [SandboxOptions](../sandboxoptions/)
