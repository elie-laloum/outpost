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

| Name              | Type                          | Presence          | Meaning                                                                                                                                                                                     |
| ----------------- | ----------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | `string`                      | Variant-dependent | Nonempty model identifier passed unchanged to the CLI or model service; no local catalog is consulted.                                                                                      |
| `reasoning`       | `ModelReasoning \| undefined` | Variant-dependent | Optional reasoning effort. Each harness or provider accepts only the levels it can express and rejects the others when the agent is composed; omission keeps the model default.             |
| `maxOutputTokens` | `number \| undefined`         | Variant-dependent | Optional positive output-token limit for each model response. Claude Code receives it as CLAUDE_CODE_MAX_OUTPUT_TOKENS; Codex and Gemini CLI reject it; the Anthropic provider requires it. |

## Signature

```ts
export type ModelSpec = string | AgentModel;
```

## Related contracts

- [AgentModel](../agentmodel/)
