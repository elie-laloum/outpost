---
title: "OpenTelemetryOptions"
description: "OpenTelemetryOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **OpenTelemetryOptions**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { OpenTelemetryOptions } from "@elie-laloum/outpost/opentelemetry";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom       | Type                                      | Présence  | Rôle                                                                             |
| --------- | ----------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `tracer`  | `Tracer`                                  | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `meter`   | `Meter`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `onError` | `((error: unknown) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
import type { Meter, Tracer } from "@opentelemetry/api";

export interface OpenTelemetryOptions {
  readonly tracer: Tracer;
  readonly meter: Meter;
  readonly onError?: (error: unknown) => void;
}
```
