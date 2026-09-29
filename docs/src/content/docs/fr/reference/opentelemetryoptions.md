---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { OpenTelemetryOptions } from "@elie-laloum/outpost/opentelemetry";
```

## Paramètres et propriétés

| Nom       | Type                                      | Présence  | Rôle                                                                                                                                                                                                              |
| --------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tracer`  | `Tracer`                                  | Requis    | Tracer OpenTelemetry utilisé pour créer les spans d’exécution.                                                                                                                                                    |
| `meter`   | `Meter`                                   | Requis    | Meter OpenTelemetry pour les compteurs d’exécutions, histogrammes de durée et compteurs de tokens d’Outpost (outpost.workflow._, outpost.task._, outpost.dispatch.*, outpost.agent.tokens).                       |
| `onError` | `((error: unknown) => void) \| undefined` | Optionnel | Reçoit les erreurs levées par le tracer ou le meter pendant l’enregistrement des workflows et des dispatchs ; elles ne changent jamais le résultat d’une exécution. Les erreurs levées par onError sont ignorées. |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
