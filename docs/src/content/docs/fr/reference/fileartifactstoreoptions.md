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

| Nom           | Type                     | Présence  | Rôle                                                                                                                |
| ------------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `directory`   | `string \| undefined`    | Optionnel | Dossier de l’ancien store de fichiers, exclusif avec transporter ; le format des blobs existants est conservé.      |
| `transporter` | `Transport \| undefined` | Optionnel | Alternative à directory ; délègue à artifactStore avec la même limite de taille. Fournir un seul choix de stockage. |
| `maxBytes`    | `number \| undefined`    | Optionnel | Nombre maximal d’octets par artefact stocké ; 16 Mio par défaut.                                                    |

## Signature

```ts
export interface FileArtifactStoreOptions {
  readonly directory?: string;
  readonly transporter?: Transport;
  readonly maxBytes?: number;
}
```

## Contrats associés

- [Transport](../transport/)
