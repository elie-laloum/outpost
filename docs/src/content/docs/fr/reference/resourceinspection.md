---
title: "ResourceInspection"
description: "ResourceInspection — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ResourceInspection } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                 | Présence | Rôle                                                                                                                                                                                                       |
| ---------- | ------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scope`    | `"recorded-sandboxes"`               | Requis   | Toujours recorded-sandboxes : seuls les enregistrements écrits par Outpost sont listés, jamais le compte du provider de sandbox.                                                                           |
| `complete` | `boolean`                            | Requis   | Faux quand un enregistrement était illisible, qu’une limite d’entrées a été atteinte ou que les enregistrements n’ont pas pu être listés. La rétention de récupération conserve alors tous les workspaces. |
| `entries`  | `readonly ResourceInspectionEntry[]` | Requis   | Une entrée par enregistrement trouvé, avec son verdict de possession.                                                                                                                                      |
| `issues`   | `readonly StorageIssue[]`            | Requis   | Problèmes qui ont rendu l’inspection partielle, comme RESOURCE_RECORD_UNREADABLE, RESOURCE_ENTRY_LIMIT ou RESOURCE_DIRECTORY_UNAVAILABLE. En mode transport, la liste des problèmes de tout l’inventaire.  |

## Signature

```ts
export interface ResourceInspection {
  readonly scope: "recorded-sandboxes";
  readonly complete: boolean;
  readonly entries: readonly ResourceInspectionEntry[];
  readonly issues: readonly StorageIssue[];
}
```

## Contrats associés

- [ResourceInspectionEntry](../resourceinspectionentry/)
- [StorageIssue](../support-storageissue/)
