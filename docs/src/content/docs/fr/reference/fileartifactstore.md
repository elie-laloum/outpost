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

Crée un store d’artefacts avec exactement un dossier ou un transport. Le mode dossier préserve le format immuable existant et les vérifications du système de fichiers privé ; le mode transport délègue à artifactStore. Les deux bornent les contenus et refusent des octets différents pour un identifiant existant.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                   | Type                       | Présence  | Rôle                                                                                                                |
| --------------------- | -------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------- |
| `options`             | `FileArtifactStoreOptions` | Requis    | Exactement un choix de dossier historique ou transport objet, avec la limite d’octets par artefact.                 |
| `options.directory`   | `string \| undefined`      | Optionnel | Dossier de l’ancien store de fichiers, exclusif avec transporter ; le format des blobs existants est conservé.      |
| `options.transporter` | `Transport \| undefined`   | Optionnel | Alternative à directory ; délègue à artifactStore avec la même limite de taille. Fournir un seul choix de stockage. |
| `options.maxBytes`    | `number \| undefined`      | Optionnel | Nombre maximal d’octets par artefact stocké ; 16 Mio par défaut.                                                    |

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
