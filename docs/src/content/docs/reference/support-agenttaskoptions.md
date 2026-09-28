---
title: "AgentTaskOptions"
description: "AgentTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name          | Type                                           | Presence | Meaning                                                                                                                                                                                                                                                                     |
| ------------- | ---------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sandbox`     | `Sandbox`                                      | Required | Existing caller-owned sandbox reused by the task; the task does not close it.                                                                                                                                                                                               |
| `request`     | `(context: TaskContext) => DispatchOptions<T>` | Required | Build dispatch options from task dependencies for the existing sandbox.                                                                                                                                                                                                     |
| `quotaResume` | `QuotaResumePolicy \| undefined`               | Optional | After a quota pause, continue the captured conversation with a resume instruction (continue, default) or send the original request again (restart). Continuation is skipped when the agent cannot resume, the request supplies its own continuation or uses several passes. |

## Signature

```ts
export type AgentTaskOptions<T> = {
  sandbox: Sandbox;
  request: (context: TaskContext) => DispatchOptions<T>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};
```

## Related contracts

- [DispatchOptions](../dispatchoptions/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
