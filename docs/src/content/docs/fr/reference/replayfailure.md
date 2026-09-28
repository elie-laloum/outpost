---
title: "ReplayFailure"
description: "ReplayFailure — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { ReplayFailure } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type        | Présence | Rôle                                                         |
| --------- | ----------- | -------- | ------------------------------------------------------------ |
| `code`    | `FaultCode` | Requis   | Code d’erreur enregistré ; un code inconnu devient process.  |
| `message` | `string`    | Requis   | Message d’erreur enregistré, relancé après le rejeu du tour. |

## Signature

```ts
export interface ReplayFailure {
  readonly code: FaultCode;
  readonly message: string;
}
```

## Contrats associés

- [FaultCode](../faultcode/)
