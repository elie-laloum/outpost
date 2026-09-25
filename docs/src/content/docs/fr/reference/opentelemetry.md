---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
```

## Rôle et comportement

Crée une instrumentation de workflow et de dispatch complet à partir d’un tracer et d’un meter injectés. Passez le résultat dans telemetry à workflow.start ou dispatch, en gardant observe pour les handlers personnalisés. Le branchement observe existant du workflow reste pris en charge. Les erreurs sont isolées via onError ; close termine les spans ouverts sans vider ni fermer le SDK. Seul ce point d’entrée optionnel charge OpenTelemetry.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom               | Type                                      | Présence  | Rôle                                                                                              |
| ----------------- | ----------------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Requis    | Tracer, meter et callback d’erreur isolée injectés pour la télémétrie des workflows et dispatchs. |
| `options.tracer`  | `Tracer`                                  | Requis    | Tracer OpenTelemetry utilisé pour créer les spans d’exécution.                                    |
| `options.meter`   | `Meter`                                   | Requis    | Meter OpenTelemetry utilisé pour enregistrer les métriques d’exécution et de tokens.              |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optionnel | Callback recevant les erreurs isolées de télémétrie ou d’observation.                             |

## Retour

`OpenTelemetryObserver`

## Signature

```ts
export declare function openTelemetry(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver;
```

## Contrats associés

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
