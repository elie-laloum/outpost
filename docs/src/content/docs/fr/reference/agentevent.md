---
title: "AgentEvent"
description: "AgentEvent — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentEvent**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentEvent } from "@elie-laloum/outpost";
```

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
