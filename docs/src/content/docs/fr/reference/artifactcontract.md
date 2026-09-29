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

| Nom        | Type                                | Présence | Rôle                                                                                                                                                      |
| ---------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `encode`   | `(value: T) => Promise<Uint8Array>` | Requis   | Valide une valeur et renvoie les octets à stocker. Rejette une valeur que le contrat n’accepte pas.                                                       |
| `decode`   | `(bytes: Uint8Array) => Promise<T>` | Requis   | Reconvertit des octets stockés en valeur validée. Rejette des octets que le contrat n’accepte pas.                                                        |
| `name`     | `string`                            | Requis   | Nom du contrat, non vide et de 1024 caractères au maximum. Une lecture exige le même nom.                                                                 |
| `version`  | `string`                            | Requis   | Version du contrat que vous choisissez, non vide et de 1024 caractères au maximum. Une lecture exige la même version : changez-la quand le format change. |
| `encoding` | `"json" \| "binary"`                | Requis   | json pour un contrat defineJsonArtifact(), binary pour un contrat defineBinaryArtifact(). Une lecture exige le même encodage.                             |

## Signature

```ts
export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}
```

## Contrats associés

- [ArtifactIdentity](../artifactidentity/)
