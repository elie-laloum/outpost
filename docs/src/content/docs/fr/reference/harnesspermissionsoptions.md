---
title: "HarnessPermissionsOptions"
description: "HarnessPermissionsOptions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessPermissionsOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                               | Présence  | Rôle                                                       |
| --------- | ---------------------------------- | --------- | ---------------------------------------------------------- |
| `rules`   | `readonly HarnessPermissionRule[]` | Requis    | Règles ordonnées ; la première qui s’applique décide.      |
| `default` | `PermissionEffect \| undefined`    | Optionnel | Effet quand aucune règle ne s’applique ; allow par défaut. |

## Signature

```ts
export interface HarnessPermissionsOptions {
  readonly rules: readonly HarnessPermissionRule[];
  readonly default?: PermissionEffect;
}
```

## Contrats associés

- [HarnessPermissionRule](../harnesspermissionrule/)
- [PermissionEffect](../permissioneffect/)
