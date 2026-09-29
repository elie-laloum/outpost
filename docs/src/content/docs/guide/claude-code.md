---
title: "Claude Code"
description: "Connect Claude Code to an Outpost sandbox."
---

Use `claudeHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Run `claude` and `/login` on the host. Outpost reads the subscription entry in `~/.claude/.credentials.json`, or under `CLAUDE_CONFIG_DIR`. A macOS keychain login cannot be copied by Outpost. Use `claude setup-token`, then `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }` with that token explicitly supplied.

## API access

Supply `ANTHROPIC_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { agent, claudeHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: claudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

## Behavior

Claude supports native conversations, resume, fork and response repair. `conversations` stores captured sessions in a `"claude"` [conversation store](../chat-history/#storage), such as `transportConversations("claude", …)`. With [steering](../steering/) on Docker, Podman or the host, Claude receives instructions on its stream-json input during the turn. `permissions` configures the CLI permission mode; it does not replace sandbox isolation. Do not supply `ANTHROPIC_API_KEY` alongside account credentials or `CLAUDE_CODE_OAUTH_TOKEN` alongside API authentication: Outpost rejects these conflicts.

See [Claude Code authentication](https://code.claude.com/docs/en/authentication) for the vendor’s account requirements.

API: [claudeHarness](../../reference/claudeharness/).
