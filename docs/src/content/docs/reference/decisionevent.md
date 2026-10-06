---
title: "DecisionEvent"
description: "DecisionEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { DecisionEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name         | Type                                  | Presence | Meaning                                                                                   |
| ------------ | ------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `kind`       | `"decision"`                          | Required | Decision lifecycle discriminator decision.                                                |
| `status`     | `"started" \| "finished" \| "failed"` | Required | Started before the request, finished after validation, or failed when evaluation rejects. |
| `provider`   | `string`                              | Required | Decision provider name; no credentials are included.                                      |
| `model`      | `string`                              | Required | Requested model on start/failure and actual response model on success.                    |
| `durationMs` | `number \| undefined`                 | Optional | Elapsed evaluation time in milliseconds on completion or failure.                         |
| `usage`      | `Usage \| undefined`                  | Optional | Validated normalized usage receipt when available.                                        |
| `truncated`  | `boolean \| undefined`                | Optional | Input truncation flag when the provider reports one.                                      |
| `code`       | `string \| undefined`                 | Optional | Outpost fault code on a failed evaluation, when the error has one.                        |

## Signature

```ts
export interface DecisionEvent {
  readonly kind: "decision";
  readonly status: "started" | "finished" | "failed";
  readonly provider: string;
  readonly model: string;
  readonly durationMs?: number;
  readonly usage?: Usage;
  readonly truncated?: boolean;
  readonly code?: string;
}
```

## Related contracts

- [Usage](../usage/)
