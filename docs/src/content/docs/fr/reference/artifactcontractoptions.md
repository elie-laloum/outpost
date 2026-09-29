---
title: "ArtifactContractOptions"
description: "ArtifactContractOptions — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ArtifactContractOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type     | Présence | Rôle                                                                                                                                                      |
| --------- | -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string` | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                 |
| `version` | `string` | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change. |

## Signature

```ts
export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
