---
title: "SpeculativeValidation"
description: "SpeculativeValidation — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Part of the experimental speculation API: this contract can still change. See [Competing candidates](../../guide/speculation/).
:::

## Import

```ts
import type { SpeculativeValidation } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                   | Presence | Meaning                                                                                                                                                       |
| --------- | ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`               | Required | Key of the candidate being validated or scored.                                                                                                               |
| `result`  | `SpeculativeOutput<T>` | Required | Dispatch output of the candidate: text, value, commits and usage.                                                                                             |
| `sandbox` | `Sandbox`              | Required | Candidate sandbox, still open during validate and score; it closes after both callbacks. Commits made in either callback become part of the candidate commit. |
| `signal`  | `AbortSignal`          | Required | Aborts when another candidate wins in first mode, a token limit is reached or the race is cancelled; pass it to every command in validate and score.          |

## Signature

```ts
export interface SpeculativeValidation<T> {
  readonly key: string;
  readonly result: SpeculativeOutput<T>;
  readonly sandbox: Sandbox;
  readonly signal: AbortSignal;
}
```

## Related contracts

- [Sandbox](../sandbox/)
- [SpeculativeOutput](../speculativeoutput/)
