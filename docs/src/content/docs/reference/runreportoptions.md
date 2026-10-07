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

| Name     | Type                                | Presence | Meaning                                                                                                                                                   |
| -------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format` | `"json" \| "markdown" \| undefined` | Optional | Output serialization: markdown by default, or json for a pretty-printed version-1 RunReport string. An unsupported format throws when report() is called. |

## Signature

```ts
export interface RunReportOptions {
  readonly format?: "markdown" | "json";
}
```
