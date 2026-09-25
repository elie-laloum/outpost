---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                              | Présence          | Rôle                                                                                    |
| ----------- | ------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| `name`      | `string`                                          | Requis            | Nom de fichier de l’entrée de stockage inspectée.                                       |
| `path`      | `string`                                          | Requis            | Chemin hôte de l’entrée de stockage inspectée.                                          |
| `ownership` | `LockOwnership \| undefined`                      | Optionnel         | Évaluation de la possession actuelle de la ressource par le processus local enregistré. |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Requis            | Indique si le fichier de verrou est présent, absent, inconnu ou délibérément ignoré.    |
| `pid`       | `number \| number \| undefined`                   | Selon la variante | Identifiant du processus extrait du fichier de verrou local lorsqu’il est disponible.   |
| `reason`    | `string \| "NOT_FILE"`                            | Selon la variante | Motif du classement du verrou local dans cet état de possession.                        |

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Contrats associés

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
