---
title: "JsonArtifactOptions"
description: "JsonArtifactOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { JsonArtifactOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                            | Présence | Rôle                                                                                                                                |
| --------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                        | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `version` | `string`                                                        | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis   | Validateur de frontière qui précise une entrée inconnue.                                                                            |

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Contrats associés

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
