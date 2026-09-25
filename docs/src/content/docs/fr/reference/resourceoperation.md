---
title: "ResourceOperation"
description: "ResourceOperation — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceOperation } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                                                                          | Présence | Rôle                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `count`     | `number`                                                                                                                                      | Requis   | Numéro de séquence local d’opération croissant.                        |
| `kind`      | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Requis   | Catégorie d’opération enregistrée pour le suivi d’activité de sandbox. |
| `startedAt` | `string`                                                                                                                                      | Requis   | Horodatage ISO du début d’exécution de cette tâche ou opération.       |

## Signature

```ts
export interface ResourceOperation {
  readonly count: number;
  readonly kind: ResourceOperationKind;
  readonly startedAt: string;
}
```

## Contrats associés

- [ResourceOperationKind](../resourceoperationkind/)
