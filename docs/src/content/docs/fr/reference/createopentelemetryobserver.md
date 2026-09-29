---
title: "createOpenTelemetryObserver"
description: "createOpenTelemetryObserver — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOpenTelemetryObserver } from "@elie-laloum/outpost/opentelemetry";
```

## Rôle et comportement

Crée une instrumentation OpenTelemetry à partir de votre tracer et de votre meter. Attachez son sink au hub passé dans observation pour obtenir des spans de workflow, de tâche, de dispatch et d’opération reliés entre eux, ou passez l’observateur comme telemetry à workflow.start() ou dispatch(). Les erreurs d’instrumentation vont à onError ; close() termine les spans ouverts sans vider ni arrêter le SDK.

[Exemple complet et règles détaillées](../../guide/observability/).

## Paramètres et propriétés

| Nom               | Type                                      | Présence  | Rôle                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Requis    | Tracer, meter et callback d’erreur isolée injectés pour la télémétrie des workflows et dispatchs.                                                                                                                 |
| `options.tracer`  | `Tracer`                                  | Requis    | Tracer OpenTelemetry utilisé pour créer les spans d’exécution.                                                                                                                                                    |
| `options.meter`   | `Meter`                                   | Requis    | Meter OpenTelemetry pour les compteurs d’exécutions, histogrammes de durée et compteurs de tokens d’Outpost (outpost.workflow._, outpost.task._, outpost.dispatch.*, outpost.agent.tokens).                       |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optionnel | Reçoit les erreurs levées par le tracer ou le meter pendant l’enregistrement des workflows et des dispatchs ; elles ne changent jamais le résultat d’une exécution. Les erreurs levées par onError sont ignorées. |

## Retour

`OpenTelemetryObserver`

## Signature

```ts
export declare function createOpenTelemetryObserver(
  options: OpenTelemetryOptions,
): OpenTelemetryObserver;
```

## Contrats associés

- [OpenTelemetryObserver](../opentelemetryobserver/)
- [OpenTelemetryOptions](../opentelemetryoptions/)
