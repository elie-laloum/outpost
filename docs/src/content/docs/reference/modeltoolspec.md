---
title: "ModelToolSpec"
description: "ModelToolSpec — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change in a later release.
:::

## Import

```ts
import type { ModelToolSpec } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name          | Type                                | Presence | Meaning                                                              |
| ------------- | ----------------------------------- | -------- | -------------------------------------------------------------------- |
| `name`        | `string`                            | Required | Unique tool name of 1 to 64 letters, digits, underscores or hyphens. |
| `description` | `string`                            | Required | Explanation the model reads to decide when and how to call the tool. |
| `inputSchema` | `Readonly<Record<string, unknown>>` | Required | JSON Schema object describing the tool arguments.                    |

## Signature

```ts
export interface ModelToolSpec {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Readonly<Record<string, unknown>>;
}
```
