---
title: "EgressPolicy"
description: "EgressPolicy — Outpost API"
sidebar:
  order: 10
---

Contrat public de **EgressPolicy**. Consultez le [guide réseau sortant](../../guide/advanced/egress/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { EgressPolicy } from "@elie-laloum/outpost";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/docker";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/podman";
import type { EgressPolicy } from "@elie-laloum/outpost/providers/vercel";
```

## Rôle et comportement

Choisir une politique réseau sortante opt-in imposée par le provider.

Prototype de recherche. Docker/Podman prennent en charge deny-all, pas les listes de domaines. Vercel utilise son firewall natif. Les capacités non prises en charge sont rejetées plutôt qu’affaiblies.

[Exemple complet et règles détaillées](../../guide/advanced/egress/).

## Paramètres et propriétés

| Nom    | Type                        | Présence | Rôle                                                                             |
| ------ | --------------------------- | -------- | -------------------------------------------------------------------------------- |
| `mode` | `"deny-all" \| "allowlist"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
