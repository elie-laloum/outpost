---
title: "EgressPolicy"
description: "EgressPolicy — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/docker";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/podman";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/vercel";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                             | Presence          | Meaning                                                                                           |
| ------------ | -------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Required          | deny-all blocks outbound traffic; allowlist restricts it to declared destinations when supported. |
| `domains`    | `readonly string[] \| undefined` | Variant-dependent | Allowed outbound domain names for providers supporting domain allowlists.                         |
| `allowCidrs` | `readonly string[] \| undefined` | Variant-dependent | Network ranges explicitly allowed by the provider’s egress policy.                                |
| `denyCidrs`  | `readonly string[] \| undefined` | Variant-dependent | Network ranges explicitly denied by the provider’s egress policy.                                 |

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
