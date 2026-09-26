---
title: "HarnessPermissions"
description: "HarnessPermissions — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Skills et streaming ne sont pas encore disponibles ; le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessPermissions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                                             | Présence | Rôle                                                            |
| ---------- | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `kind`     | `"permissions"`                                                  | Requis   | Discriminant de la définition : permissions.                    |
| `rules`    | `readonly HarnessPermissionRule[]`                               | Requis   | Règles ordonnées et figées.                                     |
| `default`  | `PermissionEffect`                                               | Requis   | Effet quand aucune règle ne s’applique.                         |
| `evaluate` | `(tool: string, resources: ToolResources) => PermissionDecision` | Requis   | Décide si un outil peut s’exécuter avec les ressources données. |

## Signature

```ts
export interface HarnessPermissions {
  readonly kind: "permissions";
  readonly rules: readonly HarnessPermissionRule[];
  readonly default: PermissionEffect;
  evaluate(tool: string, resources: ToolResources): PermissionDecision;
}
```

## Contrats associés

- [HarnessPermissionRule](../harnesspermissionrule/)
- [PermissionDecision](../permissiondecision/)
- [PermissionEffect](../permissioneffect/)
- [ToolResources](../toolresources/)
