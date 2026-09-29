---
title: "defineJsonArtifact"
description: "defineJsonArtifact — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineJsonArtifact } from "@elie-laloum/outpost";
```

## Rôle et comportement

Déclare un contrat nommé et versionné pour une valeur JSON sans perte ; schema la valide à la publication puis à la lecture. Lève une erreur si name ou version est vide ou dépasse 1024 caractères.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom               | Type                                                            | Présence | Rôle                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonArtifactOptions<T>`                                        | Requis   | Nom et version du contrat, et schéma appliqué à la publication et à la lecture.                                                                                                                            |
| `options.name`    | `string`                                                        | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                                                                  |
| `options.version` | `string`                                                        | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change.                                                  |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis   | Validateur Standard Schema (Zod, Valibot…) ou fonction qui renvoie la valeur contrôlée ou lève une erreur. S’applique avant l’encodage et après le décodage ; sa sortie est la valeur stockée et renvoyée. |

## Retour

`ArtifactContract<T>`

## Signature

```ts
export declare function defineJsonArtifact<T>(
  options: JsonArtifactOptions<T>,
): ArtifactContract<T>;
```

## Contrats associés

- [ArtifactContract](../artifactcontract/)
- [JsonArtifactOptions](../jsonartifactoptions/)
