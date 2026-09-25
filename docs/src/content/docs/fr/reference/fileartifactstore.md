---
title: "fileArtifactStore"
description: "fileArtifactStore — Outpost API"
sidebar:
  order: 10
---

Contrat public de **fileArtifactStore**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { fileArtifactStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                 | Type                       | Présence  | Rôle                                                                                          |
| ------------------- | -------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`           | `FileArtifactStoreOptions` | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.directory` | `string`                   | Requis    | Dossier utilisé par l’opération ; voir les règles de résolution.                              |
| `options.maxBytes`  | `number \| undefined`      | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
