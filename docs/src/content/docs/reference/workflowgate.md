---
title: "WorkflowGate"
description: "WorkflowGate — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowGate**. See the [approval and pause gates guide](../../guide/advanced/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowGate } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist a pending decision and block dependent work until a trusted caller submits it.

Actor names are trusted metadata, not authentication. Paused runs need no timer. Rejection is final for that run. Invalid decision batches fail before applying any decision.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name     | Type                    | Presence | Meaning                                                                 |
| -------- | ----------------------- | -------- | ----------------------------------------------------------------------- |
| `kind`   | `"approval" \| "pause"` | Required | See the linked contract and this family's rules for its interpretation. |
| `prompt` | `string`                | Required | Human-readable instruction presented at this boundary.                  |
| `actors` | `readonly string[]`     | Required | Trusted actor identifiers, not an authentication mechanism.             |

## Signature

```ts
export interface WorkflowGate {
  readonly kind: "approval" | "pause";
  readonly prompt: string;
  readonly actors: readonly string[];
}
```
