---
title: "createAnthropicModelProvider"
description: "createAnthropicModelProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createAnthropicModelProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a reusable provider for the Anthropic Messages API, with tool calls, thinking replay, streaming and optional prompt caching. createAgent() rejects an agent model without maxOutputTokens or with reasoning minimal. Each request is sent once, with no retry.

[Complete example and detailed rules](../../guide/model-providers/).

## Parameters and properties

| Name                       | Type                            | Presence | Meaning                                                                                                                                                                      |
| -------------------------- | ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `AnthropicModelProviderOptions` | Required | API key, base URL, request bounds and system-prompt caching. Unknown options fail with code configuration.                                                                   |
| `options.apiKey`           | `string`                        | Required | Explicit Anthropic API key sent in x-api-key; no CLI account or host credential discovery.                                                                                   |
| `options.baseUrl`          | `string \| undefined`           | Optional | Messages API base URL including its version prefix, default https://api.anthropic.com/v1; messages is appended. Credentials, query or fragment fail with code configuration. |
| `options.cacheSystem`      | `boolean \| undefined`          | Optional | Adds an ephemeral cache breakpoint on the system text, default false. Requests without system instructions then fail with code configuration; a cache hit is not guaranteed. |
| `options.timeoutMs`        | `number \| undefined`           | Optional | Request deadline in milliseconds, default 120000, at most 2147483647. While streaming it restarts on each received chunk; expiry rejects with code timeout.                  |
| `options.maxResponseBytes` | `number \| undefined`           | Optional | Maximum response body in bytes after decompression, default 8388608 (8 MiB); a streamed response counts all its chunks. A larger response fails with code response.          |

## Returns

`ModelProvider`

## Signature

```ts
export declare function createAnthropicModelProvider(
  options: AnthropicModelProviderOptions,
): ModelProvider;
```

## Related contracts

- [AnthropicModelProviderOptions](../anthropicmodelprovideroptions/)
- [ModelProvider](../modelprovider/)
