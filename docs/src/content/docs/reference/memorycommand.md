---
title: "MemoryCommand"
description: "MemoryCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { MemoryCommand } from "@elie-laloum/outpost/testing";
```

## Parameters and properties

| Name         | Type                             | Presence | Meaning                                                                                                                |
| ------------ | -------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `executable` | `string`                         | Required | Executable name expected for the next non-agent command. It is compared literally and never launched.                  |
| `arguments`  | `readonly string[] \| undefined` | Optional | Exact ordered arguments expected for this command; defaults to an empty array.                                         |
| `status`     | `number \| undefined`            | Optional | Simulated command exit status; defaults to 0. A nonzero value fails defineCommandTask through its normal retry policy. |
| `stdout`     | `string \| undefined`            | Optional | Simulated standard output delivered to command observation and returned in CommandResult; defaults to empty.           |
| `stderr`     | `string \| undefined`            | Optional | Simulated standard error delivered to command observation and returned in CommandResult; defaults to empty.            |

## Signature

```ts
export interface MemoryCommand extends Partial<CommandResult> {
  readonly executable: string;
  readonly arguments?: readonly string[];
}
```

## Related contracts

- [CommandResult](../commandresult/)
