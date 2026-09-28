---
title: "TaskCacheOptions"
description: "TaskCacheOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { TaskCacheOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                              | Presence | Meaning                                                                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `store`    | `TaskCacheStore`                                                  | Required | Caller-owned store that reads and writes cache entries, such as taskCacheStore over a Transport.                                                                                                                     |
| `version`  | `string`                                                          | Required | Non-empty version included in the fingerprint; change it when the task implementation, agent, prompt or output contract changes.                                                                                     |
| `key`      | `(context: TaskContext) => WorkflowJson \| Promise<WorkflowJson>` | Required | Return the lossless JSON inputs that determine the result, such as a repository fingerprint, brief and model. Runs before each execution with attempt 0 and may read declared dependencies; an error fails the task. |
| `maxAgeMs` | `number \| undefined`                                             | Optional | Positive age limit in milliseconds; an older entry is a miss and is replaced after the task succeeds.                                                                                                                |
| `mode`     | `TaskCacheMode \| undefined`                                      | Optional | reuse (default) reads the store first; refresh ignores existing entries, executes the task and replaces the entry.                                                                                                   |

## Signature

```ts
export interface TaskCacheOptions {
  readonly store: TaskCacheStore;
  /** Change when the task implementation, agent or output contract changes. */
  readonly version: string;
  readonly key: (context: TaskContext) => WorkflowJson | Promise<WorkflowJson>;
  readonly maxAgeMs?: number;
  readonly mode?: TaskCacheMode;
}
```

## Related contracts

- [TaskCacheMode](../taskcachemode/)
- [TaskCacheStore](../type-taskcachestore/)
- [TaskContext](../taskcontext/)
- [WorkflowJson](../workflowjson/)
