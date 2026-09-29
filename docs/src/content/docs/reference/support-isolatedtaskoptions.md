---
title: "IsolatedTaskOptions"
description: "IsolatedTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name          | Type                                                                                  | Presence | Meaning                                                                                                                                                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `request`     | `(context: TaskContext) => IsolatedTaskRequest<T> \| Promise<IsolatedTaskRequest<T>>` | Required | Build the repository, sandbox provider, agent and dispatch options for each attempt; may be async.                                                                                                                                                           |
| `quotaResume` | `QuotaResumePolicy \| undefined`                                                      | Optional | After a quota pause, continue the captured conversation in the new dispatch (continue, default) or start a new one (restart). Automatically integrated workspaces then start from the interrupted branch; uncommitted changes stay in its retained worktree. |

## Signature

```ts
export type IsolatedTaskOptions<T> = {
  request: (
    context: TaskContext,
  ) => IsolatedTaskRequest<T> | Promise<IsolatedTaskRequest<T>>;
  /** After a quota pause, continue the captured conversation or start a new one. */
  quotaResume?: QuotaResumePolicy;
};
```

## Related contracts

- [IsolatedTaskRequest](../support-isolatedtaskrequest/)
- [QuotaResumePolicy](../quotaresumepolicy/)
- [TaskContext](../taskcontext/)
