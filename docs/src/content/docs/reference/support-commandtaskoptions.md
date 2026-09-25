---
title: "CommandTaskOptions"
description: "CommandTaskOptions — Outpost API"
sidebar:
  order: 10
---

## Parameters and properties

| Name      | Type                                             | Presence | Meaning                                                                       |
| --------- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------- |
| `sandbox` | `Sandbox`                                        | Required | Existing caller-owned sandbox reused by the task; the task does not close it. |
| `command` | `Command \| ((context: TaskContext) => Command)` | Required | Command to run, or factory that builds it from task dependency values.        |

## Signature

```ts
export type CommandTaskOptions = {
  sandbox: Sandbox;
  command: Command | ((context: TaskContext) => Command);
};
```

## Related contracts

- [Command](../command/)
- [Sandbox](../sandbox/)
- [TaskContext](../taskcontext/)
