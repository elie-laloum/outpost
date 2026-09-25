---
title: "recoveryDetails"
description: "recoveryDetails — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { recoveryDetails } from "@elie-laloum/outpost";
```

## Purpose and behavior

Extract recovery metadata from an unknown error when Outpost attached it. The result identifies retained work and recovery locations; absent metadata returns undefined and does not trigger cleanup or restoration.

[Complete example and detailed rules](../../guide/operations/recovery/).

## Parameters and properties

| Name    | Type      | Presence | Meaning                                                               |
| ------- | --------- | -------- | --------------------------------------------------------------------- |
| `error` | `unknown` | Required | Unknown thrown value from which to extract Outpost recovery metadata. |

## Returns

`Readonly<Record<string, unknown>> | undefined`

## Signature

```ts
export declare function recoveryDetails(
  error: unknown,
): Readonly<Record<string, unknown>> | undefined;
```
