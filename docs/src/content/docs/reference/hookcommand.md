---
title: "HookCommand"
description: "HookCommand — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HookCommand } from "@elie-laloum/outpost/core";
```

## Parameters and properties

| Name         | Type                                            | Presence | Meaning                                                                  |
| ------------ | ----------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| `executable` | `string`                                        | Required | Program to execute inside the sandbox, without implicit shell expansion. |
| `arguments`  | `readonly string[] \| undefined`                | Optional | Literal program arguments.                                               |
| `directory`  | `string \| undefined`                           | Optional | Working directory in the sandbox; defaults to the invoking context.      |
| `variables`  | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment variables for the hook command.                     |

## Signature

```ts
export interface HookCommand {
  readonly executable: string;
  readonly arguments?: readonly string[];
  readonly directory?: string;
  readonly variables?: Variables;
}
```

## Related contracts

- [Variables](../variables/)
