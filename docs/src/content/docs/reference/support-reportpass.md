---
title: "ReportPass"
description: "ReportPass — Outpost API"
sidebar:
  order: 20
---

Supporting contract used by a public signature. It is not directly exported from the package; use TypeScript inference or the public type that references it.

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name   | Type                  | Presence | Meaning                                                                 |
| ------ | --------------------- | -------- | ----------------------------------------------------------------------- |
| `pass` | `number \| undefined` | Optional | See the linked contract and this family's rules for its interpretation. |

## Signature

```ts
export type ReportPass = {
  readonly pass?: number;
};
```
