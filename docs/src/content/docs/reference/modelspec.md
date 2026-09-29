---
title: "ModelSpec"
description: "ModelSpec — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelSpec } from "@elie-laloum/outpost";
```

## Parameters and properties

The fields below cover all variants; the signature specifies their allowed combinations.

| Name              | Type                          | Presence          | Meaning                                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | `string`                      | Variant-dependent | Nonempty model identifier passed unchanged to the CLI or model service; no local catalog is consulted.                                                                                                                                                       |
| `reasoning`       | `ModelReasoning \| undefined` | Variant-dependent | Reasoning effort; omitted keeps the model default. Claude Code and Codex accept low to max, the Anthropic provider none and low to max, the OpenAI provider any level; other CLIs throw code configuration when the agent is composed.                       |
| `maxOutputTokens` | `number \| undefined`         | Variant-dependent | Positive integer limit on output tokens per model response. Claude Code receives it as CLAUDE_CODE_MAX_OUTPUT_TOKENS, the OpenAI provider sends it with each request and the Anthropic provider requires it; Codex, Antigravity, Copilot and Kimi reject it. |

## Signature

```ts
export type ModelSpec = string | AgentModel;
```

## Related contracts

- [AgentModel](../agentmodel/)
