---
title: "HarnessPermissions"
description: "HarnessPermissions — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the built-in harness engine introduced in 5.0.0. The contract may change in a later release.
:::

## Import

```ts
import type { HarnessPermissions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                                                             | Presence | Meaning                                                 |
| ---------- | ---------------------------------------------------------------- | -------- | ------------------------------------------------------- |
| `kind`     | `"permissions"`                                                  | Required | Definition discriminator: permissions.                  |
| `rules`    | `readonly HarnessPermissionRule[]`                               | Required | Frozen ordered rules.                                   |
| `default`  | `PermissionEffect`                                               | Required | Effect when no rule applies.                            |
| `evaluate` | `(tool: string, resources: ToolResources) => PermissionDecision` | Required | Decide whether a tool may run with the given resources. |

## Signature

```ts
export interface HarnessPermissions {
  readonly kind: "permissions";
  readonly rules: readonly HarnessPermissionRule[];
  readonly default: PermissionEffect;
  evaluate(tool: string, resources: ToolResources): PermissionDecision;
}
```

## Related contracts

- [HarnessPermissionRule](../harnesspermissionrule/)
- [PermissionDecision](../permissiondecision/)
- [PermissionEffect](../permissioneffect/)
- [ToolResources](../toolresources/)
