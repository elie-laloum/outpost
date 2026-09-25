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

Valide une référence d’artefact, charge ses octets et vérifie contrat, taille et empreinte avant décodage. Les attentes optionnelles de producteur et parents ajoutent des contrôles de filiation. S’utilise hors contexte de tâche ou lorsque la référence est déjà disponible.

[Exemple complet et règles détaillées](../../guide/advanced/artifacts/).

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                              |
| ------------------ | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `store`            | `ArtifactStore`                             | Requis    | Store d’octets d’artefacts utilisé pour la publication immuable ou la lecture bornée des données. |
| `contract`         | `ArtifactContract<T>`                       | Requis    | Contrat d’artefact nommé et versionné définissant encodage et validation.                         |
| `value`            | `unknown`                                   | Requis    | Référence d’artefact non validée à contrôler avant chargement et vérification des octets stockés. |
| `options`          | `ReadArtifactOptions \| undefined`          | Optionnel | Producteur et filiation parentale attendus, avec annulation de lecture.                           |
| `options.producer` | `ArtifactProducer \| undefined`             | Optionnel | Exécution, tâche et tentative du producteur attendu ; une différence fait échouer la lecture.     |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références parentes ordonnées attendues ; une filiation différente fait échouer la lecture.       |
| `options.signal`   | `AbortSignal \| undefined`                  | Optionnel | Annulation coopérative de cette opération.                                                        |

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
