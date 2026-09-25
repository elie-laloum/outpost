---
title: "harness"
description: "harness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { harness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a caller-supplied execution callback backed by a model provider. The callback runs in the Outpost process and uses the supplied sandbox for repository operations. No tool loop, native conversation storage or interactive terminal is provided.

[Complete example and detailed rules](../../guide/agents/adapters/).

## Parameters and properties

| Name                    | Type                   | Presence | Meaning                                                                                                                                  |
| ----------------------- | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `options`               | `CustomHarnessOptions` | Required | Model provider and callback owned by this custom harness configuration.                                                                  |
| `options.modelProvider` | `ModelProvider`        | Required | Reusable request transport used by the execution callback; no model catalog is imposed.                                                  |
| `options.run`           | `HarnessRun`           | Required | Caller implementation returning text and optional usage. It must cooperate with cancellation and await its sandbox and model operations. |

## Returns

`CustomHarness`

## Signature

```ts
export declare function harness(options: CustomHarnessOptions): CustomHarness;
```

## Related contracts

- [CustomHarness](../type-customharness/)
- [CustomHarnessOptions](../customharnessoptions/)
