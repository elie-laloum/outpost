---
title: "SteeringDelivery"
description: "SteeringDelivery — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SteeringDelivery } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom    | Type           | Présence | Rôle                                                                                                                                                       |
| ------ | -------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode` | `SteeringMode` | Requis   | injected lorsque la consigne a rejoint le tour en cours ou son prompt ; resumed lorsqu’Outpost a poursuivi la conversation dans un nouveau tour avec elle. |

## Signature

```ts
export interface SteeringDelivery {
  /** `injected` joined the running turn; `resumed` continued the conversation in a new turn. */
  readonly mode: SteeringMode;
}
```

## Contrats associés

- [SteeringMode](../steeringmode/)
