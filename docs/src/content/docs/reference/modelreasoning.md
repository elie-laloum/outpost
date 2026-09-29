---
title: "ModelReasoning"
description: "ModelReasoning — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { ModelReasoning } from "@elie-laloum/outpost";
```

## Purpose and behavior

Reasoning effort of an AgentModel or ModelRequest. Values, from least to most effort: "none", "minimal", "low", "medium", "high", "xhigh", "max". The executing harness or model provider rejects an unsupported level when the agent is composed: Claude Code and Codex accept "low" to "max", the Anthropic provider every value except "minimal", the OpenAI provider forwards the value as is, and the other CLI agents accept none.

[Complete example and detailed rules](../../guide/choose-an-agent/).

## Signature

```ts
export type ModelReasoning =
  "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";
```
