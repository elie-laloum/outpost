---
title: "Model providers — Overview"
description: "A model provider sends the built-in harness’s requests to an HTTP model API and normalizes messages, tools, reasoning and usage."
sidebar:
  label: Overview
  order: 0
---

## Which provider to use

Pass the provider to `createHarness({ modelProvider })`. Each built-in provider speaks one protocol and streams over server-sent events.

|                           | Chat Completions                          | Responses                                         | Anthropic Messages                                                                    |
| ------------------------- | ----------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Factory                   | `createOpenAIModelProvider()`             | `createOpenAIModelProvider({ api: "responses" })` | `createAnthropicModelProvider()`                                                      |
| Path added to `baseUrl`   | `chat/completions`                        | `responses`                                       | `messages`; `baseUrl` defaults to `https://api.anthropic.com/v1`                      |
| `apiKey`                  | Bearer key or `false`                     | Bearer key or `false`                             | Key sent in `x-api-key`, required                                                     |
| Agent `maxOutputTokens`   | Optional                                  | Optional                                          | Required                                                                              |
| Agent `reasoning`         | Sent as `reasoning_effort`                | Sent as `reasoning.effort`                        | `none` disables thinking; `low` to `max` use adaptive thinking; `minimal` is rejected |
| Reasoning kept for replay | None                                      | Reasoning items                                   | `thinking` and `redacted_thinking` blocks                                             |
| Tool result `isError`     | Not sent                                  | Not sent                                          | Sent as `is_error`                                                                    |
| Prompt caching            | Automatic on the service; `cache` ignored | Automatic on the service; `cache` ignored         | `cache` and `cacheSystem` add ephemeral breakpoints                                   |

Reasoning blocks are replayed only to the provider `identity` and model that produced them; other blocks pass unchanged.

## How a request fails

Every failure rejects with an `OutpostError`. `unavailableFault()` recognizes the faults marked unavailable, which [fallback agents](../../../guide/fallback-agents/) can cover.

| Situation                                                                      | Code            | Details                                                   |
| ------------------------------------------------------------------------------ | --------------- | --------------------------------------------------------- |
| Invalid options, request or agent model                                        | `configuration` | —                                                         |
| HTTP 429                                                                       | `quota`         | `status`; `retryAfterMs` and `resetAt` from `Retry-After` |
| HTTP 408, 500, 502, 503, 504 or 529                                            | `provider`      | `status`, `unavailable`                                   |
| Other HTTP error status                                                        | `provider`      | `status`                                                  |
| Connection failure or redirect                                                 | `provider`      | `unavailable`                                             |
| Stream error `rate_limit_error`, `rate_limit_exceeded` or `insufficient_quota` | `quota`         | `type`, `code`                                            |
| Stream error `overloaded_error`, `api_error` or `server_error`                 | `provider`      | `type`, `unavailable`                                     |
| No response within `timeoutMs` (while streaming: no chunk)                     | `timeout`       | —                                                         |
| Request `signal` aborted                                                       | `aborted`       | —                                                         |
| Malformed, unsupported or oversized response                                   | `response`      | —                                                         |

:::note
A provider sends each request once and never switches protocol. Retries come from task retries, quota pauses or fallback agents.
:::

## Entry points

Guide: [Model providers](../../../guide/model-providers/) · [Built-in harness](../../../guide/harness/) · [Fallback agents](../../../guide/fallback-agents/)

- [createOpenAIModelProvider](../../createopenaimodelprovider/)
- [createAnthropicModelProvider](../../createanthropicmodelprovider/)
- [ModelProvider](../../modelprovider/)
- [ModelRequest](../../modelrequest/)
- [ModelResult](../../modelresult/)
- [ModelMessage](../../modelmessage/)
- [ModelContentBlock](../../modelcontentblock/)
- [ModelStreamEvent](../../modelstreamevent/)
- [OpenAIModelProviderOptions](../../openaimodelprovideroptions/)
- [AnthropicModelProviderOptions](../../anthropicmodelprovideroptions/)
