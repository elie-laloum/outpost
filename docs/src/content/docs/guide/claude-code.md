---
title: "Configure Claude Code"
description: "Run Claude Code with account access or an API key and select its model settings."
---

## Install

The [agent image](../agent-images/) contains Claude Code. Remote sandboxes install `claude` if it is missing before the first turn; [local host execution](../host-process/) uses the executable already on your `PATH`.

<!-- features -->

- **Pinned version**: The image and remote installation use `@anthropic-ai/claude-code` at the version in [`agentVersions.claude`](../../reference/agentversions/).
- **Remote installation**: npm installs it under `~/.outpost-tools` in the sandbox.
- **Image only**: `bootstrap: false` on `dispatch()` or `createSandbox()` skips installation; the image must provide `claude`.

## Sign in with your account

Run `claude`, then `/login`, on the host. `authentication: "account"` copies the subscription login from `~/.claude/.credentials.json` (or `$CLAUDE_CONFIG_DIR/.credentials.json`) into the sandbox’s private home.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

On macOS, Claude Code keeps its login in the keychain by default, and Outpost never reads a keychain. Run `claude setup-token` instead and pass the printed token as a variable. It uses your Pro, Max, Team or Enterprise plan.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: { account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } },
    variables: {
      CLAUDE_CODE_OAUTH_TOKEN: process.env.CLAUDE_CODE_OAUTH_TOKEN ?? "",
    },
  }),
});
```

Choosing between account and API access, and where credentials go: [Authentication](../authentication/). Vendor requirements: [Claude Code authentication](https://code.claude.com/docs/en/authentication).

## Use an API key

`authentication: "usage"` passes `ANTHROPIC_API_KEY`. Requests are billed to your Anthropic API account, not to a subscription.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "usage",
    variables: { ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "" },
  }),
});
```

## Choose a model and options

Omit `model` to use Claude Code’s default. A model object adds an effort level and an output limit.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const coder = createAgent({
  harness: createClaudeHarness({
    authentication: "account",
    partialMessages: true,
  }),
  model: { name: "sonnet", reasoning: "high", maxOutputTokens: 32_000 },
});
```

API reference: [ClaudeSettings](../../reference/claudesettings/) and [AgentModel](../../reference/agentmodel/).

## Available features

[Choose an agent](../choose-an-agent/) compares these capabilities across agents.

<!-- features -->

- [Conversations](../conversations/): Captured after each turn, then resumed or forked in a new sandbox.
  - resume
  - fork
  - response repair
- [Steering](../steering/): Instructions join the running turn through its stream-json input, on every sandbox provider.
- [Quota pauses](../quota-pauses/): A usage limit fails with code `quota`, with the reset time when Claude reports it.
- [Fallback agents](../fallback-agents/): API 5xx, overload and connection failures are classified as `unavailable`.
- [Progress](../progress/): Tool calls, thinking and token usage per message, including cache tokens.
- [MCP servers](../mcp-servers/): Stdio and HTTP servers, excluded tools and host OAuth logins.

## Limits

- **One credential**: Declaring `ANTHROPIC_API_KEY` with account access, or `CLAUDE_CODE_OAUTH_TOKEN` with API access, fails before the turn starts.
- **Permissions**: Without `permissions`, headless turns run with `--dangerously-skip-permissions`. The sandbox, not the permission mode, is the isolation boundary.
- **Duplicate settings**: Set `maxOutputTokens` or a `CLAUDE_CODE_MAX_OUTPUT_TOKENS` variable, not both.

API: [createClaudeHarness](../../reference/createclaudeharness/) · [ClaudeSettings](../../reference/claudesettings/) · [createClaudeConversations](../../reference/createclaudeconversations/) · [AgentAuthentication](../../reference/agentauthentication/).
