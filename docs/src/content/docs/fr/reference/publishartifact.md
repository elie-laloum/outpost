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

Encode une valeur selon son contrat, calcule son empreinte SHA-256 et son id adressé par contenu, puis stocke les octets avec store.put(). Renvoie l’ArtifactReference ; producteur et parents sont enregistrés tels quels, sans authentification. Rejette si l’encodage échoue, si une référence parente est invalide ou si le store refuse les octets.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom                | Type                                        | Présence  | Rôle                                                                                                                                                                           |
| ------------------ | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `store`            | `ArtifactStore`                             | Requis    | Store qui reçoit les octets encodés sous l’id de l’artefact.                                                                                                                   |
| `contract`         | `ArtifactContract<T>`                       | Requis    | Contrat qui valide et encode la valeur ; son nom, sa version et son encodage sont enregistrés dans la référence.                                                               |
| `value`            | `T`                                         | Requis    | Valeur à publier ; le contrat la valide avant l’encodage.                                                                                                                      |
| `options`          | `PublishArtifactOptions`                    | Requis    | Producteur à enregistrer, références parentes ordonnées et signal d’annulation.                                                                                                |
| `options.producer` | `ArtifactProducer`                          | Requis    | Exécution, clé de tâche et tentative enregistrées dans la référence et son id, telles quelles : Outpost ne les authentifie pas.                                                |
| `options.parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références dont cet artefact est dérivé, dans l’ordre ; leurs ids sont enregistrés dans parents et dans l’id. Une référence invalide ou en double fait échouer la publication. |
| `options.signal`   | `AbortSignal \| undefined`                  | Optionnel | Son annulation rejette la publication avec la raison du signal ; les octets déjà stockés sont conservés.                                                                       |

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
