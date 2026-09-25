---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                                                  |
| ------------- | --------------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `name`        | `string`              | Requis    | Nom de fichier de l’entrée de stockage inspectée.                                                     |
| `path`        | `string`              | Requis    | Chemin hôte de l’entrée de stockage inspectée.                                                        |
| `kind`        | `StorageEntryKind`    | Requis    | Type d’entrée de fichiers observé sans suivre les liens symboliques.                                  |
| `modifiedAt`  | `string \| undefined` | Optionnel | Horodatage ISO de la dernière modification de l’entrée inspectée.                                     |
| `complete`    | `boolean`             | Requis    | Indique si toute l’inspection demandée s’est terminée sans limite de parcours ni entrée inaccessible. |
| `bytes`       | `number`              | Requis    | Taille observée en octets de cette entrée, y compris ses enfants parcourus.                           |
| `files`       | `number`              | Requis    | Nombre de fichiers ordinaires comptés dans le stockage parcouru.                                      |
| `directories` | `number`              | Requis    | Nombre de dossiers comptés dans le stockage parcouru.                                                 |
| `symlinks`    | `number`              | Requis    | Nombre de liens symboliques comptés sans parcourir leurs cibles.                                      |
| `other`       | `number`              | Requis    | Nombre d’entrées qui ne sont ni fichiers ordinaires, ni dossiers, ni liens symboliques.               |

## Signature

```ts
export interface StorageEntry extends StorageUsage {
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
