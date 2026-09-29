---
title: "createArtifactStore"
description: "createArtifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createArtifactStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée un ArtifactStore qui conserve chaque artefact dans l’objet immuable artifacts/&lt;id>.blob. Republier un id existant ne réussit qu’avec des octets identiques, sinon l’appel échoue avec Existing object content integrity mismatch ; lire un id absent échoue avec Artifact does not exist.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom                   | Type                   | Présence  | Rôle                                                                                                                                        |
| --------------------- | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `ArtifactStoreOptions` | Requis    | Transport et limite de contenu par artefact pour la publication immuable et les lectures vérifiées.                                         |
| `options.maxBytes`    | `number \| undefined`  | Optionnel | Taille maximale positive d’un artefact en octets, 16 Mio par défaut ; vérifiée avant publication et pendant la lecture.                     |
| `options.transporter` | `Transport`            | Requis    | Transport objet appartenant à l’appelant, utilisé par le store ou l’opération. Fermer un workflow ou une sandbox ne ferme pas ce transport. |

## Retour

`ArtifactStore`

## Signature

```ts
export declare function createArtifactStore(
  options: ArtifactStoreOptions,
): ArtifactStore;
```

## Contrats associés

- [ArtifactStore](../artifactstore/)
- [ArtifactStoreOptions](../artifactstoreoptions/)
