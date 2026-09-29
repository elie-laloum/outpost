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

Return the recovery record Outpost attached to a thrown value: where work survived, such as branch, directory, commits, transcript, logReference or conversation. Works on any thrown object, including a plain Error or an abort reason. Returns an empty object for an OutpostError without a record and undefined for any other value without one.

[Complete example and detailed rules](../../guide/error-handling/).

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
