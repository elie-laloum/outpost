---
title: "defineHarnessSubagent"
description: "defineHarnessSubagent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { defineHarnessSubagent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Define a serialized tool that runs a built-in child agent with a fresh history in the parent’s borrowed sandbox. The parent supplies { prompt }; the result is JSON text containing text and an optional conversation identifier. Child tokens count once toward dispatch and every ancestor budget; cancellation and declarative permissions propagate. The tool cannot execute outside the harness runtime.

[Complete example and detailed rules](../../guide/subagents/).

## Parameters and properties

| Name                  | Type                     | Presence | Meaning                                                                                                                                              |
| --------------------- | ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessSubagentOptions` | Required | Name, model-visible description and explicitly composed built-in child agent. Defining the tool does not run it.                                     |
| `options.name`        | `string`                 | Required | Unique tool name exposed to the parent model, using 1–64 letters, digits, underscores or hyphens.                                                    |
| `options.description` | `string`                 | Required | Explain when the parent should delegate to this child; sent with the tool schema.                                                                    |
| `options.agent`       | `CustomAgent`            | Required | Built-in agent created with createAgent({ harness: createHarness(...), model }); owns child instructions, tools and limits. CLI agents are rejected. |

## Returns

`HarnessSubagent`

## Signature

```ts
export declare function defineHarnessSubagent(
  options: HarnessSubagentOptions,
): HarnessSubagent;
```

## Related contracts

- [HarnessSubagent](../harnesssubagent/)
- [HarnessSubagentOptions](../harnesssubagentoptions/)
