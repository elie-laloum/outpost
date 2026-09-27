---
title: "CustomReporterOptions"
description: "CustomReporterOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomReporterOptions } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom                 | Type                                                                                | Présence  | Rôle                                                                                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `capacity`          | `number \| undefined`                                                               | Optionnel | Maximum d’événements en attente dans le reporter, 1024 par défaut ; la saturation perd les nouvelles livraisons et fait rejeter flush.                            |
| `deliveryTimeoutMs` | `number \| undefined`                                                               | Optionnel | Attente maximale d’un gestionnaire asynchrone en millisecondes, 5000 par défaut ; le dépassement désactive les livraisons suivantes et fait rejeter flush.        |
| `onError`           | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optionnel | Appelé pour chaque handler en échec avec son erreur et son événement ; les erreurs du diagnostic sont isolées et la première erreur reste accessible via flush(). |

## Signature

```ts
export interface CustomReporterOptions {
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly onError?: (
    error: unknown,
    event: AgentObservation,
  ) => void | Promise<void>;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
