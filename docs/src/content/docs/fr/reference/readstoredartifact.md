---
title: "readStoredArtifact"
description: "readStoredArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { readStoredArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Valide une référence non fiable, contrôle son contrat ainsi que le producteur et les parents attendus, puis charge les octets et vérifie leur taille et leur empreinte SHA-256 avant décodage. Chaque différence rejette avec une erreur qui la nomme, par exemple Artifact contract mismatch. S’utilise hors d’une tâche, par exemple dans un autre processus.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                                                       |
| ------------------ | ------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Requis    | Store qui contient les octets de l’artefact.                                                                               |
| `contract`         | `ArtifactContract<T>`                       | Requis    | Contrat attendu : son nom, sa version et son encodage doivent correspondre à la référence, et il décode les octets.        |
| `value`            | `unknown`                                   | Requis    | Référence à lire, généralement issue de JSON analysé. Elle est validée et son id recalculé avant tout chargement d’octets. |
| `options`          | `ReadArtifactOptions \| undefined`          | Optionnel | Producteur et parents attendus, et signal d’annulation.                                                                    |
| `options.producer` | `ArtifactProducer \| undefined`             | Optionnel | Exécution, clé de tâche et tentative attendues ; toute différence rejette avec Artifact producer mismatch.                 |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes attendues, dans l’ordre ; une liste différente rejette avec Artifact lineage mismatch.                 |
| `options.signal`   | `AbortSignal \| undefined`                  | Optionnel | Son annulation rejette la lecture avec la raison du signal.                                                                |

## Retour

`Promise<T>`

## Signature

```ts
export declare function readStoredArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: unknown,
  options?: ReadArtifactOptions,
): Promise<T>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [ArtifactStore](../artifactstore/)
- [ReadArtifactOptions](../readartifactoptions/)
