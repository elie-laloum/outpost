---
title: "Claude Code"
description: "Connect Claude Code to an Outpost sandbox."
---

Use `createClaudeHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Run `claude` and `/login` on the host. Outpost reads the subscription entry in `~/.claude/.credentials.json`, or under `CLAUDE_CONFIG_DIR`. A macOS keychain login cannot be copied by Outpost. Use `claude setup-token`, then `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }` with that token explicitly supplied.

## API access

Supply `ANTHROPIC_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

## Behavior

Claude supports native conversations, resume, fork and response repair. `conversations` stores captured sessions in a `"claude"` [conversation store](../chat-history/#storage), such as `createTransportConversations("claude", …)`. With [steering](../steering/), Claude receives instructions on its stream-json input during the turn, on every sandbox provider. `permissions` configures the CLI permission mode; it does not replace sandbox isolation. Do not supply `ANTHROPIC_API_KEY` alongside account credentials or `CLAUDE_CODE_OAUTH_TOKEN` alongside API authentication: Outpost rejects these conflicts.

See [Claude Code authentication](https://code.claude.com/docs/en/authentication) for the vendor’s account requirements.

`mcpServers` passes [MCP servers](../mcp-servers/) with `--mcp-config` for each run.

API: [createClaudeHarness](../../reference/createclaudeharness/).
