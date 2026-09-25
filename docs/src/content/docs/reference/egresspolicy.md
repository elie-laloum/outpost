---
title: "EgressPolicy"
description: "EgressPolicy — Outpost API"
sidebar:
  order: 10
---

Public contract for **EgressPolicy**. See the [outbound networking guide](../../guide/advanced/egress/) for behavior, defaults and examples.

## Import

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/docker";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/podman";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/vercel";
```

## Purpose and behavior

Select an opt-in provider-enforced egress policy.

Research prototype. Docker/Podman support deny-all, not domain allowlists. Vercel maps native firewall options. Unsupported capabilities are rejected instead of weakened.

[Complete example and detailed rules](../../guide/advanced/egress/).

## Parameters and properties

| Name   | Type                        | Presence | Meaning                                                                 |
| ------ | --------------------------- | -------- | ----------------------------------------------------------------------- |
| `mode` | `"deny-all" \| "allowlist"` | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type EgressPolicy =
  | {
      readonly mode: "deny-all";
    }
  | {
      readonly mode: "allowlist";
      readonly domains?: readonly string[];
      readonly allowCidrs?: readonly string[];
      readonly denyCidrs?: readonly string[];
    };
```
