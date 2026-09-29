---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type     | Presence | Meaning                                                                                                                                                               |
| -------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `number` | Required | Exit code of the process, 0 for success. A nonzero code still resolves the command, so check it.                                                                      |
| `stdout` | `string` | Required | Last retain characters of standard output. Empty when an interactive command without terminal streams used the host terminal on the local, Docker or Podman provider. |
| `stderr` | `string` | Required | Last retain characters of standard error. Empty in the same host-terminal case, and for a Daytona terminal, whose output is all in stdout.                            |

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
