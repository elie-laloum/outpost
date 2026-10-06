---
title: "WorkflowTerminationCode"
description: "WorkflowTerminationCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { WorkflowTerminationCode } from "@elie-laloum/outpost";
```

## Purpose and behavior

Reason for an unsuccessful workflow termination, exposed on WorkflowResult, finish events and WorkflowFailure.code. Uses FaultCode, failed for unclassified errors and usage-unavailable for incomplete budget accounting. Successful and suspended runs have no termination code.

[Complete example and detailed rules](../../guide/task-dependencies/).

## Signature

```ts
export type WorkflowTerminationCode =
  FaultCode | "failed" | "usage-unavailable";
```

## Related contracts

- [FaultCode](../faultcode/)
