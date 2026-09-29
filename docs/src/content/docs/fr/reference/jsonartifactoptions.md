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

| Nom       | Type                                                            | Présence | Rôle                                                                                                                                                                                                       |
| --------- | --------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string`                                                        | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                                                                  |
| `version` | `string`                                                        | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change.                                                  |
| `schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis   | Validateur Standard Schema (Zod, Valibot…) ou fonction qui renvoie la valeur contrôlée ou lève une erreur. S’applique avant l’encodage et après le décodage ; sa sortie est la valeur stockée et renvoyée. |

## Signature

```ts
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};
```

## Contrats associés

- [ArtifactContractOptions](../artifactcontractoptions/)
- [StandardValidator](../standardvalidator/)
