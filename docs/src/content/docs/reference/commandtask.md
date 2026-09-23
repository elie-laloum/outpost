---
title: "commandTask"
description: "commandTask — Outpost API"
sidebar:
  order: 10
---

Public contract for **commandTask**. See the [workflows guide](../../workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import { commandTask } from "@elie-laloum/outpost";
```

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
