---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom           | Type      | Présence | Rôle                                                                                           |
| ------------- | --------- | -------- | ---------------------------------------------------------------------------------------------- |
| `head`        | `string`  | Requis   | Commit Git HEAD enregistré par l’inspection ou le snapshot.                                    |
| `branch`      | `string`  | Requis   | Nom de la branche de travail utilisée ou observée pendant l’exécution.                         |
| `fingerprint` | `string`  | Requis   | Empreinte de l’état du checkout hôte utilisée pour détecter des changements pendant la course. |
| `dirty`       | `boolean` | Requis   | Indique si des changements suivis ou non suivis rendent le checkout sale.                      |

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
