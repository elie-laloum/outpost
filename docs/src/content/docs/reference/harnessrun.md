---
title: "HarnessRun"
description: "HarnessRun — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { HarnessRun } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type             | Presence | Meaning                                                                                        |
| --------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `input`   | `HarnessInput`   | Required | Prepared prompt supplied to one custom execution pass.                                         |
| `context` | `HarnessContext` | Required | Operation-scoped model access, sandbox, cancellation signal and isolated observation callback. |

## Returns

`Promise<ModelResult>`

## Signature

```ts
export type HarnessRun = (
  input: HarnessInput,
  context: HarnessContext,
) => Promise<ModelResult>;
```

## Related contracts

- [HarnessContext](../harnesscontext/)
- [HarnessInput](../harnessinput/)
- [ModelResult](../modelresult/)
