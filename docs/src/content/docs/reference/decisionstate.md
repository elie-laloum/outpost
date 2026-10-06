---
title: "DecisionState"
description: "DecisionState — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { DecisionState } from "@elie-laloum/outpost";
```

## Purpose and behavior

Top-level text, JSON array or JSON object used as decision input. Runtime validation rejects serialization that loses or changes values.

[Complete example and detailed rules](../../guide/decisions/).

## Signature

```ts
export type DecisionState =
  | string
  | readonly WorkflowJson[]
  | {
      readonly [key: string]: WorkflowJson;
    };
```

## Related contracts

- [WorkflowJson](../workflowjson/)
