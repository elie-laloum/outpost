---
title: "quotaFault"
description: "quotaFault — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { quotaFault } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return the message and reset time of an OutpostError with code quota, following up to eight wrapped causes. Returns undefined for any other value. Use it in retry.accepts or error handling to separate usage and rate limits from other failures; it does not wait or retry.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name    | Type      | Presence | Meaning                                                                            |
| ------- | --------- | -------- | ---------------------------------------------------------------------------------- |
| `error` | `unknown` | Required | Any caught value, typically a rejection from dispatch, a task or a model provider. |

## Returns

`QuotaFault | undefined`

## Signature

```ts
export declare function quotaFault(error: unknown): QuotaFault | undefined;
```

## Related contracts

- [QuotaFault](../type-quotafault/)
