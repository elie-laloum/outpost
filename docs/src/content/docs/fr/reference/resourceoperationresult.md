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

| Nom          | Type                                                                                                                                          | Présence | Rôle                                                                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Requis   | UUID aléatoire de cette opération.                                                                                                                                                     |
| `finishedAt` | `string`                                                                                                                                      | Requis   | Horodatage ISO de la fin de l’opération.                                                                                                                                               |
| `outcome`    | `"failed" \| "completed"`                                                                                                                     | Requis   | completed si l’action s’est résolue, failed si elle a levé une erreur.                                                                                                                 |
| `count`      | `number`                                                                                                                                      | Requis   | Nombre d’opérations de ce type en cours simultanément. Toujours 1 dans lastOperation et lastFailure.                                                                                   |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Requis   | Catégorie d’opération, comme dispatch, command, upload ou download.                                                                                                                    |
| `startedAt`  | `string`                                                                                                                                      | Requis   | Horodatage ISO de début. Dans un résultat, début de cette opération ; dans operations, début de la première opération de ce type depuis la dernière période sans opération de ce type. |

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
