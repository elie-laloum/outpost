---
title: "createOpenAIModelProvider"
description: "createOpenAIModelProvider — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createOpenAIModelProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a reusable provider for an OpenAI-compatible service over Chat Completions (default) or Responses, with tool calls, reasoning effort and streaming. Invalid options fail with code configuration. Each request is sent once, with no retry or protocol fallback.

[Complete example and detailed rules](../../guide/model-providers/).

## Parameters and properties

| Name                       | Type                                             | Presence | Meaning                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options`                  | `OpenAIModelProviderOptions`                     | Required | Base URL, protocol, API key and request bounds. Unknown options fail with code configuration.                                                                                                                                 |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                                                                                                     |
| `options.baseUrl`          | `string`                                         | Required | Absolute HTTP(S) base URL including its version prefix, such as https://api.openai.com/v1; chat/completions or responses is appended. Credentials, query or fragment fail with code configuration, and redirects are refused. |
| `options.apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                                                                            |
| `options.timeoutMs`        | `number \| undefined`                            | Optional | Request deadline in milliseconds, default 120000, at most 2147483647. While streaming it restarts on each received chunk; expiry rejects with code timeout.                                                                   |
| `options.maxResponseBytes` | `number \| undefined`                            | Optional | Maximum response body in bytes after decompression, default 8388608 (8 MiB); a streamed response counts all its chunks. A larger response fails with code response.                                                           |

## Returns

`ModelProvider`

## Signature

```ts
export declare function createOpenAIModelProvider(
  options: OpenAIModelProviderOptions,
): ModelProvider;
```

## Related contracts

- [ModelProvider](../modelprovider/)
- [OpenAIModelProviderOptions](../openaimodelprovideroptions/)
