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

| Nom        | Type                 | Présence | Rôle                                                                                                                                |
| ---------- | -------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `name`     | `string`             | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `version`  | `string`             | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |
| `encoding` | `"json" \| "binary"` | Requis   | Représentation des données exigée par le contrat d’artefact : json ou binary.                                                       |

## Signature

```ts
export interface ArtifactIdentity {
  readonly name: string;
  readonly version: string;
  readonly encoding: "json" | "binary";
}
```
