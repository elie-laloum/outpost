---
title: "SpeculativeHostSnapshot"
description: "SpeculativeHostSnapshot — Outpost API"
sidebar:
  order: 10
---

Contrat public de **SpeculativeHostSnapshot**. Consultez le [guide exécution spéculative](../../workflows/speculation/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { SpeculativeHostSnapshot } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface SpeculativeHostSnapshot {
  readonly head: string;
  readonly branch: string;
  readonly fingerprint: string;
  readonly dirty: boolean;
}
```
