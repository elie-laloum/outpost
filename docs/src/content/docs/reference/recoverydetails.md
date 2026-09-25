---
title: "recoveryDetails"
description: "recoveryDetails — Outpost API"
sidebar:
  order: 10
---

Public contract for **recoveryDetails**. See the [errors guide](../../guide/operations/recovery/) for behavior, defaults and examples.

## Import

```ts
import { recoveryDetails } from "@elie-laloum/outpost";
```

## Purpose and behavior

Identify failure codes and available recovery paths before retrying or cleaning up.

A failed agent throws; a raw command can return a nonzero status. Preserve original errors and recovery artifacts when reporting or retrying.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name    | Type      | Presence | Meaning                                                                 |
| ------- | --------- | -------- | ----------------------------------------------------------------------- |
| `error` | `unknown` | Required | See the linked contract and this family's rules for its interpretation. |

## Returns

`Readonly<Record<string, unknown>> | undefined`

## Signature

```ts
export declare function recoveryDetails(
  error: unknown,
): Readonly<Record<string, unknown>> | undefined;
```
