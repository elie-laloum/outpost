---
title: "createReporter"
description: "createReporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createReporter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a callable observer with typed event handlers and an explicit flush barrier. Handlers run serially without blocking dispatch; failures are reported through onError and the first remains observable through every flush. The caller owns files, loggers and their shutdown.

[Complete example and detailed rules](../../guide/agents/observability/).

## Parameters and properties

| Name              | Type                                                                                | Presence | Meaning                                                                                                                                                     |
| ----------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlers`        | `ReporterHandlers`                                                                  | Required | Optional handlers keyed by agent event kind, executed serially in arrival order; omitted kinds are ignored.                                                 |
| `options`         | `CustomReporterOptions \| undefined`                                                | Optional | Error diagnostics for the custom reporter; no terminal output or resource ownership is added.                                                               |
| `options.onError` | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optional | Called for each failed handler with its error and event; diagnostic failures are isolated and the first handler failure remains observable through flush(). |

## Returns

`CustomReporter`

## Signature

```ts
export declare function createReporter(
  handlers: ReporterHandlers,
  options?: CustomReporterOptions,
): CustomReporter;
```

## Related contracts

- [CustomReporter](../customreporter/)
- [CustomReporterOptions](../customreporteroptions/)
- [ReporterHandlers](../reporterhandlers/)
