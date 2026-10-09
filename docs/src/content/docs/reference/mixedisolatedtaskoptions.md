---
title: "MixedIsolatedTaskOptions"
description: "MixedIsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MixedIsolatedTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                                                                      | Presence | Meaning                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| FileDispatchRequest<T> \| Promise<IsolatedTaskRequest<T> \| FileDispatchRequest<T>>` | Required | Build the declared command or agent request from the current task context before acquisition. |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                                                                          | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.    |

## Signature

```ts
export interface MixedIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) =>
    | IsolatedTaskRequest<T>
    | FileDispatchRequest<T>
    | Promise<IsolatedTaskRequest<T> | FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Related contracts

- [FileDispatchRequest](../filedispatchrequest/)
- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
