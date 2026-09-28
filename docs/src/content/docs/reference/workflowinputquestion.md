---
title: "WorkflowInputQuestion"
description: "WorkflowInputQuestion — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { WorkflowInputQuestion } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name            | Type                             | Presence | Meaning                                                                                   |
| --------------- | -------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| `question`      | `string`                         | Required | Nonempty human-readable question to display to the respondent.                            |
| `choices`       | `readonly string[] \| undefined` | Optional | Optional nonempty list of unique answer choices.                                          |
| `allowFreeText` | `boolean \| undefined`           | Optional | Whether answers outside choices are accepted; omitted means true. False requires choices. |

## Signature

```ts
export interface WorkflowInputQuestion {
  readonly question: string;
  readonly choices?: readonly string[];
  readonly allowFreeText?: boolean;
}
```
