---
title: "OpenTelemetryObserver"
description: "OpenTelemetryObserver — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Paramètres et propriétés

| Nom       | Type                             | Présence | Rôle                                                                        |
| --------- | -------------------------------- | -------- | --------------------------------------------------------------------------- |
| `observe` | `(event: WorkflowEvent) => void` | Requis   | Convertit un événement de workflow en spans et métriques de télémétrie.     |
| `close`   | `() => void`                     | Requis   | Termine les spans d’exécution encore ouverts appartenant à cet observateur. |

## Signature

```ts
export interface OpenTelemetryObserver {
  observe(event: WorkflowEvent): void;
  close(): void;
}
```

## Contrats associés

- [WorkflowEvent](../workflowevent/)
