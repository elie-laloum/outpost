---
title: "HarnessPermissionRule"
description: "HarnessPermissionRule — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import type { HarnessPermissionRule } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                             | Presence | Meaning                                                                                                                                                                                         |
| ---------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effect`   | `PermissionEffect`               | Required | allow or deny when the rule applies.                                                                                                                                                            |
| `tools`    | `readonly string[] \| undefined` | Optional | Tool name patterns; * matches any characters. Omit to apply to every tool.                                                                                                                      |
| `paths`    | `readonly string[] \| undefined` | Optional | Repository path globs (**, * and ?) matched against paths declared by tool resources. An allow rule needs every path to match; a deny rule needs one. Paths outside the repository never match. |
| `commands` | `readonly string[] \| undefined` | Optional | Command patterns where * matches any characters, compared with the command declared by tool resources. Shell metacharacters can bypass such patterns.                                           |
| `reason`   | `string \| undefined`            | Optional | Explanation returned to the model when a deny rule applies.                                                                                                                                     |

## Signature

```ts
export interface HarnessPermissionRule {
  readonly effect: PermissionEffect;
  readonly tools?: readonly string[];
  readonly paths?: readonly string[];
  readonly commands?: readonly string[];
  readonly reason?: string;
}
```

## Related contracts

- [PermissionEffect](../permissioneffect/)
