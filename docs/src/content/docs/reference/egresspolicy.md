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
import type { EgressPolicy } from "@elie-laloum/outpost/providers/daytona";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name         | Type                             | Presence          | Meaning                                                                                                                                                                                  |
| ------------ | -------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Required          | deny-all blocks outbound traffic; allowlist restricts it to declared destinations when supported.                                                                                        |
| `domains`    | `readonly string[] \| undefined` | Variant-dependent | Exact DNS names or leading *. subdomain patterns, without scheme, path or port. No destinations are added automatically. Daytona wildcards require the apex to be explicitly listed too. |
| `allowCidrs` | `readonly string[] \| undefined` | Variant-dependent | Allowed IP ranges, independently of domain rules. Vercel accepts IPv4/IPv6; Daytona accepts up to 10 IPv4 CIDRs without domain rules. Broad ranges grant broad IP access.                |
| `denyCidrs`  | `readonly string[] \| undefined` | Variant-dependent | IP ranges denied even when a domain or CIDR allows access. Supported by Vercel; non-empty lists are rejected by Daytona.                                                                 |

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
