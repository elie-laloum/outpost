---
title: "AgentObservation"
description: "AgentObservation — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AgentObservation**. Consultez le [guide observabilité](../../agents/observability/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AgentObservation } from "@elie-laloum/outpost";
```

## Signature

```ts
export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
};
```

## Contrats associés

- [AgentEvent](../agentevent/)
