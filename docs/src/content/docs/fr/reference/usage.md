---
title: "Usage"
description: "Usage — Outpost API"
sidebar:
  order: 10
---

Contrat public de **Usage**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { Usage } from "@elie-laloum/outpost";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom            | Type                  | Présence  | Rôle                                                                             |
| -------------- | --------------------- | --------- | -------------------------------------------------------------------------------- |
| `input`        | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cached`       | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `cacheCreated` | `number \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `output`       | `number`              | Requis    | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface Usage {
  readonly input: number;
  readonly cached: number;
  readonly cacheCreated?: number;
  readonly output: number;
}
```
