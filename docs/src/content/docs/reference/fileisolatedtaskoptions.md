---
title: "FileIsolatedTaskOptions"
description: "FileIsolatedTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileIsolatedTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                                                                  | Presence | Meaning                                                                                       |
| ------------- | ------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `request`     | `(context: TaskContext) => FileDispatchRequest<T> \| Promise<FileDispatchRequest<T>>` | Required | Build the declared command or agent request from the current task context before acquisition. |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.    |

## Signature

```ts
export interface FileIsolatedTaskOptions<T> {
  readonly request: (
    context: TaskContext,
  ) => FileDispatchRequest<T> | Promise<FileDispatchRequest<T>>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Related contracts

- [FileDispatchRequest](../filedispatchrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
