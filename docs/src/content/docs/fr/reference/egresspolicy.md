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

| Nom          | Type                             | Présence          | Rôle                                                                                                                                                                                                  |
| ------------ | -------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`       | `"deny-all" \| "allowlist"`      | Requis            | deny-all bloque le trafic sortant ; allowlist le restreint aux destinations déclarées si pris en charge.                                                                                              |
| `domains`    | `readonly string[] \| undefined` | Selon la variante | Noms DNS exacts ou motifs de sous-domaines commençant par *., sans protocole, chemin ni port. Aucune destination n’est ajoutée automatiquement. Les jokers Daytona exigent aussi la racine explicite. |
| `allowCidrs` | `readonly string[] \| undefined` | Selon la variante | Plages IP autorisées indépendamment des domaines. Vercel accepte IPv4/IPv6 ; Daytona accepte au plus 10 CIDR IPv4 sans règle de domaine. Des plages larges donnent un accès IP large.                 |
| `denyCidrs`  | `readonly string[] \| undefined` | Selon la variante | Plages IP refusées même si un domaine ou CIDR autorise l’accès. Prises en charge par Vercel ; les listes non vides sont refusées par Daytona.                                                         |

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
