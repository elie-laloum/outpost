---
title: "Configure Codex"
description: "Run Codex with your account or an API key, including a Responses-compatible endpoint."
---

## Install

The [agent image](../agent-images/) already contains Codex. If you maintain your own image, install the CLI with npm:

```sh
npm install -g @openai/codex
```

When a remote sandbox (cloud, isolated container or Firecracker) has no `codex`, Outpost installs the version pinned in [`agentVersions`](../../reference/agentversions/) with npm in the sandbox home before the first turn. Pass `bootstrap: false` to `dispatch()` or `createSandbox()` when the image must provide it ([Agent images](../agent-images/)).

## Sign in with your account

Sign in on the host with file credential storage, then select `authentication: "account"`.

```sh
codex -c cli_auth_credentials_store='"file"' login
```

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
});
```

Outpost copies `~/.codex/auth.json`, or `auth.json` under `CODEX_HOME`, into the sandbox’s private home. Usage counts against your ChatGPT plan. `{ account: { file: "/path/to/auth.json" } }` selects another login file. OpenAI documents both sign-in methods in [Codex authentication](https://developers.openai.com/codex/auth).

## Use an API key

`authentication: "usage"` signs Codex in with `OPENAI_API_KEY` inside the sandbox. The OpenAI Platform bills this usage separately from ChatGPT plans.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

Other variable names and key sources: [Authentication](../authentication/).

### Use a Responses-compatible endpoint

`modelProvider` points Codex at another endpoint that implements the OpenAI Responses API. It requires an explicit `model`.

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({
    modelProvider: {
      baseUrl: "https://llm.example.com/v1",
      apiKeyEnvironment: "LLM_API_KEY",
    },
    authentication: "usage",
    variables: { LLM_API_KEY: process.env.LLM_API_KEY ?? "" },
  }),
  model: "my-model",
});
```

API reference: [CodexModelProvider](../../reference/codexmodelprovider/).

## Available features

[Choose an agent](../choose-an-agent/) compares these capabilities across agents. With Codex:

<!-- features -->

- [Conversations](../conversations/): Each session is captured from `~/.codex/sessions`, then resumed, forked or used to repair a typed response.
- [Steering](../steering/): A steered dispatch runs `codex app-server` instead of `codex exec`, with the same model, reasoning, endpoint and approval settings.
- [MCP servers](../mcp-servers/): Declared servers become `-c mcp_servers.<name>` overrides for each run; tool events are named `mcp__<server>__<tool>`.
- [MCP server login](../mcp-oauth/): `oauth: "login"` reuses a host `codex mcp login` made with file storage.
- [Follow progress](../progress/): Each turn reports input, cached and output tokens, commands, file changes and reasoning summaries.
- [Quota pauses](../quota-pauses/): A usage limit ends the dispatch with code `quota`; a lost connection or a server error with `unavailable`.

`saveConversations: false` keeps sessions in the sandbox. `conversations` replaces the default store, for example to archive sessions through a transport.

### Model and reasoning

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

export const coder = createAgent({
  harness: createCodexHarness({ authentication: "account" }),
  model: { name: "gpt-5.5", reasoning: "high" },
});
```

API reference: [CodexSettings](../../reference/codexsettings/).

### Approvals

Headless runs skip Codex’s approval prompts and its own sandbox: the Outpost sandbox isolates the agent. `approvalReviewer: "auto_review"` hands each approval request to Codex’s automatic reviewer instead. In an [interactive terminal](../sandbox-sessions/), the default `"user"` leaves approvals to you.

## Limits

- Outpost never reads the system keychain: a login stored there cannot be copied. Sign in again with file storage.
- `maxOutputTokens` and `reasoning` values outside the [createCodexHarness contract](../../reference/createcodexharness/) are rejected when the agent is composed.
- A custom `modelProvider` accepts only `usage` authentication. Chat Completions endpoints do not work.
- Codex marks `app-server` as experimental; steering depends on its protocol.
- With [host execution](../host-process/), nothing isolates Codex, since headless runs bypass its own sandbox.

API: [createCodexHarness](../../reference/createcodexharness/) · [CodexSettings](../../reference/codexsettings/) · [CodexModelProvider](../../reference/codexmodelprovider/) · [createCodexConversations](../../reference/createcodexconversations/).
