---
title: "commandTask"
description: "commandTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **commandTask**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { commandTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function commandTask(
  options: Omit<TaskOptions<CommandResult>, "perform"> & CommandTaskOptions,
): Task<CommandResult>;
```

## Contrats associés

- [CommandResult](../commandresult/)
- [CommandTaskOptions](../support-commandtaskoptions/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
