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

| Name              | Type                          | Presence | Meaning                                                                                                                                                                                     |
| ----------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                      | Required | Nonempty model identifier passed unchanged to the CLI or model service; no local catalog is consulted.                                                                                      |
| `reasoning`       | `ModelReasoning \| undefined` | Optional | Optional reasoning effort. Each harness or provider accepts only the levels it can express and rejects the others when the agent is composed; omission keeps the model default.             |
| `maxOutputTokens` | `number \| undefined`         | Optional | Optional positive output-token limit for each model response. Claude Code receives it as CLAUDE_CODE_MAX_OUTPUT_TOKENS; Codex and Gemini CLI reject it; the Anthropic provider requires it. |

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
