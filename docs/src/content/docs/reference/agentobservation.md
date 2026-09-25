---
title: "AgentObservation"
description: "AgentObservation — Outpost API"
sidebar:
  order: 10
---

Public contract for **AgentObservation**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import type { AgentObservation } from "@elie-laloum/outpost";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name   | Type                                                                                                                                             | Presence | Meaning                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------------------------------------------------------- |
| `kind` | `"phase" \| "summary" \| "warning" \| "text" \| "result" \| "prompt" \| "tool" \| "conversation" \| "usage" \| "failure" \| "finished" \| "raw"` | Required | See the linked contract and this family's rules for its interpretation. |
| `pass` | `number`                                                                                                                                         | Required | See the linked contract and this family's rules for its interpretation. |
| `at`   | `string`                                                                                                                                         | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type AgentObservation = AgentEvent & {
  readonly pass: number;
  readonly at: string;
};
```

## Related contracts

- [AgentEvent](../agentevent/)
