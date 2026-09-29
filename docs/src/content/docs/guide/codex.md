---
title: "Codex"
description: "Connect Codex to an Outpost sandbox."
---

Use `createCodexHarness()` with any supported [execution backend](../choose-a-sandbox/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Run `codex -c cli_auth_credentials_store='"file"' login` on the host, then select `authentication: "account"`. The file is `~/.codex/auth.json`, or `auth.json` under `CODEX_HOME`.

## API access

Supply `OPENAI_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

## Behavior

Codex supports captured conversations, resume, fork and response repair. `saveConversations: false` disables capture. `conversations` stores captured sessions in a `"codex"` [conversation store](../conversations/#storage), such as `createTransportConversations(createCodexConversations(), …)`. `approvalReviewer` selects `user` or `auto_review` where supported by the CLI. A dispatch with [steering](../steering/) runs `codex app-server` instead of `codex exec`, with the same model, reasoning, provider and approval settings, so instructions reach the running turn.

## Custom endpoint

Set `modelProvider: { baseUrl, apiKeyEnvironment }` on `createCodexHarness()` and an explicit `model` on `createAgent()`. The endpoint must implement the Responses API. `apiKeyEnvironment: false` selects an unauthenticated endpoint; otherwise declare the chosen key variable. See [Codex authentication](https://developers.openai.com/codex/auth).

`mcpServers` passes [MCP servers](../mcp-servers/) as `-c mcp_servers.<name>…` overrides for each run. MCP tool events are named `mcp__<server>__<tool>`.

API: [createCodexHarness](../../reference/createcodexharness/).
