---
title: "StorageEntry"
description: "StorageEntry — Outpost API"
sidebar:
  order: 20
---

Contrat auxiliaire utilisé dans une signature publique. Il n’est pas exporté directement depuis le package ; utilisez l’inférence TypeScript ou le type public qui le référence.

## Rôle et comportement

Inspecter le travail conservé et planifier explicitement sa rétention sans abandonner les modifications récupérables.

Planifier ne supprime rien. L’application reprend possession et revalide les candidats. Les quotas observent l’usage plutôt que d’imposer une limite physique au système de fichiers.

[Exemple complet et règles détaillées](../../guide/operations/recovery/).

## Paramètres et propriétés

| Nom           | Type                  | Présence  | Rôle                                                                             |
| ------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `name`        | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `path`        | `string`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `kind`        | `StorageEntryKind`    | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `modifiedAt`  | `string \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `complete`    | `boolean`             | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `bytes`       | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `files`       | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `directories` | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `symlinks`    | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `other`       | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

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
