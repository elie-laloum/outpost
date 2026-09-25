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

| Nom       | Type     | Présence | Rôle                                                                                                                                |
| --------- | -------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`    | `string` | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `version` | `string` | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |

## Signature

```ts
export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
