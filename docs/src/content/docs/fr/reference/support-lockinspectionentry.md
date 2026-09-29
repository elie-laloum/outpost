---
title: "LockInspectionEntry"
description: "LockInspectionEntry — Outpost API"
sidebar:
  order: 10
---

## Paramètres et propriétés

Les champs ci-dessous couvrent toutes les variantes ; la signature précise leurs combinaisons autorisées.

| Nom         | Type                                              | Présence          | Rôle                                                                                                                                                                                             |
| ----------- | ------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`      | `string`                                          | Requis            | Nom de base de l’entrée, ou la clé complète de l’objet pour un inventaire de transport.                                                                                                          |
| `path`      | `string`                                          | Requis            | Chemin hôte de l’entrée, ou la clé de l’objet pour un inventaire de transport.                                                                                                                   |
| `ownership` | `LockOwnership \| undefined`                      | Optionnel         | Indique si le processus enregistré détient encore le verrou, d’après l’hôte, le démarrage, l’espace de noms de PID et l’heure de lancement du processus. Fiez-vous à ce champ plutôt qu’à state. |
| `state`     | `"present" \| "absent" \| "unknown" \| "skipped"` | Requis            | present : un processus porte le PID enregistré ; absent : aucun ; unknown : le fichier ou le PID n’a pas pu être lu ou sondé ; skipped : l’entrée n’est pas un fichier.                          |
| `pid`       | `number \| number \| undefined`                   | Selon la variante | PID lu dans le fichier de verrou, absent lorsque le fichier ou son PID est illisible.                                                                                                            |
| `reason`    | `string \| "NOT_FILE"`                            | Selon la variante | Motif de l’état unknown (LOCK_READ_FAILED, INVALID_PID, PID_PROBE_FAILED) ou skipped (NOT_FILE).                                                                                                 |

## Signature

```ts
export type LockInspectionEntry = Pick<StorageEntry, "name" | "path"> &
  LockInspectionState;
```

## Contrats associés

- [LockInspectionState](../support-lockinspectionstate/)
- [StorageEntry](../support-storageentry/)
