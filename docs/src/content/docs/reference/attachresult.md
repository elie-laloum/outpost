---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name                | Type                  | Presence | Meaning                                                    |
| ------------------- | --------------------- | -------- | ---------------------------------------------------------- |
| `commits`           | `readonly Commit[]`   | Required | Collected Git commit identities and subjects.              |
| `branch`            | `string`              | Required | Name of the work branch used or observed during execution. |
| `directory`         | `string`              | Required | Host workspace directory used for this execution.          |
| `status`            | `number`              | Required | Process exit code; zero denotes success.                   |
| `stdout`            | `string`              | Required | Captured standard output.                                  |
| `stderr`            | `string`              | Required | Captured standard error.                                   |
| `retainedDirectory` | `string \| undefined` | Optional | Workspace retained for inspection or recovery.             |

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
