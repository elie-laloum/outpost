---
title: "DecisionProvider"
description: "DecisionProvider — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionProvider } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                            | Presence | Meaning                                                                                                                   |
| ---------- | --------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`                                                        | Required | Nonempty provider name included in decision results and observations.                                                     |
| `identity` | `string \| undefined`                                           | Optional | Optional stable endpoint identity for diagnostics and application fingerprints.                                           |
| `request`  | `(request: DecisionRequest) => Promise<DecisionProviderResult>` | Required | Execute one evaluation with caller cancellation; return native answers and any available usage without automatic retries. |

## Signature

```ts
export interface DecisionProvider {
  readonly name: string;
  readonly identity?: string;
  request(request: DecisionRequest): Promise<DecisionProviderResult>;
}
```

## Related contracts

- [DecisionProviderResult](../decisionproviderresult/)
- [DecisionRequest](../decisionrequest/)
