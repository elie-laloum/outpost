---
title: "defineInteractiveAgentTask"
description: "defineInteractiveAgentTask — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineInteractiveAgentTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Declare an agent dialogue that asks humans questions between turns. Each turn runs in a new sandbox on a retained named branch and continues the captured conversation; a question leaves the task waiting-input until start() receives an answer. Requires a checkpointed run and throws with code configuration for an agent without portable capture and resume.

[Complete example and detailed rules](../../guide/interactive-tasks/).

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name                       | Type                                                             | Presence          | Meaning                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `InteractiveAgentTaskOptions \| FileInteractiveAgentTaskOptions` | Required          | Agent, repository, authorized respondents and bounded dialogue settings.                                                                      |
| `options.key`              | `string`                                                         | Required          | Stable workflow task key; also participates in the retained branch identity.                                                                  |
| `options.after`            | `readonly Task<unknown>[] \| undefined`                          | Optional          | Dependencies that must finish successfully before the first turn.                                                                             |
| `options.repository`       | `string`                                                         | Required          | Host Git checkout containing the retained worktree and default conversation storage; must remain accessible on resume.                        |
| `options.agent`            | `Agent`                                                          | Required          | Agent with portable conversation capture and resume; otherwise defineInteractiveAgentTask() throws with code configuration.                   |
| `options.brief`            | `string`                                                         | Required          | Literal initial instructions; human replies are supplied separately on subsequent turns.                                                      |
| `options.actors`           | `readonly string[]`                                              | Required          | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                 |
| `options.sandboxProvider`  | `SandboxProvider \| undefined \| SandboxProvider`                | Variant-dependent | Provider that allocates a new sandbox for each turn, default createDockerSandboxProvider().                                                   |
| `options.bootstrap`        | `boolean \| undefined`                                           | Optional          | Whether each turn's sandbox may install a missing CLI agent, default true.                                                                    |
| `options.conversationHome` | `string \| undefined`                                            | Optional          | Host home used to locate captured native conversations across turns.                                                                          |
| `options.maxTurns`         | `number \| undefined`                                            | Optional          | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely. |
| `options.timeoutMs`        | `number \| undefined`                                            | Optional          | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                              |
| `options.workspaceSource`  | `FileWorkspaceSource`                                            | Required          | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                   |
| `options.hooks`            | `LifecycleHooks \| undefined`                                    | Optional          | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                                                     |
| `options.recovery`         | `FileWorkspaceRecoveryAuthorization \| undefined`                | Optional          | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.                                     |
| `options.signal`           | `AbortSignal \| undefined`                                       | Optional          | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.                                      |
| `options.storageQuota`     | `Omit<StorageReservationOptions, "signal"> \| undefined`         | Optional          | Admission reservation through Transport; coordinates cooperating writers without enforcing a physical disk quota.                             |
| `options.inputs`           | `readonly WorkspaceInput[] \| undefined`                         | Optional          | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                                          |
| `options.runtime`          | `WorkspaceRuntimeOptions \| undefined`                           | Optional          | Control directory and logical namespace, separate from the workspace files.                                                                   |
| `options.paths`            | `readonly string[] \| undefined`                                 | Optional          | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                                        |
| `options.retention`        | `WorkspaceRetention \| undefined`                                | Optional          | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace.                       |

## Returns

`Task<InteractiveAgentResult>` · `Task<FileInteractiveAgentResult>`

## Signature

```ts
export declare function defineInteractiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult>;
```

## Related contracts

- [FileInteractiveAgentResult](../fileinteractiveagentresult/)
- [FileInteractiveAgentTaskOptions](../fileinteractiveagenttaskoptions/)
- [InteractiveAgentResult](../interactiveagentresult/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [Task](../type-task/)
