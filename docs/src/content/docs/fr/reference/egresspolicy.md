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

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom          | Type                             | Présence          | Rôle                                                                                                                                                                                                                                                                   |
| ------------ | -------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Requis            | deny-all bloque tout le trafic sortant et n’accepte aucun autre champ ; allowlist n’autorise que les domains et allowCidrs listés et exige au moins une entrée. Un provider qui ne peut pas imposer la politique la refuse avec le code configuration dès sa création. |
| `domains`    | `readonly string[] \| undefined` | Selon la variante | Noms DNS autorisés, exacts ou préfixés par *. pour les sous-domaines, sans protocole, chemin ni port ; les adresses IP et les noms à un seul label sont refusés. Outpost n’ajoute aucune destination, et Daytona exige la racine de chaque joker dans la liste.        |
| `allowCidrs` | `readonly string[] \| undefined` | Selon la variante | Plages IP autorisées indépendamment des domaines : une plage large contourne donc la liste de domaines. Vercel accepte IPv4 et IPv6 ; Daytona accepte au plus 10 plages IPv4, sans domains à côté.                                                                     |
| `denyCidrs`  | `readonly string[] \| undefined` | Selon la variante | Plages IP bloquées même quand un domaine ou une entrée allowCidrs les autorise. Seul Vercel les applique ; Daytona refuse une liste non vide.                                                                                                                          |

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
