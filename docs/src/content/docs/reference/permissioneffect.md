---
title: "PermissionEffect"
description: "PermissionEffect — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { PermissionEffect } from "@elie-laloum/outpost";
```

## Purpose and behavior

Effect of a HarnessPermissionRule, and of the permissions default when no rule matches. Values: "allow" (the tool call runs), "deny" (the call is refused with the rule's reason). The first matching rule decides; an allow rule matches only when every path matches, a deny rule when any path does.

[Complete example and detailed rules](../../guide/harness-permissions/).

## Signature

```ts
export type PermissionEffect = "allow" | "deny";
```
