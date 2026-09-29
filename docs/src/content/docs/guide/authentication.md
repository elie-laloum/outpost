---
title: "Authentication"
description: "Select credentials explicitly for each agent."
---

Set `authentication` on the CLI harness. `account` uses a CLI login or subscription token. `usage` uses an API key with API billing. There is no automatic selection.

## Use an API key

```ts
import { createAgent, createCodexHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createCodexHarness({
    authentication: "usage",
    variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "" },
  }),
});
```

The harness receives only the variables you pass. For an alternate variable name, use `authentication: { usage: { variable: "TEAM_OPENAI_KEY" } }` and supply that variable. `{ usage: { key } }` accepts a value already loaded by your application.

## Use an account

`authentication: "account"` selects the agent’s own host login file. `{ account: { file: "/absolute/profile/path" } }` selects a dedicated file; Kimi expects a profile directory. [Claude](../claude-code/) and [Copilot](../copilot-cli/) also accept `{ account: { variable: "TOKEN_NAME" } }`.

Outpost never reads a system keychain. An isolated sandbox receives a private credential copy; local execution uses the host session and receives credential variables only. A sandbox token refresh can invalidate the original login: use a separate profile for automation when needed.

## Keep credentials separate

Cloud allocation credentials belong to the provider client on the host. Agent credentials belong to the harness. Storage credentials belong to the transport client. A Vercel or S3 credential does not authenticate Codex.

For generated projects, declare allowed variables in the ignored `.env` file. An empty declaration inherits the corresponding process variable; undeclared host secrets are not forwarded. See [Environment values](../environment-variables/).

API: [AgentAuthentication](../../reference/agentauthentication/).
