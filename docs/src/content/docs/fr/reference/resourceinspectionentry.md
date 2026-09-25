---
title: "ResourceInspectionEntry"
description: "ResourceInspectionEntry — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspectionEntry } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                  | Présence  | Rôle                                                                                    |
| ----------- | ------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `path`      | `string`                              | Requis    | Chemin hôte du fichier local d’activité de sandbox.                                     |
| `record`    | `ResourceActivityRecord \| undefined` | Optionnel | Enregistrement local d’activité de sandbox analysé, lorsqu’il est lisible et valide.    |
| `ownership` | `LockOwnership`                       | Requis    | Évaluation de la possession actuelle de la ressource par le processus local enregistré. |

## Signature

```ts
export interface ResourceInspectionEntry {
  readonly path: string;
  readonly record?: ResourceActivityRecord;
  readonly ownership: LockOwnership;
}
```

## Contrats associés

- [LockOwnership](../support-lockownership/)
- [ResourceActivityRecord](../resourceactivityrecord/)
