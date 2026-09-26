---
title: "Model connections"
description: "Choose an HTTP protocol for the built-in loop."
---

:::note[Experimental]
These providers implement the experimental `ModelProvider` contract used by the built-in harness.
:::

Choose a model provider by protocol, then pass it to `harness({ modelProvider })`. Credentials are explicit and remain with the host-side client.

```ts
import {
  anthropicModelProvider,
  openaiModelProvider,
} from "@elie-laloum/outpost";

const messages = anthropicModelProvider({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});
const compatible = openaiModelProvider({
  baseUrl: "http://127.0.0.1:8080/v1",
  api: "chat-completions",
  apiKey: false,
});
```

## Protocol selection

`openaiModelProvider()` accepts `chat-completions` (default) or `responses`. It appends the selected endpoint to `baseUrl`; no fallback changes protocols after an error. `anthropicModelProvider()` uses the Messages API.

This is separate from `codexHarness({ modelProvider })`, which configures Codex CLI and requires Responses compatibility.

## Bounds and streaming

`timeoutMs` defaults to 120,000 ms. For streaming it bounds silence between chunks. `maxResponseBytes` defaults to 8 MiB after decompression. Oversized or malformed responses fail at the protocol boundary.

Models are names or objects with supported reasoning and output limits. A service can reject a name even when the local contract accepts its shape. Replayable reasoning and tool-call messages remain protocol data managed by the provider.

The harness’s `cache` requests prefix caching. Anthropic’s `cacheSystem` explicitly adds a system cache breakpoint; cache hits are not guaranteed.

API: [openaiModelProvider](../../reference/openaimodelprovider/) · [anthropicModelProvider](../../reference/anthropicmodelprovider/) · [ModelProvider](../../reference/modelprovider/).
