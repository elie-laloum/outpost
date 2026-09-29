---
title: "defineBinaryArtifact"
description: "defineBinaryArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineBinaryArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare un contrat d’artefact binaire nommé et versionné qui copie les données Uint8Array à l’encodage et au décodage. Déclarer un contrat ne publie pas d’artefact.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom               | Type                      | Présence | Rôle                                                                                                                                |
| ----------------- | ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `ArtifactContractOptions` | Requis   | Nom et version du contrat identifiant les données binaires.                                                                         |
| `options.name`    | `string`                  | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `options.version` | `string`                  | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |

## Retour

`ArtifactContract<Uint8Array<ArrayBufferLike>>`

## Signature

```ts
export declare function defineBinaryArtifact(
  options: ArtifactContractOptions,
): ArtifactContract<Uint8Array>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
