---
title: "PermissionDecision"
description: "PermissionDecision — Outpost API"
sidebar:
  order: 10
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Skills and streaming are not available yet; the contract may change before release.
:::

## Import

```ts
import type { PermissionDecision } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name      | Type            | Presence          | Meaning                   |
| --------- | --------------- | ----------------- | ------------------------- |
| `allowed` | `true \| false` | Required          | Whether the call may run. |
| `reason`  | `string`        | Variant-dependent | Why the call was denied.  |

## Signature

```ts
export type PermissionDecision =
  | {
      readonly allowed: true;
    }
  | {
      readonly allowed: false;
      readonly reason: string;
    };
```
