---
title: "CommandResult"
description: "CommandResult — Outpost API"
sidebar:
  order: 10
---

Contrat public de **CommandResult**. Consultez le [guide commandes et terminal](../../sandboxes/commands/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import type { CommandResult } from "@elie-laloum/outpost";
```

## Signature

```ts
export interface CommandResult {
  readonly status: number;
  readonly stdout: string;
  readonly stderr: string;
}
```
