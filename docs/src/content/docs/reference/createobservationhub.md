---
title: "createObservationHub"
description: "createObservationHub — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createObservationHub } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a root hub that stamps every event with one shared sequence and delivers a copy to each sink through its own bounded queue. Pass it as observation to a workflow or dispatch: runs emit through scoped children, and you own and close the root. Sink failures and losses are collected, never thrown; the hub stores nothing.

[Complete example and detailed rules](../../guide/observability/).

## Parameters and properties

| Name                        | Type                                      | Presence | Meaning                                                                                                                                                                           |
| --------------------------- | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `ObservationHubOptions \| undefined`      | Optional | Receivers, initial scope, delivery limits and opt-in model payload verbosity.                                                                                                     |
| `options.redact`            | `readonly RegExp[] \| undefined`          | Optional | Regular expressions applied recursively to event strings, keys and scope strings before delivery. Each rule replaces all matches; its lastIndex is preserved.                     |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optional | Receivers attached to this root and inherited by every child.                                                                                                                     |
| `options.scope`             | `ObservationScope \| undefined`           | Optional | Initial correlation fields; child scopes override only explicitly supplied fields.                                                                                                |
| `options.capacity`          | `number \| undefined`                     | Optional | Maximum events waiting per asynchronous sink, default 1024; on overflow the newest are dropped and counted. A value that is not a positive integer throws.                        |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optional | Maximum wait for one asynchronous delivery or sink flush, default 5000; a sink that exceeds it is disabled for the hub’s lifetime. A value that is not a positive integer throws. |
| `options.verbose`           | `boolean \| undefined`                    | Optional | Explicitly allow full model request/response events. Does not enable verbose journal retention by itself.                                                                         |

## Returns

`ObservationHub`

## Signature

```ts
export declare function createObservationHub(
  options?: ObservationHubOptions,
): ObservationHub;
```

## Related contracts

- [ObservationHub](../observationhub/)
- [ObservationHubOptions](../observationhuboptions/)
