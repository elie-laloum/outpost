---
title: "HarnessPermissionRule"
description: "HarnessPermissionRule — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessPermissionRule } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                             | Presence | Meaning                                                                                                                                                                                                                                       |
| ---------- | -------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effect`   | `PermissionEffect`               | Required | allow or deny when the rule applies.                                                                                                                                                                                                          |
| `tools`    | `readonly string[] \| undefined` | Optional | Tool name patterns; * matches any characters. Omit to apply to every tool.                                                                                                                                                                    |
| `paths`    | `readonly string[] \| undefined` | Optional | Repository path globs (**, * and ?) matched against the paths a call declares. An allow rule applies when every path matches, a deny rule when one does; a call that declares no paths never matches, nor does a path outside the repository. |
| `commands` | `readonly string[] \| undefined` | Optional | Command patterns where * matches any characters, compared with the command a call declares; a call without a declared command never matches. Shell metacharacters can evade these patterns.                                                   |
| `reason`   | `string \| undefined`            | Optional | Explanation returned to the model when this deny rule applies, default Denied by permission rule &lt;n>.                                                                                                                                      |

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
