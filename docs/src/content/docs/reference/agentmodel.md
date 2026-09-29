---
title: "AgentModel"
description: "AgentModel — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentModel } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                          | Presence | Meaning                                                                                                                                                                                                                                                      |
| ----------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`            | `string`                      | Required | Nonempty model identifier passed unchanged to the CLI or model service; no local catalog is consulted.                                                                                                                                                       |
| `reasoning`       | `ModelReasoning \| undefined` | Optional | Reasoning effort; omitted keeps the model default. Claude Code and Codex accept low to max, the Anthropic provider none and low to max, the OpenAI provider any level; other CLIs throw code configuration when the agent is composed.                       |
| `maxOutputTokens` | `number \| undefined`         | Optional | Positive integer limit on output tokens per model response. Claude Code receives it as CLAUDE_CODE_MAX_OUTPUT_TOKENS, the OpenAI provider sends it with each request and the Anthropic provider requires it; Codex, Antigravity, Copilot and Kimi reject it. |

## Signature

```ts
export interface AgentModel {
  readonly name: string;
  readonly reasoning?: ModelReasoning;
  readonly maxOutputTokens?: number;
}
```

## Related contracts

- [ModelReasoning](../modelreasoning/)
