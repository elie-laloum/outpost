---
title: "fileArtifactStore"
description: "fileArtifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { fileArtifactStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un store fichier pour des octets d’artefact immuables, avec publication atomique et lectures bornées. maxBytes vaut 16 Mio par données publiées par défaut. Un identifiant existant ne peut recevoir des octets différents ; l’appelant gère la rétention.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                 | Type                       | Présence  | Rôle                                                                       |
| ------------------- | -------------------------- | --------- | -------------------------------------------------------------------------- |
| `options`           | `FileArtifactStoreOptions` | Requis    | Dossier de stockage des artefacts et octets maximaux par données publiées. |
| `options.directory` | `string`                   | Requis    | Dossier hôte stockant les données d’artefacts immuables par identifiant.   |
| `options.maxBytes`  | `number \| undefined`      | Optionnel | Nombre maximal d’octets par artefact stocké ; 16 Mio par défaut.           |

## Retour

`ArtifactStore`

## Signature

```ts
export declare function fileArtifactStore(
  options: FileArtifactStoreOptions,
): ArtifactStore;
```

## Contrats associés

- [ArtifactStore](../artifactstore/)
- [FileArtifactStoreOptions](../fileartifactstoreoptions/)
