---
title: "defineHarnessPermissions"
description: "defineHarnessPermissions — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessPermissions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Définit des règles ordonnées d’autorisation et de refus sur les noms d’outils, les motifs de commande et les chemins du dépôt. Le harness les évalue avant les hooks before-tool, et de nouveau après la réécriture de l’entrée par un hook ; la première règle applicable l’emporte. Les permissions ne sont pas une frontière de sécurité : c’est la sandbox qui isole.

[Exemple complet et règles détaillées](../../guide/harness-permissions/).

## Paramètres et propriétés

| Nom               | Type                               | Présence  | Rôle                                                             |
| ----------------- | ---------------------------------- | --------- | ---------------------------------------------------------------- |
| `options`         | `HarnessPermissionsOptions`        | Requis    | Règles ordonnées et effet par défaut quand aucune ne s’applique. |
| `options.rules`   | `readonly HarnessPermissionRule[]` | Requis    | Règles ordonnées ; la première qui s’applique décide.            |
| `options.default` | `PermissionEffect \| undefined`    | Optionnel | Effet quand aucune règle ne s’applique ; allow par défaut.       |

## Retour

`HarnessPermissions`

## Signature

```ts
export declare function defineHarnessPermissions(
  options: HarnessPermissionsOptions,
): HarnessPermissions;
```

## Contrats associés

- [HarnessPermissions](../harnesspermissions/)
- [HarnessPermissionsOptions](../harnesspermissionsoptions/)
