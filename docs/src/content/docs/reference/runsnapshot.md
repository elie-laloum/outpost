---
title: "RunSnapshot"
description: "RunSnapshot — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunSnapshot } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name             | Type                         | Presence | Meaning                                                                                                           |
| ---------------- | ---------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `version`        | `1`                          | Required | Stored projection schema version, currently 1.                                                                    |
| `id`             | `string`                     | Required | Application-selected lookup ID; independent of the workflow execution identity.                                   |
| `kind`           | `"workflow" \| "dispatch"`   | Required | One standalone dispatch or one workflow containing task dispatches.                                               |
| `executionId`    | `string \| undefined`        | Optional | Workflow execution identity learned from its start event and fenced across resumes.                               |
| `workflow`       | `string \| undefined`        | Optional | Declared workflow name from its lifecycle events.                                                                 |
| `status`         | `RunStatus`                  | Required | Observed lifecycle; an expired running heartbeat is returned as suspected abandoned.                              |
| `seq`            | `number`                     | Required | Last published persistent event cursor; watchRun starts strictly after it.                                        |
| `observationSeq` | `number`                     | Required | Last delivered hub sequence, reset with a fresh hub on settled workflow resume.                                   |
| `complete`       | `boolean`                    | Required | False for a detected hub sequence gap or heartbeat expiry. True does not prove that no trailing events were lost. |
| `startedAt`      | `string`                     | Required | Receiver creation time for the first projection, preserved on resume.                                             |
| `updatedAt`      | `string`                     | Required | Time of the latest published observation; heartbeat-only updates leave it unchanged.                              |
| `heartbeatAt`    | `string`                     | Required | Last successful heartbeat publication time, using the writer clock.                                               |
| `expiresAt`      | `string`                     | Required | Heartbeat expiry time; readers derive abandoned only for running snapshots.                                       |
| `tasks`          | `readonly RunTask[]`         | Required | Declared task states populated at workflow start and refreshed at finish or resume.                               |
| `dispatches`     | `readonly RunDispatch[]`     | Required | Observed dispatch history grouped by identity, task and attempt.                                                  |
| `commits`        | `readonly Commit[]`          | Required | Observed dispatch commits deduplicated by object ID.                                                              |
| `usage`          | `Usage`                      | Required | Authoritative cumulative workflow tokens or standalone dispatch tokens; nested reports are not added twice.       |
| `accounting`     | `WorkflowUsage \| undefined` | Optional | Workflow budget snapshot with cumulative attempts, tokens and optional monetary estimate.                         |
| `errors`         | `readonly RunError[]`        | Required | Observed task, workflow and classified dispatch failure messages.                                                 |

## Signature

```ts
export interface RunSnapshot {
  readonly version: 1;
  readonly id: string;
  readonly kind: "dispatch" | "workflow";
  readonly executionId?: string;
  readonly workflow?: string;
  readonly status: RunStatus;
  readonly seq: number;
  readonly observationSeq: number;
  readonly complete: boolean;
  readonly startedAt: string;
  readonly updatedAt: string;
  readonly heartbeatAt: string;
  readonly expiresAt: string;
  readonly tasks: readonly RunTask[];
  readonly dispatches: readonly RunDispatch[];
  readonly commits: readonly Commit[];
  readonly usage: Usage;
  readonly accounting?: WorkflowUsage;
  readonly errors: readonly RunError[];
}
```

## Related contracts

- [Commit](../commit/)
- [RunDispatch](../rundispatch/)
- [RunError](../runerror/)
- [RunStatus](../runstatus/)
- [RunTask](../runtask/)
- [Usage](../usage/)
- [WorkflowUsage](../workflowusage/)
