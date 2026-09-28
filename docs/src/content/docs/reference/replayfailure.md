---
title: "ReplayFailure"
description: "ReplayFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayFailure } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type        | Presence | Meaning                                                      |
| --------- | ----------- | -------- | ------------------------------------------------------------ |
| `code`    | `FaultCode` | Required | Recorded error code; unknown codes become process.           |
| `message` | `string`    | Required | Recorded error message, rethrown after the turn is replayed. |

## Signature

```ts
export interface ReplayFailure {
  readonly code: FaultCode;
  readonly message: string;
}
```

## Related contracts

- [FaultCode](../faultcode/)
