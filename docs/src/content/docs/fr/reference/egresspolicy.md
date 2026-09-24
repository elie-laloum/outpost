---
title: "EgressPolicy"
description: "EgressPolicy — Outpost API"
sidebar:
  order: 10
---

Contrat public de **EgressPolicy**. Consultez le [guide réseau sortant](../../sandboxes/egress/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/docker";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/podman";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/vercel";
```

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
