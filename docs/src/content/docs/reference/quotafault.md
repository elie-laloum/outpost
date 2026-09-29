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

Return the message, resetAt and conversation of the first OutpostError with code quota in the error and up to seven wrapped causes, or undefined. Fallback agents and onQuota pauses use the same test. It does not wait or retry.

[Complete example and detailed rules](../../guide/quota-pauses/).

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
