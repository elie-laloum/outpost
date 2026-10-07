---
title: "RunError"
description: "RunError — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunError } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                  | Presence | Meaning                                                      |
| --------- | --------------------- | -------- | ------------------------------------------------------------ |
| `code`    | `string \| undefined` | Optional | Outpost fault code when the emitting execution provided one. |
| `message` | `string`              | Required | Observed error message after configured redaction.           |

## Signature

```ts
export interface RunError {
  readonly code?: string;
  readonly message: string;
}
```
