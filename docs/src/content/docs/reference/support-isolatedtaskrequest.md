---
title: "IsolatedTaskRequest"
description: "IsolatedTaskRequest — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name                 | Type                                                             | Presence | Meaning                                                                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `includeUncommitted` | `boolean \| undefined`                                           | Optional | Also send the managed worktree's uncommitted changes and untracked, non-ignored files to a remote sandbox. Host checkout edits reach it only through copies.                                           |
| `agent`              | `CliAgent \| CustomAgent \| ReplayAgent \| FallbackAgent`        | Optional | Default agent for dispatches on this sandbox: a single agent or a createFallbackAgent(). Only the first candidate is bootstrapped during allocation; attach() requires a single CLI agent.             |
| `sandboxProvider`    | `SandboxProvider \| undefined`                                   | Optional | Execution environment backend.                                                                                                                                                                         |
| `workspace`          | `Workspace \| undefined`                                         | Optional | Caller-owned Git workspace; excludes new repository/branch choices.                                                                                                                                    |
| `hooks`              | `LifecycleHooks \| undefined`                                    | Optional | Lifecycle commands: workspaceReady runs on the host once the worktree exists; hostReady (in order, on the host) and sandboxReady (in parallel, in the sandbox) run concurrently after allocation.      |
| `signal`             | `AbortSignal \| undefined`                                       | Optional | Cooperative cancellation for this operation.                                                                                                                                                           |
| `logging`            | `Logging \| undefined`                                           | Optional | Configure the dispatch journal transport, verbose event retention and replayable commit recording.                                                                                                     |
| `bootstrap`          | `boolean \| undefined`                                           | Optional | Whether to install a missing selected agent automatically.                                                                                                                                             |
| `conversationHome`   | `string \| undefined`                                            | Optional | Host home used for native transcript storage.                                                                                                                                                          |
| `recoveryTransport`  | `Transport \| undefined`                                         | Optional | Publish verified recovery archives before applying downloaded remote changes. Local synchronization staging remains; archives outlive sandbox closure.                                                 |
| `activityTransport`  | `Transport \| undefined`                                         | Optional | Store sandbox activity records in this transport. Remote ownership remains unverified; PID observations are not used to reclaim another machine’s state.                                               |
| `observation`        | `ObservationHub \| undefined`                                    | Optional | Optional caller-owned hub for workspace, allocation, transfer and cleanup operations; creating a workspace does not close the hub.                                                                     |
| `storageQuota`       | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional | Admission limits and requested reservation for storage under the repository’s .outpost directory.                                                                                                      |
| `repository`         | `string \| undefined`                                            | Optional | Target host Git checkout.                                                                                                                                                                              |
| `branch`             | `BranchPolicy \| undefined`                                      | Optional | Select the current checkout, a retained named work branch or a branch prepared for integration.                                                                                                        |
| `copies`             | `readonly string[] \| undefined`                                 | Optional | Repository-relative inputs copied into the workspace.                                                                                                                                                  |
| `limits`             | `StageLimits \| undefined`                                       | Optional | Timeouts for copying, Git preparation, commit collection and integration, in milliseconds.                                                                                                             |
| `label`              | `string \| undefined`                                            | Optional | Human-readable label used in execution reporting.                                                                                                                                                      |
| `brief`              | `Brief`                                                          | Required | Task given to the agent: literal text or a file brief.                                                                                                                                                 |
| `passes`             | `number \| undefined`                                            | Optional | Maximum passes, default 1. Each pass reruns the brief in a new conversation and the dispatch stops at the first pass whose text contains a completion marker. Must be 1 with response or continuation. |
| `until`              | `string \| readonly string[] \| undefined`                       | Optional | Completion marker or markers searched in the last turn's text, default &lt;outpost>done&lt;/outpost>. An empty list disables matching, so every pass runs; empty strings are rejected.                 |
| `idleMs`             | `number \| undefined`                                            | Optional | Longest silence allowed from the agent, default 600000 (10 minutes). Past it the turn stops with code timeout.                                                                                         |
| `idleWarningMs`      | `number \| undefined`                                            | Optional | Silence after which a warning event is emitted, then repeated at the same interval; default 60000.                                                                                                     |
| `settleMs`           | `number \| undefined`                                            | Optional | Wait after a completion marker before stopping an agent that is still running, default 60000. The turn still succeeds.                                                                                 |
| `deadlineMs`         | `number \| undefined`                                            | Optional | Maximum duration of each agent process, default 3600000 (one hour). Past it the turn fails with code timeout.                                                                                          |
| `expansionMs`        | `number \| undefined`                                            | Optional | Deadline for each shell expansion in a file brief, default 30000.                                                                                                                                      |
| `steering`           | `Steering \| undefined`                                          | Optional | Controller from createSteering(), attached for the whole dispatch and released when it ends. resume() and fork() do not reuse it.                                                                      |
| `continuation`       | `{ readonly id: string; readonly fork?: boolean; } \| undefined` | Optional | Native conversation to continue, by id; fork: true continues a copy and leaves the original unchanged. Requires one pass and an agent that supports resume.                                            |
| `response`           | `ResponseSpec<T> \| undefined`                                   | Optional | Typed response contract: the tagged answer is parsed and validated, and an invalid answer gets up to repairs correction turns. Requires one pass.                                                      |
| `telemetry`          | `DispatchTelemetry \| undefined`                                 | Optional | Instrumentation spanning the whole dispatch, including preparation, synchronization and cleanup. Its failures do not change the outcome.                                                               |
| `observe`            | `((event: AgentObservation) => void) \| undefined`               | Optional | Receives each normalized agent event with its pass number and timestamp. An exception thrown here is collected in observerErrors and does not change the outcome.                                      |
| `warn`               | `((message: string) => void) \| undefined`                       | Optional | Receives nonfatal warnings, such as an idle agent or a conversation storage problem.                                                                                                                   |
| `diagnostic`         | `((message: string) => void) \| undefined`                       | Optional | Receives diagnostic messages, such as the estimated token size of each expanded brief command.                                                                                                         |

## Signature

```ts
export type IsolatedTaskRequest<T> = SandboxOptions &
  DispatchOptions<T> & {
    readonly agent: DispatchAgent;
  };
```

## Related contracts

- [DispatchAgent](../dispatchagent/)
- [DispatchOptions](../dispatchoptions/)
- [SandboxOptions](../sandboxoptions/)
