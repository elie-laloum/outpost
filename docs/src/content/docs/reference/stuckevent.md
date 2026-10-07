---
title: "StuckEvent"
description: "StuckEvent — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { StuckEvent } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name       | Type                          | Presence | Meaning                                                                                             |
| ---------- | ----------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `kind`     | `"stuck"`                     | Required | Always stuck: Outpost detected repeated decoded activity.                                           |
| `activity` | `"tool" \| "file-change"`     | Required | Repeated decoded event category: tool or file-change.                                               |
| `name`     | `string \| undefined`         | Optional | Tool name when activity is tool; absent for file-change. Inputs and file payloads are not included. |
| `repeats`  | `number`                      | Required | Occurrences of the matching activity when the configured threshold was reached.                     |
| `window`   | `number`                      | Required | Configured maximum number of decoded activity events in the sliding window.                         |
| `action`   | `"stop" \| "warn" \| "steer"` | Required | Selected policy action: stop, warn or steer. An exhausted instruction allowance selects stop.       |

## Signature

```ts
export interface StuckEvent {
  readonly kind: "stuck";
  readonly activity: "tool" | "file-change";
  readonly name?: string;
  readonly repeats: number;
  readonly window: number;
  readonly action: "stop" | "warn" | "steer";
}
```
