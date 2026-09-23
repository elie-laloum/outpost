---
title: "AttachResult"
description: "AttachResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **AttachResult**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { AttachResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface AttachResult extends CommandResult, Disposal {
  readonly commits: readonly Commit[];
  readonly branch: string;
  readonly directory: string;
}
```

## Contrats associés

- [CommandResult](../commandresult/)
- [Commit](../commit/)
- [Disposal](../disposal/)
