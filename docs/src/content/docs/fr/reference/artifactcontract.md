---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ArtifactContract**. Consultez le [guide artefacts typés](../../guide/advanced/artifacts/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ArtifactContract } from "@elie-laloum/outpost";
```

## Rôle et comportement

Publier des données immuables et échanger des références avec validation du contrat, de l’empreinte et de la filiation.

Les données du store fichier sont limitées à 16 Mio par défaut. L’appelant possède la rétention. L’empreinte fournit l’intégrité par rapport à une référence fiable, pas l’authentification du producteur ni une transaction commune.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom        | Type                                | Présence | Rôle                                                                             |
| ---------- | ----------------------------------- | -------- | -------------------------------------------------------------------------------- |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `name`     | `string`                            | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `version`  | `string`                            | Requis   | Version de contrat ou graphe contrôlée par l’appelant.                           |
| `encoding` | `"json" \| "binary"`                | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
