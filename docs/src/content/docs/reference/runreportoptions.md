---
title: "RunReportOptions"
description: "RunReportOptions — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { RunReportOptions } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name     | Type                                | Presence | Meaning                                                                                                                                                                              |
| -------- | ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format` | `"json" \| "markdown" \| undefined` | Optional | Output serialization: markdown or json. Git reports default to Markdown (version 1); file reports default to JSON (version 2). An unsupported format throws when report() is called. |

## Signature

```ts
export interface RunReportOptions {
  readonly format?: "markdown" | "json";
}
```
