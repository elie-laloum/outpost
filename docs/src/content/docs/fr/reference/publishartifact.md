---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { publishArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Encode une valeur selon son contrat, calcule son empreinte et son identité immuable, puis publie atomiquement ses octets dans le store. Renvoie une petite référence contenant producteur et filiation parentale ordonnée ; ces métadonnées n’authentifient pas le producteur.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                                         |
| ------------------ | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------ |
| `store`            | `ArtifactStore`                             | Requis    | Store d’octets d’artefacts utilisé pour la publication immuable ou la lecture bornée des données.            |
| `contract`         | `ArtifactContract<T>`                       | Requis    | Contrat d’artefact nommé et versionné définissant encodage et validation.                                    |
| `value`            | `T`                                         | Requis    | Données typées à valider, encoder et publier selon le contrat d’artefact.                                    |
| `options`          | `PublishArtifactOptions`                    | Requis    | Identité du producteur, filiation parentale ordonnée et annulation de publication.                           |
| `options.producer` | `ArtifactProducer`                          | Requis    | Identité enregistrée du producteur, sans authentification.                                                   |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes ordonnées dont les identifiants sont enregistrés dans la filiation de l’artefact publié. |
| `options.signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                                                                   |

## Retour

`Promise<ArtifactReference>`

## Signature

```ts
export declare function publishArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: T,
  options: PublishArtifactOptions,
): Promise<ArtifactReference>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactReference](../artifactreference/)
- [ArtifactStore](../artifactstore/)
- [PublishArtifactOptions](../publishartifactoptions/)
