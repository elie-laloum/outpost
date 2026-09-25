---
title: "ModelRequest"
description: "ModelRequest — Outpost API"
sidebar:
  order: 20
---

:::caution[Experimental]
Experimental: bounded text requests and caller-supplied harness execution. No built-in tool loop, streaming or native custom-harness conversation persistence.
:::

## Import

```ts
import type { ModelRequest } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name              | Type                       | Presence | Meaning                                                                                                                                                                |
| ----------------- | -------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model`           | `string`                   | Required | Nonempty service-specific model identifier; no local catalog or availability probe is used.                                                                            |
| `prompt`          | `string`                   | Required | Nonempty text sent as this request’s user input; no repository content is collected automatically.                                                                     |
| `system`          | `string \| undefined`      | Optional | Optional text sent as a Chat Completions system message or Responses instructions.                                                                                     |
| `maxOutputTokens` | `number \| undefined`      | Optional | Positive output token limit sent as max_completion_tokens or max_output_tokens; omitted by default. Availability and reasoning-token accounting depend on the service. |
| `signal`          | `AbortSignal \| undefined` | Optional | Caller-owned cancellation signal for this request, combined with the provider deadline. Cancellation does not dispose the reusable client.                             |

## Signature

```ts
export interface ModelRequest {
  readonly model: string;
  readonly prompt: string;
  readonly system?: string;
  readonly maxOutputTokens?: number;
  readonly signal?: AbortSignal;
}
```
