---
title: "AgentObservation"
description: "AgentObservation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentObservation**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentObservation } from "@elie-laloum/outpost";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom    | Type                                                                                                                                             | Présence | Rôle                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `kind` | `"phase" \| "summary" \| "warning" \| "text" \| "result" \| "prompt" \| "tool" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `pass` | `number`                                                                                                                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |
| `at`   | `string`                                                                                                                                         | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
};
```

## Contrats associés

- [AgentEvent](../agentevent/)
