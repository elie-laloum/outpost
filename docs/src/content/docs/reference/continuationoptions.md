---
title: "ContinuationOptions"
description: "ContinuationOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ContinuationOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                 | Type                                                             | Presence | Meaning                                                                                                                                                  |
| -------------------- | ---------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent`              | `AgentAdapter \| undefined`                                      | Optional | Native coding-agent adapter.                                                                                                                             |
| `logging`            | `Logging \| undefined`                                           | Optional | Configure the dispatch journal file and verbose event retention.                                                                                         |
| `label`              | `string \| undefined`                                            | Optional | Human-readable label used in execution reporting.                                                                                                        |
| `brief`              | `Brief`                                                          | Required | Literal text or file-based task input.                                                                                                                   |
| `passes`             | `number \| undefined`                                            | Optional | Maximum agent passes; one by default.                                                                                                                    |
| `until`              | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers; an empty list disables matching.                                                                                           |
| `idleMs`             | `number \| undefined`                                            | Optional | Maximum silent interval in milliseconds.                                                                                                                 |
| `idleWarningMs`      | `number \| undefined`                                            | Optional | Silence interval in milliseconds before emitting an idle warning.                                                                                        |
| `settleMs`           | `number \| undefined`                                            | Optional | Grace period in milliseconds after completion detection before stopping a lingering agent process.                                                       |
| `deadlineMs`         | `number \| undefined`                                            | Optional | Maximum duration of each agent process in milliseconds; defaults to one hour.                                                                            |
| `expansionMs`        | `number \| undefined`                                            | Optional | Deadline in milliseconds for each original shell expansion in a file brief; defaults to 30000.                                                           |
| `signal`             | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                                                                                             |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation ID to continue; fork requests a separate conversation derived from it.                                                               |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optional | Parser and validator for the tagged agent answer.                                                                                                        |
| `telemetry`          | `DispatchTelemetry \| undefined`                                 | Optional | Optional instrumentation of the complete dispatch, including preparation, synchronization and cleanup; telemetry failures do not change its outcome.     |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optional | Receive normalized agent observations with pass number and timestamp; observer failures are isolated.                                                    |
| `warn`               | `((message: string) => void) \| undefined`                       | Optional | Callback receiving nonfatal execution or conversation-storage warnings.                                                                                  |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optional | Callback receiving execution diagnostic messages.                                                                                                        |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                        |
| `repository`         | `string \| undefined`                                            | Optional | Target host Git checkout.                                                                                                                                |
| `branch`             | `BranchPolicy \| undefined`                                      | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                          |
| `copies`             | `readonly string[] \| undefined`                                 | Optional | Repository-relative inputs copied into the workspace.                                                                                                    |
| `limits`             | `StageLimits \| undefined`                                       | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                               |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optional | Lifecycle commands in declared execution order.                                                                                                          |
| `workspace`          | `Workspace \| undefined`                                         | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                      |
| `includeUncommitted` | `boolean \| undefined`                                           | Optional | Include uncommitted host changes when preparing a remote repository snapshot.                                                                            |
| `provider`           | `SandboxProvider \| undefined`                                   | Optional | Execution environment backend.                                                                                                                           |
| `bootstrap`          | `boolean \| undefined`                                           | Optional | Whether to install a missing selected agent automatically.                                                                                               |
| `conversationHome`   | `string \| undefined`                                            | Optional | Host home used for native transcript storage.                                                                                                            |
| `recoveryTransport`  | `Transport \| undefined`                                         | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.   |
| `activityTransport`  | `Transport \| undefined`                                         | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state. |

## Signature

```ts
export type ContinuationOptions<T = undefined> = DispatchOptions<T> &
  Omit<SandboxOptions, "agent">;
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
