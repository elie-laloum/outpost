---
title: "HarnessPermissionsOptions"
description: "HarnessPermissionsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessPermissionsOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name      | Type                               | Presence | Meaning                                            |
| --------- | ---------------------------------- | -------- | -------------------------------------------------- |
| `rules`   | `readonly HarnessPermissionRule[]` | Required | Ordered rules; the first one that applies decides. |
| `default` | `PermissionEffect \| undefined`    | Optional | Effect when no rule applies; defaults to allow.    |

## Signature

```ts
export interface HarnessPermissionsOptions {
  readonly rules: readonly HarnessPermissionRule[];
  readonly default?: PermissionEffect;
}
```

## Related contracts

- [HarnessPermissionRule](../harnesspermissionrule/)
- [PermissionEffect](../permissioneffect/)
