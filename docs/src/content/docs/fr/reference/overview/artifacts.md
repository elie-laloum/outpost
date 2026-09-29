---
title: "Artefacts typés — Vue d’ensemble"
description: "Publiez une seule fois une valeur typée et versionnée dans un store, et transmettez une petite référence vérifiée à chaque lecture."
sidebar:
  label: Vue d’ensemble
  order: 0
---

## Choisir un contrat

Un contrat porte un `name` et une `version`, chacun non vide et de 1024 caractères au maximum. Une lecture exige le même nom, la même version et le même encodage que la référence.

|                  | `defineJsonArtifact()`                                    | `defineBinaryArtifact()`                   |
| ---------------- | --------------------------------------------------------- | ------------------------------------------ |
| Valeur           | JSON sans perte, typé par `schema`                        | `Uint8Array`                               |
| À la publication | Valide avec `schema`, puis sérialise le résultat          | Copie les octets                           |
| À la lecture     | Analyse du JSON UTF-8 strict, puis valide avec `schema`   | Copie les octets                           |
| Rejette          | Échecs du schéma, `undefined`, `NaN`, instances de classe | Toute valeur qui n’est pas un `Uint8Array` |
| `encoding`       | `json`                                                    | `binary`                                   |

## Ce que vérifient publication et lecture

`publishArtifact()` stocke les octets encodés sous un `id` dérivé de leur empreinte SHA-256, de leur taille, du contrat, du producteur et des parents. Chaque échec ci-dessous rejette avec une `Error` simple portant le message indiqué.

| Étape                                     | Vérification                                    | Échec                                                            |
| ----------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| Publication : encodage                    | Le contrat accepte la valeur                    | Erreur de schéma ou de données ; rien n’est stocké               |
| Publication : stockage                    | `maxBytes` du store, 16 Mio par défaut          | `Artifact exceeds maxBytes`                                      |
| Publication : `id` déjà stocké            | Octets identiques                               | Octets différents : `Existing object content integrity mismatch` |
| Lecture : référence                       | Forme, empreintes et `id` recalculé             | `Invalid artifact reference or lineage`                          |
| Lecture : contrat                         | Mêmes nom, version et encodage                  | `Artifact contract mismatch`                                     |
| Lecture : `producer` / `parents` attendus | Correspondance exacte, parents dans l’ordre     | `Artifact producer mismatch` / `Artifact lineage mismatch`       |
| Lecture : octets                          | Même taille et même empreinte SHA-256           | `Artifact content integrity mismatch`                            |
| `readArtifact()`                          | Produit par cette exécution et cette dépendance | `Artifact dependency producer mismatch`                          |

:::caution
Empreintes et filiation prouvent l’intégrité, pas l’auteur. Quiconque peut écrire dans le store peut publier n’importe quel `producer`.
:::

## Points d’entrée

Guide : [Artefacts](../../../guide/artifacts/) · [Tâches et dépendances](../../../guide/task-dependencies/) · [Sécurité](../../../guide/security/)

- [defineJsonArtifact](../../definejsonartifact/)
- [defineBinaryArtifact](../../definebinaryartifact/)
- [publishArtifact](../../publishartifact/)
- [readStoredArtifact](../../readstoredartifact/)
- [defineArtifactTask](../../defineartifacttask/)
- [readArtifact](../../readartifact/)
- [ArtifactContract](../../artifactcontract/)
- [ArtifactReference](../../artifactreference/)
- [ArtifactStore](../../artifactstore/)
- [PublishArtifactOptions](../../publishartifactoptions/)
- [ReadArtifactOptions](../../readartifactoptions/)
