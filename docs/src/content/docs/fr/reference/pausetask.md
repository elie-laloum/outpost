---
title: "pauseTask"
description: "pauseTask — Outpost API"
sidebar:
  order: 10
---

Contrat public de **pauseTask**. Consultez le [guide approbations et pauses](../../workflows/approvals/) pour le comportement, les valeurs par défaut et des exemples.

## Import

```ts
import { pauseTask } from "@elie-laloum/outpost";
```

## Signature

```ts
export declare function pauseTask(
  options: WorkflowGateOptions,
): Task<WorkflowDecisionRecord>;
```

## Contrats associés

- [Task](../task/)
- [WorkflowDecisionRecord](../workflowdecisionrecord/)
- [WorkflowGateOptions](../workflowgateoptions/)
