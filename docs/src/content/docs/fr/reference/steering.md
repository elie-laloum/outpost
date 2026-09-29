---
title: "Steering"
description: "Steering — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { Steering } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom     | Type                                                                         | Présence | Rôle                                                                                                                                                                                                                                                                                                        |
| ------- | ---------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state` | `SteeringState`                                                              | Requis   | idle avant et entre les dispatchs, active pendant l’un d’eux, closed après close().                                                                                                                                                                                                                         |
| `send`  | `(text: string, options?: SteeringSendOptions) => Promise<SteeringDelivery>` | Requis   | Met une consigne en file ; sans dispatch en cours, elle attend le suivant. Se résout avec son mode de remise quand l’agent la reçoit. Rejette avec le code configuration pour un texte vide, et avec le code steering si le dispatch ou l’exécution ciblée se termine avant, ou si le contrôleur est fermé. |
| `close` | `() => void`                                                                 | Requis   | Ferme le contrôleur : les consignes en attente et suivantes sont rejetées avec le code steering, et un dispatch qui reçoit ce contrôleur échoue.                                                                                                                                                            |

## Signature

```ts
export interface Steering {
  /** `active` while a dispatch uses the controller, `closed` after close(). */
  readonly state: SteeringState;
  /** Resolves when the agent receives the text; rejects when no dispatch can deliver it. */
  send(text: string, options?: SteeringSendOptions): Promise<SteeringDelivery>;
  /** Rejects undelivered messages and every later send. */
  close(): void;
}
```

## Contrats associés

- [SteeringDelivery](../steeringdelivery/)
- [SteeringSendOptions](../steeringsendoptions/)
- [SteeringState](../steeringstate/)
