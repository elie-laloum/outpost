---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                                                                                                                        |
| ------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `revision`    | `string \| undefined` | Optionnel | Révision d’objet pour une entrée d’inventaire de transport ; absente dans l’inventaire du système de fichiers local.                                                                                        |
| `name`        | `string`              | Requis    | Nom de base de l’entrée, ou la clé complète de l’objet pour un inventaire de transport.                                                                                                                     |
| `path`        | `string`              | Requis    | Chemin hôte de l’entrée, ou la clé de l’objet pour un inventaire de transport.                                                                                                                              |
| `kind`        | `StorageEntryKind`    | Requis    | file, directory, symlink, other ou unknown, lu sans suivre les liens symboliques. unknown signifie que l’entrée n’a pas pu être lue ou dépassait la limite d’entrées ; les objets d’un transport sont file. |
| `modifiedAt`  | `string \| undefined` | Optionnel | Date de dernière modification au format ISO, enfants parcourus d’un dossier compris.                                                                                                                        |
| `complete`    | `boolean`             | Requis    | false lorsque cette entrée ou l’un de ses enfants a atteint une limite de parcours ou n’a pas pu être lu.                                                                                                   |
| `bytes`       | `number`              | Requis    | Somme des tailles des fichiers ordinaires de cette entrée et de ses enfants parcourus ; les liens symboliques et les dossiers comptent 0. La taille de l’objet pour un transport.                           |
| `files`       | `number`              | Requis    | Nombre de fichiers ordinaires comptés dans le stockage parcouru.                                                                                                                                            |
| `directories` | `number`              | Requis    | Nombre de dossiers comptés dans le stockage parcouru.                                                                                                                                                       |
| `symlinks`    | `number`              | Requis    | Nombre de liens symboliques comptés sans parcourir leurs cibles.                                                                                                                                            |
| `other`       | `number`              | Requis    | Nombre d’entrées qui ne sont ni fichiers ordinaires, ni dossiers, ni liens symboliques.                                                                                                                     |

## Signature

```ts
export interface StorageEntry extends StorageUsage {
  readonly revision?: string;
  readonly name: string;
  readonly path: string;
  kind: StorageEntryKind;
  modifiedAt?: string;
  complete: boolean;
}
```

## Contrats associés

- [StorageEntryKind](../support-storageentrykind/)
- [StorageUsage](../support-storageusage/)
