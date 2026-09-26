---
title: "Codex"
description: "Connect Codex to an Outpost sandbox."
---

Use `codexHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Run `codex -c cli_auth_credentials_store='"file"' login` on the host, then select `authentication: "account"`. The file is `~/.codex/auth.json`, or `auth.json` under `CODEX_HOME`.

## API access

Supply `OPENAI_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { agent, codexHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: codexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

## Behavior

Codex supports captured conversations, resume, fork and response repair. `saveConversations: false` disables capture. `approvalReviewer` selects `user` or `auto_review` where supported by the CLI.

## Custom endpoint

Set `modelProvider: { baseUrl, apiKeyEnvironment }` on `codexHarness()` and an explicit `model` on `agent()`. The endpoint must implement the Responses API. `apiKeyEnvironment: false` selects an unauthenticated endpoint; otherwise declare the chosen key variable. See [Codex authentication](https://developers.openai.com/codex/auth).

API: [codexHarness](../../reference/codexharness/).
