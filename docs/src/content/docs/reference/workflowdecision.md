---
title: "WorkflowDecision"
description: "WorkflowDecision — Outpost API"
sidebar:
  order: 10
---

Public contract for **WorkflowDecision**. See the [approval and pause gates guide](../../guide/advanced/approvals/) for behavior, defaults and examples.

## Import

```ts
import type { WorkflowDecision } from "@elie-laloum/outpost";
```

## Purpose and behavior

Persist a pending decision and block dependent work until a trusted caller submits it.

Actor names are trusted metadata, not authentication. Paused runs need no timer. Rejection is final for that run. Invalid decision batches fail before applying any decision.

[Complete example and detailed rules](../../guide/advanced/approvals/).

## Parameters and properties

| Name          | Type                                | Presence | Meaning                                                                 |
| ------------- | ----------------------------------- | -------- | ----------------------------------------------------------------------- |
| `executionId` | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `key`         | `string`                            | Required | Stable task or cache key within its owning contract.                    |
| `requestId`   | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `action`      | `"resume" \| "approve" \| "reject"` | Required | See the linked contract and this family's rules for its interpretation. |
| `actor`       | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |
| `reason`      | `string`                            | Required | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export interface WorkflowDecision {
  readonly executionId: string;
  readonly key: string;
  readonly requestId: string;
  readonly action: "approve" | "resume" | "reject";
  readonly actor: string;
  readonly reason: string;
}
```
