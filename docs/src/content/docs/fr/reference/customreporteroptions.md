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

| Nom       | Type                                                                                | Présence  | Rôle                                                                                                                                                              |
| --------- | ----------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onError` | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optionnel | Appelé pour chaque handler en échec avec son erreur et son événement ; les erreurs du diagnostic sont isolées et la première erreur reste accessible via flush(). |

## Signature

```ts
export interface CustomReporterOptions {
  readonly onError?: (
    error: unknown,
    event: AgentObservation,
  ) => void | Promise<void>;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
