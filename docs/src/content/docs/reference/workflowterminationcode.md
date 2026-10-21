---
title: "WorkflowTerminationCode"
description: "WorkflowTerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowTerminationCode } from "@elie-laloum/outpost/workflows";
```

## Purpose and behavior

Reason for an unsuccessful workflow termination, exposed on WorkflowResult, finish events and WorkflowFailure.code. Uses FaultCode, failed for unclassified errors and usage-unavailable for incomplete budget accounting. Successful and suspended runs have no termination code. Compatibility name for the shared TerminationCode type.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Signature

```ts
export type WorkflowTerminationCode = TerminationCode;
```

## Related contracts

- [TerminationCode](../terminationcode/)
