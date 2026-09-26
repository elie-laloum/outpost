---
title: "defineHarnessPermissions"
description: "defineHarnessPermissions — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: part of the unreleased built-in harness engine. Streaming is not available yet; the contract may change before release.
:::

## Import

```ts
import { defineHarnessPermissions } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define ordered allow and deny rules over tool names, command patterns and repository paths. The engine evaluates them before before-tool hooks, and again after a hook rewrites the input; the first matching rule wins. Permissions are not a security boundary: the sandbox isolates.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name              | Type                               | Presence | Meaning                                                 |
| ----------------- | ---------------------------------- | -------- | ------------------------------------------------------- |
| `options`         | `HarnessPermissionsOptions`        | Required | Ordered rules and the default effect when none applies. |
| `options.rules`   | `readonly HarnessPermissionRule[]` | Required | Ordered rules; the first one that applies decides.      |
| `options.default` | `PermissionEffect \| undefined`    | Optional | Effect when no rule applies; defaults to allow.         |

## Returns

`HarnessPermissions`

## Signature

```ts
export declare function defineHarnessPermissions(
  options: HarnessPermissionsOptions,
): HarnessPermissions;
```

## Related contracts

- [HarnessPermissions](../harnesspermissions/)
- [HarnessPermissionsOptions](../harnesspermissionsoptions/)
