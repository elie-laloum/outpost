---
title: "openaiModelProvider"
description: "openaiModelProvider — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
Experimental: provider contract for custom harnesses with messages, tool calls, replayable reasoning, history caching and streaming. It may change before release.
:::

## Import

```ts
import { openaiModelProvider } from "@elie-laloum/outpost";
```

## Purpose and behavior

Configure a reusable request transport using Chat Completions or Responses, with messages, tool calls, reasoning effort and optional streaming. The harness supplies the model on each request. Construction performs local validation only; requests enforce cancellation, response size and deadlines without retries or protocol fallback.

[Complete example and detailed rules](../../guide/advanced/model-providers/).

## Parameters and properties

| Name                       | Type                                             | Presence | Meaning                                                                                                                                                            |
| -------------------------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `OpenAIModelProviderOptions`                     | Required | HTTP service, protocol, explicit credentials and bounds; the harness supplies the model per request.                                                               |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                                          |
| `options.baseUrl`          | `string`                                         | Required | Absolute HTTP(S) API base URL, including any /v1 prefix; excludes credentials, query and fragment. The selected protocol path is appended.                         |
| `options.apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.                                 |
| `options.timeoutMs`        | `number \| undefined`                            | Optional | Positive deadline in milliseconds; defaults to 120000 and cannot exceed 2147483647. It covers the whole request, or the silence between two chunks when streaming. |
| `options.maxResponseBytes` | `number \| undefined`                            | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.                                      |

## Returns

`ModelProvider`

## Signature

```ts
export declare function openaiModelProvider(
  options: OpenAIModelProviderOptions,
): ModelProvider;
```

## Related contracts

- [ModelProvider](../modelprovider/)
- [OpenAIModelProviderOptions](../openaimodelprovideroptions/)
