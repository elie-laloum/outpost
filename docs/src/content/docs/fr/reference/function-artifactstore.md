---
title: "artifactStore"
description: "artifactStore — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { artifactStore } from "@elie-laloum/outpost";
```

## Rôle et comportement

Construit un ArtifactStore sur un transport. La publication crée des blobs immuables ou accepte des octets existants identiques ; un contenu différent provoque un échec. Les contrats et références portables d’artefacts restent inchangés.

[Exemple complet et règles détaillées](../../guide/operations/storage-transports/).

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
export declare function artifactStore(
  options: ArtifactStoreOptions,
): ArtifactStore;
```

## Contrats associés

- [ArtifactStore](../artifactstore/)
- [ArtifactStoreOptions](../artifactstoreoptions/)
