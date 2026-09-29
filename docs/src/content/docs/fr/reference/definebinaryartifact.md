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

Déclare un contrat nommé et versionné pour des données Uint8Array, copiées à la publication et à la lecture. Lève une erreur si name ou version est vide ou dépasse 1024 caractères.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom               | Type                      | Présence | Rôle                                                                                                                                                      |
| ----------------- | ------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `ArtifactContractOptions` | Requis   | Nom et version du contrat.                                                                                                                                |
| `options.name`    | `string`                  | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                 |
| `options.version` | `string`                  | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change. |

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
