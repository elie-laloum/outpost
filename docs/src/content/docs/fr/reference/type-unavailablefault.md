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

| Nom       | Type     | Présence | Rôle                                                                                                                                                                                                                                                 |
| --------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `message` | `string` | Requis   | Le signal details.unavailable : HTTP &lt;status>, HTTP transport failure, un type d’erreur de flux de modèle, le texte d’échec reconnu par l’adapter de l’agent, ou connection failure pour un délai dépassé après un échec de connexion de l’agent. |

## Signature

```ts
export interface UnavailableFault {
  /** Terminal signal that identified the agent or model service as unavailable. */
  readonly message: string;
}
```
