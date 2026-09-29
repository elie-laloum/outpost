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

Return { message } from details.unavailable of the first non-quota OutpostError that sets it, searching the error and up to seven wrapped causes, or undefined. Outages keep their process, provider or timeout code, so test with this function rather than the code. Fallback agents covering unavailable use the same test.

[Complete example and detailed rules](../../guide/fallback-agents/).

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
