---
title: "UnavailableFault"
description: "UnavailableFault — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { UnavailableFault } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type     | Présence | Rôle                                                                                                                                                                                                     |
| --------- | -------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string` | Requis   | Signal qui a identifié la panne, par exemple HTTP 503, une erreur de flux overloaded ou le texte d’échec reconnu de l’agent ; un délai diagnostiqué comme échec de connexion indique connection failure. |

## Signature

```ts
export interface UnavailableFault {
  /** Terminal signal that identified the agent or model service as unavailable. */
  readonly message: string;
}
```
