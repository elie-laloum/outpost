---
title: "WorkspaceGitEntry"
description: "WorkspaceGitEntry — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom      | Type                                                           | Présence          | Rôle                                                                                    |
| -------- | -------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `name`   | `string`                                                       | Requis            | Nom de fichier de l’entrée de stockage inspectée.                                       |
| `path`   | `string`                                                       | Requis            | Chemin hôte de l’entrée de stockage inspectée.                                          |
| `state`  | `"registered" \| "unregistered" \| "skipped" \| "unavailable"` | Requis            | Classification de l’état Git du worktree utilisée pour décider si le nettoyage est sûr. |
| `head`   | `string`                                                       | Selon la variante | Commit Git HEAD enregistré par l’inspection ou le snapshot.                             |
| `branch` | `string \| null`                                               | Selon la variante | Nom de branche du worktree, ou null lorsque HEAD est détaché.                           |
| `dirty`  | `boolean`                                                      | Selon la variante | Indique si des changements suivis ou non suivis rendent le checkout sale.               |
| `locked` | `boolean`                                                      | Selon la variante | Indique si Git marque le worktree comme verrouillé.                                     |
| `reason` | `string`                                                       | Selon la variante | Motif pour lequel l’état Git n’a pu être inspecté ou a été délibérément ignoré.         |

## Signature

```ts
export type WorkspaceGitEntry = Pick<StorageEntry, "name" | "path"> &
  WorkspaceGitState;
```

## Contrats associés

- [StorageEntry](../support-storageentry/)
- [WorkspaceGitState](../support-workspacegitstate/)
