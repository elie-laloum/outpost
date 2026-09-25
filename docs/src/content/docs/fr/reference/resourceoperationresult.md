---
title: "ResourceOperationResult"
description: "ResourceOperationResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ResourceOperationResult**. Consultez le [guide activité des ressources](../../guide/operations/recovery/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ResourceOperationResult } from "@elie-laloum/outpost";
```

## Rôle et comportement

Lire l’activité enregistrée localement des baux et opérations.

Les observations locales n’énumèrent pas les comptes distants et ne constituent pas un inventaire cloud faisant autorité.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom          | Type                                                                                                                                          | Présence | Rôle                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `id`         | `string`                                                                                                                                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `finishedAt` | `string`                                                                                                                                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `outcome`    | `"completed" \| "failed"`                                                                                                                     | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `count`      | `number`                                                                                                                                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `kind`       | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `startedAt`  | `string`                                                                                                                                      | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
