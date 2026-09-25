---
title: "ArtifactContract"
description: "ArtifactContract — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ArtifactContract } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom        | Type                                | Présence | Rôle                                                                                                                                |
| ---------- | ----------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Requis   | Valide et sérialise une valeur typée en octets d’artefact immuables.                                                                |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Requis   | Décode les octets stockés et les valide comme valeur typée du contrat.                                                              |
| `name`     | `string`                            | Requis   | Nom non vide du contrat d’artefact, de 1024 caractères au maximum.                                                                  |
| `version`  | `string`                            | Requis   | Version de contrat non vide définie par l’appelant, de 1024 caractères au maximum ; les lectures exigent une correspondance exacte. |
| `encoding` | `"json" \| "binary"`                | Requis   | Représentation des données exigée par le contrat d’artefact : json ou binary.                                                       |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
