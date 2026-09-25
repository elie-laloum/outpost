---
title: "commandTask"
description: "commandTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **commandTask**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { commandTask } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name                | Type                                                                   | Presence | Meaning                                                                                  |
| ------------------- | ---------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`           | `Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions`     | Required | Configuration object. Its fields are described in the associated options contract below. |
| `options.after`     | `readonly Task<unknown>[] \| undefined`                                | Optional | Declared task dependencies whose values may be read.                                     |
| `options.key`       | `string`                                                               | Required | Stable task or cache key within its owning contract.                                     |
| `options.gate`      | `WorkflowGate \| undefined`                                            | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.condition` | `((context: TaskContext) => boolean \| Promise<boolean>) \| undefined` | Optional | Predicate evaluated before the first task attempt.                                       |
| `options.retry`     | `Retry \| undefined`                                                   | Optional | Explicit retry policy; repeated effects require care.                                    |
| `options.timeoutMs` | `number \| undefined`                                                  | Optional | Time limit in milliseconds for the owning operation.                                     |
| `options.sandbox`   | `Sandbox`                                                              | Required | See the linked contract and this family's rules for its interpretation.                  |
| `options.command`   | `Command \| ((context: TaskContext) => Command)`                       | Required | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`Task<CommandResult>`

## Signature

```ts
export declare function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Related contracts

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
