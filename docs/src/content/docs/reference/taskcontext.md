---
title: "TaskContext"
description: "TaskContext — Outpost API"
sidebar:
  order: 10
---

Public contract for **TaskContext**. See the [workflows guide](../../guide/workflows/graph/) for behavior, defaults and examples.

## Import

```ts
import type { TaskContext } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose tasks with explicit dependency edges and typed result access.

Duplicate keys, missing dependencies and cycles fail validation. Failed or skipped dependencies skip descendants. Retries can repeat external effects. Unwrap throws on a non-successful result.

[Complete example and detailed rules](../../guide/workflows/graph/).

## Parameters and properties

| Name              | Type                                                     | Presence | Meaning                                                                 |
| ----------------- | -------------------------------------------------------- | -------- | ----------------------------------------------------------------------- |
| `signal`          | `AbortSignal`                                            | Required | Cooperative cancellation for this operation.                            |
| `attempt`         | `number`                                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `executionId`     | `string`                                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `reportUsage`     | `(usage: Usage) => void`                                 | Required | See the linked contract and this family's rules for its interpretation. |
| `reportUsageOnce` | `((receipt: string, usage: Usage) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |
| `checkpoint`      | `(() => Promise<void>) \| undefined`                     | Optional | Durable execution storage and replay configuration.                     |
| `value`           | `<T>(dependency: Task<T>) => T`                          | Required | Typed value produced or consumed by this contract.                      |

## Signature

```ts
export interface TaskContext {
  readonly signal: AbortSignal;
  readonly attempt: number;
  readonly executionId: string;
  reportUsage(usage: Usage): void;
  reportUsageOnce?(receipt: string, usage: Usage): void;
  checkpoint?(): Promise<void>;
  value<T>(dependency: Task<T>): T;
}
```

## Related contracts

- [Task](../task/)
- [Usage](../usage/)
