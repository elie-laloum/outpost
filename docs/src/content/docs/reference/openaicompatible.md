---
title: "openaiCompatible"
description: "openaiCompatible — Outpost API"
sidebar:
  order: 0
---

:::caution[Experimental]
This first phase makes text-only HTTP calls without Codex. The agent harness is planned for phase two: tool execution, repository editing and conversation persistence are not implemented. This API cannot be used as a dispatch agent or sandbox provider; its contract may change. See the [implemented scope and planned harness](../../guide/advanced/model-providers/).
:::

## Import

```ts
import { openaiCompatible } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a reusable experimental model client that sends one text request over the selected Chat Completions or Responses protocol. Construction validates configuration without network access. generate runs in the calling process, returns complete text and optional reported usage, and owns its request deadline. No sandbox, agent CLI, tools, automatic retries or conversation storage are involved.

[Complete example and detailed rules](../../guide/advanced/model-providers/).

## Parameters and properties

| Name                       | Type                                             | Presence | Meaning                                                                                                                                    |
| -------------------------- | ------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `options`                  | `OpenAICompatibleOptions`                        | Required | Explicit endpoint, model, authentication, protocol and request bounds for direct model calls.                                              |
| `options.baseUrl`          | `string`                                         | Required | Absolute HTTP(S) API base URL, including any /v1 prefix; excludes credentials, query and fragment. The selected protocol path is appended. |
| `options.model`            | `string`                                         | Required | Nonempty model identifier understood by the selected service; no default model is inferred.                                                |
| `options.apiKey`           | `string \| false`                                | Required | Explicit bearer API key, or false for an unauthenticated endpoint. No environment variable or account login is read automatically.         |
| `options.api`              | `"chat-completions" \| "responses" \| undefined` | Optional | HTTP protocol: chat-completions by default, or responses. No automatic protocol fallback.                                                  |
| `options.timeoutMs`        | `number \| undefined`                            | Optional | Positive request deadline in milliseconds, covering headers and the complete body; defaults to 120000 and cannot exceed 2147483647.        |
| `options.maxResponseBytes` | `number \| undefined`                            | Optional | Positive maximum response body size in bytes after HTTP decompression; defaults to 8388608 (8 MiB). Oversized responses fail.              |

## Returns

`ModelProvider`

## Signature

```ts
export declare function openaiCompatible(
  options: OpenAICompatibleOptions,
): ModelProvider;
```

## Related contracts

- [ModelProvider](../modelprovider/)
- [OpenAICompatibleOptions](../openaicompatibleoptions/)
