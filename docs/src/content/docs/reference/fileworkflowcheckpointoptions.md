---
title: "FileWorkflowCheckpointOptions"
description: "FileWorkflowCheckpointOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileWorkflowCheckpointOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                     | Presence | Meaning                                                                                                                              |
| ------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `directory`   | `string \| undefined`    | Optional | Legacy checkpoint directory and local process locks, mutually exclusive with transporter; existing JSON layout is preserved.         |
| `transporter` | `Transport \| undefined` | Optional | Alternative to directory; uses the transport checkpoint envelope and explicit ownership recovery. Supply exactly one storage choice. |

## Signature

```ts
export interface FileWorkflowCheckpointOptions {
  /** Private directory for checkpoint data and local process ownership locks. */
  readonly directory?: string;
  readonly transporter?: Transport;
}
```

## Related contracts

- [Transport](../transport/)
