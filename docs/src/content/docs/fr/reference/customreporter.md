---
title: "CustomReporter"
description: "CustomReporter — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { CustomReporter } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom       | Type                                                  | Présence | Rôle                                                                                                                                                     |
| --------- | ----------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `event`   | `AgentObservation`                                    | Requis   | Observation agent normalisée à mettre en file ; retourne immédiatement sans attendre son handler.                                                        |
| `flush`   | `() => Promise<void>`                                 | Requis   | Attend les événements reçus avant cet appel ; rejette la première erreur de handler, y compris aux appels suivants, sans fermer les ressources externes. |
| `observe` | `(observation: Observation) => void \| Promise<void>` | Requis   | Reçoit une enveloppe ; les promesses retournées sont sérialisées par récepteur et leurs rejets sont isolés de l’exécution.                               |

## Signature

```ts
export interface CustomReporter extends ObservationSink {
  (event: AgentObservation): void;
  flush(): Promise<void>;
}
```

## Contrats associés

- [AgentObservation](../agentobservation/)
- [ObservationSink](../observationsink/)
