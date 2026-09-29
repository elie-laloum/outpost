---
title: "HarnessPermissionRule"
description: "HarnessPermissionRule — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { HarnessPermissionRule } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                             | Présence  | Rôle                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effect`   | `PermissionEffect`               | Requis    | allow ou deny quand la règle s’applique.                                                                                                                                                                                                                                                |
| `tools`    | `readonly string[] \| undefined` | Optionnel | Motifs de noms d’outils ; * correspond à n’importe quels caractères. Omettez-les pour viser tous les outils.                                                                                                                                                                            |
| `paths`    | `readonly string[] \| undefined` | Optionnel | Globs de chemins du dépôt (**, * et ?) comparés aux chemins déclarés par l’appel. Une règle allow s’applique quand tous les chemins correspondent, une règle deny quand l’un d’eux correspond ; un appel sans chemin déclaré ne correspond jamais, pas plus qu’un chemin hors du dépôt. |
| `commands` | `readonly string[] \| undefined` | Optionnel | Motifs de commande où * correspond à n’importe quels caractères, comparés à la commande déclarée par l’appel ; un appel sans commande déclarée ne correspond jamais. Les métacaractères du shell peuvent contourner ces motifs.                                                         |
| `reason`   | `string \| undefined`            | Optionnel | Explication renvoyée au modèle quand cette règle deny s’applique, Denied by permission rule &lt;n> par défaut.                                                                                                                                                                          |

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
