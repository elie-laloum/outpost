---
title: "PublishArtifactOptions"
description: "PublishArtifactOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublishArtifactOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                        | Présence  | Rôle                                                                                                                                                                           |
| ---------- | ------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `producer` | `ArtifactProducer`                          | Requis    | Exécution, clé de tâche et tentative enregistrées dans la référence et son id, telles quelles : Outpost ne les authentifie pas.                                                |
| `parents`  | `readonly ArtifactReference[] \| undefined` | Optionnel | Références dont cet artefact est dérivé, dans l’ordre ; leurs ids sont enregistrés dans parents et dans l’id. Une référence invalide ou en double fait échouer la publication. |
| `signal`   | `AbortSignal \| undefined`                  | Optionnel | Son annulation rejette la publication avec la raison du signal ; les octets déjà stockés sont conservés.                                                                       |

## Signature

```ts
export interface PublishArtifactOptions {
  readonly producer: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
```

## Contrats associés

- [ArtifactProducer](../artifactproducer/)
- [ArtifactReference](../artifactreference/)
