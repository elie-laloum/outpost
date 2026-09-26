---
title: "HarnessPermissionRule"
description: "HarnessPermissionRule — Outpost API"
sidebar:
  order: 20
---

:::caution[Expérimental]
Expérimental : élément du moteur de harness intégré non publié. Le contrat peut changer avant publication.
:::

## Import

```ts
import type { HarnessPermissionRule } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                             | Présence  | Rôle                                                                                                                                                                                                                                       |
| ---------- | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `effect`   | `PermissionEffect`               | Requis    | allow ou deny quand la règle s’applique.                                                                                                                                                                                                   |
| `tools`    | `readonly string[] \| undefined` | Optionnel | Motifs de noms d’outils ; * correspond à n’importe quels caractères. Omettez-les pour viser tous les outils.                                                                                                                               |
| `paths`    | `readonly string[] \| undefined` | Optionnel | Globs de chemins du dépôt (**, * et ?) comparés aux chemins déclarés par les ressources de l’outil. Une règle allow exige que tous les chemins correspondent ; une règle deny, un seul. Les chemins hors du dépôt ne correspondent jamais. |
| `commands` | `readonly string[] \| undefined` | Optionnel | Motifs de commandes où * correspond à n’importe quels caractères, comparés à la commande déclarée par les ressources de l’outil. Les métacaractères du shell peuvent contourner ces motifs.                                                |
| `reason`   | `string \| undefined`            | Optionnel | Explication renvoyée au modèle quand une règle deny s’applique.                                                                                                                                                                            |

## Signature

```ts
export interface HarnessPermissionRule {
  readonly effect: PermissionEffect;
  readonly tools?: readonly string[];
  readonly paths?: readonly string[];
  readonly commands?: readonly string[];
  readonly reason?: string;
}
```

## Contrats associés

- [PermissionEffect](../permissioneffect/)
