---
title: "dispatch"
description: "dispatch — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { dispatch } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run an agent brief with a sandbox allocated for this call, collect turns, validated output, usage and commits, then close owned resources. Each cold pass receives a fresh environment. The result can resume or fork a captured conversation in a later environment.

[Complete example and detailed rules](../../guide/agents/dispatch/).

## Parameters and properties

| Name                         | Type                                                             | Presence | Meaning                                                                                                                                                  |
| ---------------------------- | ---------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                    | `SandboxOptions & DispatchOptions<T> & RequiredAgent`            | Required | Repository and sandbox setup combined with the agent brief, response validation and execution limits.                                                    |
| `options.includeUncommitted` | `boolean \| undefined`                                           | Optional | Include uncommitted host changes when preparing a remote repository snapshot.                                                                            |
| `options.agent`              | `AgentAdapter`                                                   | Optional | Native coding-agent adapter.                                                                                                                             |
| `options.provider`           | `SandboxProvider \| undefined`                                   | Optional | Execution environment backend.                                                                                                                           |
| `options.workspace`          | `Workspace \| undefined`                                         | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                      |
| `options.hooks`              | `LifecycleHooks \| undefined`                                    | Optional | Lifecycle commands in declared execution order.                                                                                                          |
| `options.signal`             | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                                                                                             |
| `options.logging`            | `Logging \| undefined`                                           | Optional | Configure the dispatch journal file and verbose event retention.                                                                                         |
| `options.bootstrap`          | `boolean \| undefined`                                           | Optional | Whether to install a missing selected agent automatically.                                                                                               |
| `options.conversationHome`   | `string \| undefined`                                            | Optional | Host home used for native transcript storage.                                                                                                            |
| `options.recoveryTransport`  | `Transport \| undefined`                                         | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.   |
| `options.activityTransport`  | `Transport \| undefined`                                         | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state. |
| `options.storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                        |
| `options.repository`         | `string \| undefined`                                            | Optional | Target host Git checkout.                                                                                                                                |
| `options.branch`             | `BranchPolicy \| undefined`                                      | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                          |
| `options.copies`             | `readonly string[] \| undefined`                                 | Optional | Repository-relative inputs copied into the workspace.                                                                                                    |
| `options.limits`             | `StageLimits \| undefined`                                       | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                               |
| `options.label`              | `string \| undefined`                                            | Optional | Human-readable label used in execution reporting.                                                                                                        |
| `options.brief`              | `Brief`                                                          | Required | Literal text or file-based task input.                                                                                                                   |
| `options.passes`             | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                                                                                                    |
| `options.until`              | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.                                                                                           |
| `options.idleMs`             | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                                                                                                 |
| `options.idleWarningMs`      | `number \| undefined`                                            | Optional | Silence interval in milliseconds before emitting an idle warning.                                                                                        |
| `options.settleMs`           | `number \| undefined`                                            | Optional | Grace period in milliseconds after completion detection before stopping a lingering agent process.                                                       |
| `options.deadlineMs`         | `number \| undefined`                                            | Optional | Maximum duration of each agent process in milliseconds; defaults to one hour.                                                                            |
| `options.expansionMs`        | `number \| undefined`                                            | Optional | Deadline in milliseconds for each original shell expansion in a file brief; defaults to 30000.                                                           |
| `options.continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it.                                                               |
| `options.response`           | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                                                                                                        |
| `options.observe`            | `((event: AgentObservation) => void) \| undefined`               | Optional | Receive normalized agent observations with pass number and timestamp; observer failures are isolated.                                                    |
| `options.warn`               | `((message: string) => void) \| undefined`                       | Optional | Callback receiving nonfatal execution or conversation-storage warnings.                                                                                  |
| `options.diagnostic`         | `((message: string) => void) \| undefined`                       | Optional | Callback receiving execution diagnostic messages.                                                                                                        |

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
