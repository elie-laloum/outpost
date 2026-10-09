---
title: "FileInteractiveAgentTaskOptions"
description: "FileInteractiveAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileInteractiveAgentTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                                                     | Presence | Meaning                                                                                                                                       |
| ----------------- | -------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `workspaceSource` | `FileWorkspaceSource`                                    | Required | Declared source for an owned resource; mutually exclusive with borrowing an open workspace.                                                   |
| `sandboxProvider` | `SandboxProvider`                                        | Required | Execution provider with the required file binding capability; legacy providers remain usable for Git.                                         |
| `agent`           | `Agent`                                                  | Required | Agent with portable conversation capture and resume; otherwise defineInteractiveAgentTask() throws with code configuration.                   |
| `key`             | `string`                                                 | Required | Stable workflow task key; also participates in the retained branch identity.                                                                  |
| `after`           | `readonly Task<unknown>[] \| undefined`                  | Optional | Dependencies that must finish successfully before the first turn.                                                                             |
| `timeoutMs`       | `number \| undefined`                                    | Optional | Cooperative deadline for each executing task attempt, excluding time waiting for a human answer.                                              |
| `brief`           | `string`                                                 | Required | Literal initial instructions; human replies are supplied separately on subsequent turns.                                                      |
| `actors`          | `readonly string[]`                                      | Required | Nonempty unique identifiers allowed to answer; the application must authenticate their users.                                                 |
| `maxTurns`        | `number \| undefined`                                    | Optional | Maximum completed agent turns, including the final result; defaults to 12. A question at the last turn fails instead of waiting indefinitely. |
| `hooks`           | `LifecycleHooks \| undefined`                            | Optional | Declared workspaceReady, hostReady and sandboxReady preparation commands.                                                                     |
| `recovery`        | `FileWorkspaceRecoveryAuthorization \| undefined`        | Optional | Explicit stopped-process recovery authorization; interrupted replay remains a separate workflow decision.                                     |
| `signal`          | `AbortSignal \| undefined`                               | Optional | Cancellation signal propagated to the operation and its process group; reusable sandboxes remain usable.                                      |
| `storageQuota`    | `Omit<StorageReservationOptions, "signal"> \| undefined` | Optional | Admission reservation through Transport; coordinates cooperating writers without enforcing a physical disk quota.                             |
| `inputs`          | `readonly WorkspaceInput[] \| undefined`                 | Optional | Explicit file inputs; JSON workflow parameters are never implicitly written to disk.                                                          |
| `runtime`         | `WorkspaceRuntimeOptions \| undefined`                   | Optional | Control directory and logical namespace, separate from the workspace files.                                                                   |
| `paths`           | `readonly string[] \| undefined`                         | Optional | Explicit relative path selection; copy selection does not implicitly apply .gitignore.                                                        |
| `retention`       | `WorkspaceRetention \| undefined`                        | Optional | run cleans successful owned work, local retains it, portable additionally requires an explicit Transport and namespace.                       |

## Signature

```ts
export interface FileInteractiveAgentTaskOptions
  extends
    Omit<
      InteractiveAgentTaskOptions,
      "repository" | "bootstrap" | "conversationHome" | "sandboxProvider"
    >,
    Omit<FileWorkspaceOptions, "source"> {
  readonly workspaceSource: FileWorkspaceSource;
  readonly sandboxProvider: SandboxProvider;
}
```

## Related contracts

- [FileWorkspaceOptions](../fileworkspaceoptions/)
- [FileWorkspaceSource](../fileworkspacesource/)
- [InteractiveAgentTaskOptions](../interactiveagenttaskoptions/)
- [SandboxProvider](../sandboxprovider/)
