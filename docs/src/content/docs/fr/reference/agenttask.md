---
title: "agentTask"
description: "agentTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **agentTask**. Consultez le [guide workflows](../../workflows/graph/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { agentTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function agentTask<T>(
  options: Omit<TaskOptions<DispatchResult<T>>, "perform"> &
    AgentTaskOptions<T>,
): Task<DispatchResult<T>>;
```

## Contrats associés

- [AgentTaskOptions](../support-agenttaskoptions/)
- [DispatchResult](../dispatchresult/)
- [Task](../task/)
- [TaskOptions](../taskoptions/)
