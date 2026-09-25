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

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                             | Présence          | Rôle                                                                                                     |
| ------------ | -------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Requis            | deny-all bloque le trafic sortant ; allowlist le restreint aux destinations déclarées si pris en charge. |
| `domains`    | `readonly string[] \| undefined` | Selon la variante | Noms de domaines sortants autorisés pour les providers prenant en charge ces listes.                     |
| `allowCidrs` | `readonly string[] \| undefined` | Selon la variante | Plages réseau explicitement autorisées par la politique sortante du provider.                            |
| `denyCidrs`  | `readonly string[] \| undefined` | Selon la variante | Plages réseau explicitement interdites par la politique sortante du provider.                            |

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
