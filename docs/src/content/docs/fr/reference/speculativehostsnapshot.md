---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost/experimental/speculation";
```

## Paramètres et propriétés

| Nom           | Type      | Présence | Rôle                                                                                                                              |
| ------------- | --------- | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `head`        | `string`  | Requis   | Commit HEAD du checkout.                                                                                                          |
| `branch`      | `string`  | Requis   | Nom de la branche courante, ou HEAD si le checkout est détaché.                                                                   |
| `fingerprint` | `string`  | Requis   | SHA-256 du HEAD, du diff non commité et des fichiers non suivis, comparé d’un snapshot à l’autre pour détecter des modifications. |
| `dirty`       | `boolean` | Requis   | Vrai si des changements suivis ou non suivis existent hors de .outpost.                                                           |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
