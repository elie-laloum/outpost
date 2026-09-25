---
title: "publishArtifact"
description: "publishArtifact — Outpost API"
sidebar:
  order: 10
---

Contrat public de **publishArtifact**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { publishArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                          |
| ------------------ | ------------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Requis    | Implémentation de persistance fournie par l’appelant.                                         |
| `contract`         | `ArtifactContract<T>`                       | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `value`            | `T`                                         | Requis    | Valeur typée produite ou consommée par ce contrat.                                            |
| `options`          | `PublishArtifactOptions`                    | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.producer` | `ArtifactProducer`                          | Requis    | Identité enregistrée du producteur, sans authentification.                                    |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références ou identifiants parents ordonnés.                                                  |
| `options.signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                                                    |

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
