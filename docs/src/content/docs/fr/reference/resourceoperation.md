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

| Nom         | Type                                                                                                                                          | Présence | Rôle                                                                                                                                                                                   |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `count`     | `number`                                                                                                                                      | Requis   | Nombre d’opérations de ce type en cours simultanément. Toujours 1 dans lastOperation et lastFailure.                                                                                   |
| `kind`      | `"command" \| "dispatch" \| "attach" \| "diagnose" \| "invoke" \| "upload" \| "download" \| "manifest" \| "download-batch" \| "upload-batch"` | Requis   | Catégorie d’opération, comme dispatch, command, upload ou download.                                                                                                                    |
| `startedAt` | `string`                                                                                                                                      | Requis   | Horodatage ISO de début. Dans un résultat, début de cette opération ; dans operations, début de la première opération de ce type depuis la dernière période sans opération de ce type. |

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
