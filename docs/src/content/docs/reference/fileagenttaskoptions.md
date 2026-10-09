---
title: "FileAgentTaskOptions"
description: "FileAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileAgentTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                           | Presence | Meaning                                                                                       |
| ------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.    |
| `sandbox`     | `FileSandbox`                                  | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                 |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Required | Build the declared command or agent request from the current task context before acquisition. |

## Signature

```ts
export interface FileAgentTaskOptions<T> {
  readonly quotaResume?: QuotaResumePolicy;
  readonly sandbox: FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
}
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [FileSandbox](../filesandbox/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
