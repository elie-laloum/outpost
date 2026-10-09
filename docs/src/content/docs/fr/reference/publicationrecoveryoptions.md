---
title: "PublicationRecoveryOptions"
description: "PublicationRecoveryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { PublicationRecoveryOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                | Type                | Présence  | Rôle                                                                                                                        |
| ------------------ | ------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `processesStopped` | `true \| undefined` | Optionnel | Attestation explicite d’arrêt du précédent propriétaire et de ses processus ; jamais déduite d’une expiration de heartbeat. |

## Signature

```ts
export interface PublicationRecoveryOptions {
  readonly processesStopped?: true;
}
```
