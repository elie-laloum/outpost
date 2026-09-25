---
title: "ReporterOptions"
description: "ReporterOptions — Outpost API"
sidebar:
  order: 10
---

Contrat public de **ReporterOptions**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { ReporterOptions } from "@elie-laloum/outpost";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom       | Type                                    | Présence  | Rôle                                                                             |
| --------- | --------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| `label`   | `string \| undefined`                   | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `verbose` | `boolean \| undefined`                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `quiet`   | `boolean \| undefined`                  | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `write`   | `((text: string) => void) \| undefined` | Optionnel | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export interface ReporterOptions {
  readonly label?: string;
  readonly verbose?: boolean;
  readonly quiet?: boolean;
  readonly write?: (text: string) => void;
}
```
