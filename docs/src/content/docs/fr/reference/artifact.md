---
title: "artifact"
description: "artifact — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { artifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée des contrats de données nommés et versionnés avec json ou binary. Les contrats JSON valident encodage et décodage et exigent du JSON sans perte ; les contrats binaires copient les octets Uint8Array. Créer un contrat ne publie pas d’artefact.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom      | Type                                                                 | Présence | Rôle                                                                                            |
| -------- | -------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `json`   | `<T>(options: JsonArtifactOptions<T>) => ArtifactContract<T>`        | Requis   | Crée un contrat d’artefact JSON nommé qui valide les valeurs lors de l’encodage et du décodage. |
| `binary` | `(options: ArtifactContractOptions) => ArtifactContract<Uint8Array>` | Requis   | Crée un contrat d’artefact binaire nommé qui copie les données Uint8Array.                      |

## Signature

```ts
export declare const artifact: {
  json<T>(options: JsonArtifactOptions<T>): ArtifactContract<T>;
  binary(options: ArtifactContractOptions): ArtifactContract<Uint8Array>;
};
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactContractOptions](../artifactcontractoptions/)
- [JsonArtifactOptions](../jsonartifactoptions/)
