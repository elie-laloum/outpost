---
title: "MixedAgentTaskOptions"
description: "MixedAgentTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MixedAgentTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                           | Presence | Meaning                                                                                       |
| ------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `sandbox`     | `FileSandbox \| Sandbox`                       | Required | Sandbox bound to this workspace; closing it leaves a borrowed workspace open.                 |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Required | Build the declared command or agent request from the current task context before acquisition. |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optional | Opt-in native conversation continuation after quota pause, without consuming a task retry.    |

## Signature

```ts
export interface MixedAgentTaskOptions<T> {
  readonly sandbox: Sandbox | FileSandbox;
  readonly request: (context: TaskContext) => DispatchOptions<T>;
  readonly quotaResume?: QuotaResumePolicy;
}
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [FileSandbox](../filesandbox/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
