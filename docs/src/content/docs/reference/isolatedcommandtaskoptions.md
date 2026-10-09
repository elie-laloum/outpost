---
title: "IsolatedCommandTaskOptions"
description: "IsolatedCommandTaskOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { IsolatedCommandTaskOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                                                                                          | Presence | Meaning                                                                                       |
| --------- | --------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| `request` | `(context: TaskContext) => FileIsolatedCommandRequest \| Promise<FileIsolatedCommandRequest>` | Required | Build the declared command or agent request from the current task context before acquisition. |

## Signature

```ts
export interface IsolatedCommandTaskOptions {
  readonly request: (
    context: TaskContext,
  ) => FileIsolatedCommandRequest | Promise<FileIsolatedCommandRequest>;
}
```

## Related contracts

- [FileIsolatedCommandRequest](../fileisolatedcommandrequest/)
- [TaskContext](../taskcontext/)
