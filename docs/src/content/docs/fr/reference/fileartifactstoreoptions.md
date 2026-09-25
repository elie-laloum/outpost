---
title: "FileArtifactStoreOptions"
description: "FileArtifactStoreOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { FileArtifactStoreOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                  | Présence  | Rôle                                                                     |
| ----------- | --------------------- | --------- | ------------------------------------------------------------------------ |
| `directory` | `string`              | Requis    | Dossier hôte stockant les données d’artefacts immuables par identifiant. |
| `maxBytes`  | `number \| undefined` | Optionnel | Nombre maximal d’octets par artefact stocké ; 16 Mio par défaut.         |

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory: string;
  readonly maxBytes?: number;
}
```
