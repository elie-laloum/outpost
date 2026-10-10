---
title: "createAgent"
description: "createAgent — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAgent } from "@elie-laloum/outpost";
```

## Purpose and behavior

Compose a harness and a model into a frozen agent, without starting a process or making a network request. A reasoning level or maxOutputTokens the harness cannot apply throws code configuration at once. Without a model, a CLI harness keeps its native default; the built-in harness throws.

[Complete example and detailed rules](../../guide/choose-an-agent/).

## Parameters and properties

### Variant 1 — `CliAgentOptions`

| Name              | Type                     | Presence | Meaning                                                                                                                                                                                                                                     |
| ----------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CliAgentOptions`        | Required | Harness and model selection to bind into one executable agent.                                                                                                                                                                              |
| `options.harness` | `CliHarness`             | Required | CLI preset, such as createCodexHarness(), bound to model when the agent is created.                                                                                                                                                         |
| `options.model`   | `ModelSpec \| undefined` | Optional | Model name or { name, reasoning, maxOutputTokens }; the preset rejects unsupported reasoning or maxOutputTokens here. Omitted, the CLI uses its default model, except that Kimi usage authentication and a Codex modelProvider require one. |

### Variant 2 — `CustomAgentOptions`

| Name              | Type                 | Presence | Meaning                                                                                                                                                                          |
| ----------------- | -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `CustomAgentOptions` | Required | Harness and model selection to bind into one executable agent.                                                                                                                   |
| `options.harness` | `Harness`            | Required | Built-in Outpost harness with its configured model provider.                                                                                                                     |
| `options.model`   | `ModelSpec`          | Required | Model name or { name, reasoning, maxOutputTokens }. The model provider rejects unsupported reasoning or output limits here; the service checks the model name when it is called. |

### Variant 3 — `AgentOptions`

The fields below cover all variants; the signature specifies their allowed combinations.

| Name              | Type                                  | Presence          | Meaning                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`         | `AgentOptions`                        | Required          | Harness and model selection to bind into one executable agent.                                                                                                                                                                              |
| `options.harness` | `CliHarness \| Harness`               | Required          | CLI preset, such as createCodexHarness(), bound to model when the agent is created.                                                                                                                                                         |
| `options.model`   | `ModelSpec \| undefined \| ModelSpec` | Variant-dependent | Model name or { name, reasoning, maxOutputTokens }; the preset rejects unsupported reasoning or maxOutputTokens here. Omitted, the CLI uses its default model, except that Kimi usage authentication and a Codex modelProvider require one. |

## Returns

`CliAgent` · `CustomAgent` · `Agent`

## Signature

```ts
export declare function createAgent(options: CliAgentOptions): CliAgent;

export declare function createAgent(options: CustomAgentOptions): CustomAgent;

export declare function createAgent(options: AgentOptions): Agent;
```

## Related contracts

- [Agent](../type-agent/)
- [AgentOptions](../agentoptions/)
- [CliAgent](../cliagent/)
- [CliAgentOptions](../support-cliagentoptions/)
- [CustomAgent](../customagent/)
- [CustomAgentOptions](../support-customagentoptions/)
