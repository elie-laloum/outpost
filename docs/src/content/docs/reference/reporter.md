---
title: "reporter"
description: "reporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { reporter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create an agent observation callback that formats progress, warnings and pass summaries for a terminal or custom writer. quiet suppresses all output and verbose includes additional events; reporting does not control execution.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name              | Type                                    | Presence | Meaning                                                           |
| ----------------- | --------------------------------------- | -------- | ----------------------------------------------------------------- |
| `options`         | `ReporterOptions \| undefined`          | Optional | Output label, verbosity, silence mode and optional custom writer. |
| `options.label`   | `string \| undefined`                   | Optional | Human-readable label used in execution reporting.                 |
| `options.verbose` | `boolean \| undefined`                  | Optional | Include detailed agent and tool events in terminal output.        |
| `options.quiet`   | `boolean \| undefined`                  | Optional | Suppress all reporter output, including warnings and failures.    |
| `options.write`   | `((text: string) => void) \| undefined` | Optional | Custom sink for formatted reporter output.                        |

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
