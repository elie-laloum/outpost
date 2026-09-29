---
title: "createCustomReporter"
description: "createCustomReporter — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createCustomReporter } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a callable observer with typed event handlers and an explicit flush barrier. Handlers run serially without blocking dispatch; failures are reported through onError and the first remains observable through every flush. The caller owns files, loggers and their shutdown.

[Complete example and detailed rules](../../guide/progress/).

## Parameters and properties

| Name                        | Type                                                                                | Presence | Meaning                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlers`                  | `ReporterHandlers`                                                                  | Required | Optional handlers keyed by agent event kind, executed serially in arrival order; omitted kinds are ignored.                                                 |
| `options`                   | `CustomReporterOptions \| undefined`                                                | Optional | Error diagnostics for the custom reporter; no terminal output or resource ownership is added.                                                               |
| `options.capacity`          | `number \| undefined`                                                               | Optional | Maximum waiting events in the reporter queue, default 1024; overflow drops newest deliveries and makes flush reject.                                        |
| `options.deliveryTimeoutMs` | `number \| undefined`                                                               | Optional | Maximum asynchronous handler wait in milliseconds, default 5000; timeout disables further deliveries and makes flush reject.                                |
| `options.onError`           | `((error: unknown, event: AgentObservation) => void \| Promise<void>) \| undefined` | Optional | Called for each failed handler with its error and event; diagnostic failures are isolated and the first handler failure remains observable through flush(). |

## Returns

`CustomReporter`

## Signature

```ts
export declare function createCustomReporter(
  handlers: ReporterHandlers,
  options?: CustomReporterOptions,
): CustomReporter;
```

## Related contracts

- [CustomReporter](../customreporter/)
- [CustomReporterOptions](../customreporteroptions/)
- [ReporterHandlers](../reporterhandlers/)
