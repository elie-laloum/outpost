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

| Nom       | Type                                      | Présence  | Rôle                                                                                 |
| --------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------------------ |
| `tracer`  | `Tracer`                                  | Requis    | Tracer OpenTelemetry utilisé pour créer les spans d’exécution.                       |
| `meter`   | `Meter`                                   | Requis    | Meter OpenTelemetry utilisé pour enregistrer les métriques d’exécution et de tokens. |
| `onError` | `((error: unknown) => void) \| undefined` | Optionnel | Callback recevant les erreurs isolées de télémétrie ou d’observation.                |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
