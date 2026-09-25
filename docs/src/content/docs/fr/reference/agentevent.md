---
title: "AgentEvent"
description: "AgentEvent — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentEvent**. Consultez le [guide observabilité](../../guide/agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentEvent } from "@elie-laloum/outpost";
```

## Rôle et comportement

Observer la progression, journaliser l’exécution et comptabiliser l’usage rapporté sans changer les résultats.

Les échecs d’observateurs sont isolés. Les tokens ne sont pas des prix. Le point d’entrée OpenTelemetry optionnel charge son API séparément des imports du cœur.

[Exemple complet et règles détaillées](../../guide/agents/observability/).

## Paramètres et propriétés

| Nom    | Type                                                                                                                                             | Présence | Rôle                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------------- |
| `kind` | `"phase" \| "summary" \| "warning" \| "text" \| "result" \| "prompt" \| "tool" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Requis   | Consultez le contrat lié et les règles de cette famille pour son interprétation. |

## Signature

```ts
export type AgentEvent =
  | {
      readonly kind: "phase";
      readonly name: string;
      readonly agent?: string;
      readonly branch?: string;
      readonly directory?: string;
    }
  | {
      readonly kind: "summary";
      readonly durationMs: number;
      readonly status: number;
      readonly tokens: Usage;
    }
  | {
      readonly kind: "warning";
      readonly message: string;
    }
  | {
      readonly kind: "text";
      readonly text: string;
    }
  | {
      readonly kind: "result";
      readonly text: string;
    }
  | {
      readonly kind: "prompt";
      readonly text: string;
    }
  | {
      readonly kind: "tool";
      readonly name: string;
      readonly input: unknown;
    }
  | {
      readonly kind: "conversation";
      readonly id: string;
    }
  | {
      readonly kind: "usage";
      readonly tokens: Usage;
    }
  | {
      readonly kind: "failure";
      readonly message: string;
    }
  | {
      readonly kind: "finished";
    }
  | {
      readonly kind: "raw";
      readonly value: unknown;
    };
```

## Contrats associés

- [Usage](../usage/)
