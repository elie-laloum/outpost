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

| Name      | Type                   | Presence | Meaning                                                                                                                                        |
| --------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `key`     | `string`               | Required | Key of the candidate being validated.                                                                                                          |
| `result`  | `SpeculativeOutput<T>` | Required | Dispatch output of the candidate: text, value, commits and usage.                                                                              |
| `sandbox` | `Sandbox`              | Required | Candidate's sandbox, still open; it closes after validate returns. Commits made in it during validation become part of the candidate's commit. |
| `signal`  | `AbortSignal`          | Required | Aborts when another candidate wins, a token limit is reached or the race is cancelled; pass it to every command.                               |

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
