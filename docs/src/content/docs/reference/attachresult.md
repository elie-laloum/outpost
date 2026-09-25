---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 10
---

Public contract for **AttachResult**. See the [commands and terminal guide](../../guide/environment/commands/) for behavior, defaults and examples.

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Purpose and behavior

Run a process or attach a native interactive agent session with explicit stream ownership.

Command returns nonzero exit statuses; callers must check them. Attach requires a supported interactive provider. Vercel rejects attachment.

[Complete example and detailed rules](../../guide/environment/commands/).

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                                        |
| ------------------- | --------------------- | -------- | ------------------------------------------------------------------------------ |
| `commits`           | `readonly Commit[]`   | Required | Collected Git commit identities and subjects.                                  |
| `branch`            | `string`              | Required | Git workspace policy or resulting branch identity, according to this contract. |
| `directory`         | `string`              | Required | Filesystem directory used by the owning operation; see path rules.             |
| `status`            | `number`              | Required | Recorded process or lifecycle outcome; inspect its declared type.              |
| `stdout`            | `string`              | Required | Captured standard output.                                                      |
| `stderr`            | `string`              | Required | Captured standard error.                                                       |
| `retainedDirectory` | `string \| undefined` | Optional | Workspace retained for inspection or recovery.                                 |

## Signature

```ts
export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}
```

## Related contracts

- [CommandResult](../commandresult/)
- [Commit](../commit/)
- [Disposal](../disposal/)
