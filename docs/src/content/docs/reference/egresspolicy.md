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

| Name         | Type                             | Presence          | Meaning                                                                                                                                                                                                                                        |
| ------------ | -------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Required          | deny-all blocks all outbound traffic and takes no other field; allowlist allows only the listed domains and allowCidrs and needs at least one entry. A provider that cannot enforce the policy rejects it with code configuration at creation. |
| `domains`    | `readonly string[] \| undefined` | Variant-dependent | Allowed DNS names, exact or *.-prefixed for subdomains, without scheme, path or port; IP addresses and single-label names are rejected. Outpost adds no destination for you, and Daytona requires the apex of each wildcard in the list.       |
| `allowCidrs` | `readonly string[] \| undefined` | Variant-dependent | IP ranges allowed regardless of domains, so a broad range bypasses the domain list. Vercel accepts IPv4 and IPv6; Daytona accepts at most 10 IPv4 ranges and no domains alongside them.                                                        |
| `denyCidrs`  | `readonly string[] \| undefined` | Variant-dependent | IP ranges blocked even when a domain or allowCidrs entry allows them. Only Vercel enforces them; Daytona rejects a non-empty list.                                                                                                             |

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
