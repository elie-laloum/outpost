---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 10
---

Public contract for **reporter**. See the [observability guide](../../guide/agents/observability/) for behavior, defaults and examples.

## Import

```ts
import { reporter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Observe progress, log execution and account for reported usage without changing task outcomes.

Observer failures are isolated. Token counts are not prices. The optional OpenTelemetry entry point loads its vendor API separately from core imports.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name              | Type                                    | Presence | Meaning                                                                                  |
| ----------------- | --------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optional | Configuration object. Its fields are described in the associated options contract below. |
| `options.label`   | `string \| undefined`                   | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.verbose` | `boolean \| undefined`                  | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.quiet`   | `boolean \| undefined`                  | Optional | See the linked contract and this family's rules for its interpretation.                  |
| `options.write`   | `((text: string) => void) \| undefined` | Optional | See the linked contract and this family's rules for its interpretation.                  |

## Returns

`(event: AgentEvent & ReportPass) => void`

## Signature

```ts
export declare function reporter(
  options?: ReporterOptions,
): (event: AgentEvent & ReportPass) => void;
```

## Related contracts

- [AgentEvent](../agentevent/)
- [ReporterOptions](../reporteroptions/)
- [ReportPass](../support-reportpass/)
