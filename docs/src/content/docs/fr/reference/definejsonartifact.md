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

Déclare un contrat d’artefact JSON nommé et versionné. Le schéma valide les valeurs à l’encodage comme au décodage, et les données doivent être du JSON sans perte. Déclarer un contrat ne publie pas d’artefact.

[Exemple complet et règles détaillées](../../guide/artifacts/).

## Paramètres et propriétés

| Nom               | Type                                                            | Présence | Rôle                                                                                                                                |
| ----------------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `JsonArtifactOptions<T>`                                        | Requis   | Nom et version du contrat, et schéma ou fonction d’analyse appliqué à l’encodage et au décodage.                                    |
| `options.name`    | `string`                                                        | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `options.version` | `string`                                                        | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |
| `options.schema`  | `StandardValidator<T> \| ((input: unknown) => T \| Promise<T>)` | Requis   | Validateur de frontière qui précise une entrée inconnue.                                                                            |

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
