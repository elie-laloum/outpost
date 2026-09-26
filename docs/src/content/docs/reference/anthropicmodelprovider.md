---
title: "anthropicModelProvider"
description: "anthropicModelProvider — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change before release.
:::

## Import

```ts
import { anthropicModelProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure an Anthropic Messages transport with messages, tool calls, thinking replay, optional streaming and optional system-prefix and history caching. The harness supplies the model per request; the agent model must set maxOutputTokens, and reasoning maps to adaptive or disabled thinking. Cache reads and writes are normalized into usage; server tools are rejected.

[Complete example and detailed rules](../../guide/advanced/model-providers/).

## Parameters and properties

| Name                       | Type                            | Presence | Meaning                                                                                                                                                            |
| -------------------------- | ------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `AnthropicModelProviderOptions` | Required | Anthropic endpoint, explicit API key, bounds and optional system-prefix cache; output limits belong to the agent model.                                            |
| `options.apiKey`           | `string`                        | Required | Explicit Anthropic API key sent in x-api-key; no CLI account or host credential discovery.                                                                         |
| `options.baseUrl`          | `string \| undefined`           | Optional | Messages API base URL including its version prefix; defaults to https://api.anthropic.com/v1.                                                                      |
| `options.cacheSystem`      | `boolean \| undefined`          | Optional | Opt in to an ephemeral cache breakpoint on the system text. Requests must contain system instructions; a cache hit is not guaranteed.                              |
| `options.timeoutMs`        | `number \| undefined`           | Optional | Positive deadline in milliseconds; defaults to 120000 and cannot exceed 2147483647. It covers the whole request, or the silence between two chunks when streaming. |
| `options.maxResponseBytes` | `number \| undefined`           | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.                                      |

## Returns

`ModelProvider`

## Signature

```ts
export declare function anthropicModelProvider(
  options: AnthropicModelProviderOptions,
): ModelProvider;
```

## Related contracts

- [AnthropicModelProviderOptions](../anthropicmodelprovideroptions/)
- [ModelProvider](../modelprovider/)
