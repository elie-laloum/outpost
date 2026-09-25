---
title: "openTelemetry"
description: "openTelemetry — Outpost API"
sidebar:
  order: 10
---

Contrat public de **openTelemetry**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { openTelemetry } from "@elie-laloum/outpost/opentelemetry";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom               | Type                                      | Présence  | Rôle                                                                                          |
| ----------------- | ----------------------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `options`         | `OpenTelemetryOptions`                    | Requis    | Objet de configuration. Ses champs sont décrits dans le contrat d’options associé ci-dessous. |
| `options.tracer`  | `Tracer`                                  | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.meter`   | `Meter`                                   | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |
| `options.onError` | `((error: unknown) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation.              |

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
