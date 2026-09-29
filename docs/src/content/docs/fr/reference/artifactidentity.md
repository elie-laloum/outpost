---
title: "ArtifactIdentity"
description: "ArtifactIdentity — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactIdentity } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                 | Présence | Rôle                                                                                                                                                      |
| ---------- | -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`             | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                 |
| `version`  | `string`             | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change. |
| `encoding` | `"json" \| "binary"` | Requis   | json pour un contrat defineJsonArtifact(), binary pour un contrat defineBinaryArtifact(). Une lecture exige le même encodage.                             |

## Signature

```ts
export interface ArtifactIdentity {
  readonly name: string;
  readonly version: string;
  readonly encoding: "json" | "binary";
}
```
