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

Create an explicitly scoped event distributor with one sequence across children, bounded independent sink queues, snapshot flushing and isolated delivery failures. Supply it through observation on a workflow or dispatch; the caller owns the parent hub. This is live observation, not a durable state registry or remote worker relay.

[Complete example and detailed rules](../../guide/observability/).

## Parameters and properties

| Name                        | Type                                      | Presence | Meaning                                                                                                               |
| --------------------------- | ----------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `options`                   | `ObservationHubOptions \| undefined`      | Optional | Optional receivers, initial scope, delivery limits and opt-in model payload verbosity.                                |
| `options.sinks`             | `readonly ObservationSink[] \| undefined` | Optional | Receivers attached to this root and inherited by every child.                                                         |
| `options.scope`             | `ObservationScope \| undefined`           | Optional | Initial correlation fields; child scopes override only explicitly supplied fields.                                    |
| `options.capacity`          | `number \| undefined`                     | Optional | Maximum waiting envelopes per asynchronous sink, default 1024; newest deliveries are dropped on overflow and counted. |
| `options.deliveryTimeoutMs` | `number \| undefined`                     | Optional | Maximum asynchronous delivery or receiver-flush wait, default 5000 ms; an expired receiver is disabled.               |
| `options.verbose`           | `boolean \| undefined`                    | Optional | Explicitly allow full model request/response events. Does not enable verbose journal retention by itself.             |

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
