---
title: "unavailableFault"
description: "unavailableFault — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { unavailableFault } from "@elie-laloum/outpost";
```

## Purpose and behavior

Return the outage signal of an Outpost error marked unavailable by a CLI adapter or model provider, following up to eight wrapped causes. Quota errors and every other value return undefined. Outages keep their process or provider code, so use this function rather than the code to recognize them; it does not wait or retry.

[Complete example and detailed rules](../../guide/recovery/).

## Parameters and properties

| Name    | Type      | Presence | Meaning                                        |
| ------- | --------- | -------- | ---------------------------------------------- |
| `error` | `unknown` | Required | Any caught value; wrapped causes are followed. |

## Returns

`UnavailableFault | undefined`

## Signature

```ts
export declare function unavailableFault(
  error: unknown,
): UnavailableFault | undefined;
```

## Related contracts

- [UnavailableFault](../type-unavailablefault/)
