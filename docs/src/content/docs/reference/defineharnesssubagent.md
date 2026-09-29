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

Define a tool that runs a built-in child agent, with a fresh history, in the parent's borrowed sandbox. The parent model sends { prompt }; the tool returns JSON text with the child's text and conversation identifier, and a child failure is handled like any tool error. Child tokens count toward the dispatch usage and every ancestor budget, and ancestor permissions also apply to child tools.

[Complete example and detailed rules](../../guide/subagents/).

## Parameters and properties

| Name                  | Type                     | Presence | Meaning                                                                                                                                                                                       |
| --------------------- | ------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`             | `HarnessSubagentOptions` | Required | Tool name, description shown to the parent model and built-in child agent. Unknown keys are rejected.                                                                                         |
| `options.name`        | `string`                 | Required | Unique tool name exposed to the parent model, using 1–64 letters, digits, underscores or hyphens.                                                                                             |
| `options.description` | `string`                 | Required | Tells the parent model when to delegate to this child; sent with the tool schema.                                                                                                             |
| `options.agent`       | `CustomAgent`            | Required | Built-in agent from createAgent({ harness: createHarness(…), model }) that supplies the child's instructions, tools, limits and permissions. A CLI agent is rejected with code configuration. |

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
