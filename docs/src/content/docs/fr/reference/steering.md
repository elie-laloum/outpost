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

| Nom     | Type                                                                         | Présence | Rôle                                                                                                                                                                                                                                                                                                                                                                                        |
| ------- | ---------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `state` | `SteeringState`                                                              | Requis   | idle lorsqu’aucun dispatch n’utilise le contrôleur, active pendant qu’un dispatch l’utilise, closed après close().                                                                                                                                                                                                                                                                          |
| `send`  | `(text: string, options?: SteeringSendOptions) => Promise<SteeringDelivery>` | Requis   | Met en file une consigne non vide pour le dispatch attaché, ou le suivant si aucun ne tourne, éventuellement adressée à une exécution de sous-agent intégré ou à la boucle principale. Se résout avec sa remise dès que l’agent la reçoit ; rejette avec le code steering si le dispatch ou l’exécution visée se termine avant, si la cible est inaccessible ou si le contrôleur est fermé. |
| `close` | `() => void`                                                                 | Requis   | Ferme le contrôleur : rejette les consignes non remises et tout send() ultérieur ; les dispatchs suivants le refusent.                                                                                                                                                                                                                                                                      |

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
