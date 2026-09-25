---
title: "ResourceOperationResult"
description: "ResourceOperationResult — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceOperationResult } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom          | Type                                                                                                                                          | Présence | Rôle                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Requis   | Identifiant enregistré de l’opération de ressource terminée.           |
| `finishedAt` | `string`                                                                                                                                      | Requis   | Horodatage ISO de fin d’exécution de cette tâche ou opération.         |
| `outcome`    | `"failed" \| "completed"`                                                                                                                     | Requis   | Indique si l’opération enregistrée a réussi ou échoué.                 |
| `count`      | `number`                                                                                                                                      | Requis   | Numéro de séquence local d’opération croissant.                        |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Requis   | Catégorie d’opération enregistrée pour le suivi d’activité de sandbox. |
| `startedAt`  | `string`                                                                                                                                      | Requis   | Horodatage ISO du début d’exécution de cette tâche ou opération.       |

## Signature

```ts
export interface ResourceOperationResult extends ResourceOperation {
  readonly id: string;
  readonly finishedAt: string;
  readonly outcome: "completed" | "failed";
}
```

## Contrats associés

- [ResourceOperation](../resourceoperation/)
