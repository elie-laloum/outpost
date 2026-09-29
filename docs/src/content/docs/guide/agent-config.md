---
title: "Agent configuration"
description: "Choose the CLI protocol and model independently of the sandbox."
---

Compose an agent with `createAgent({ harness, model })`. The harness drives the CLI protocol; `sandboxProvider` chooses where commands execute.

```ts
import { createAgent, createClaudeHarness } from "@elie-laloum/outpost";

const reviewer = createAgent({
  harness: createClaudeHarness({ authentication: "account" }),
});
```

## Choose a harness

| Harness                               | Native continuation and fork | Access                                   |
| ------------------------------------- | ---------------------------- | ---------------------------------------- |
| [Codex](../codex/)                    | Yes                          | Account or API key                       |
| [Claude Code](../claude-code/)        | Yes                          | Account, subscription token or API key   |
| [Antigravity](../antigravity/)        | Warm resume only             | Account or API key                       |
| [GitHub Copilot CLI](../copilot-cli/) | Resume only                  | Account or Copilot token                 |
| [Kimi Code](../kimi-code/)            | Yes                          | Account or API key; API requires a model |

Kimi supports continuation and fork. Copilot supports continuation only. Antigravity supports continuation only in the same open sandbox. All three can repair structured responses using their supported continuation mode.

## Select a model

Omit `model` to use a CLI’s default. Supply a name or `{ name, reasoning, maxOutputTokens }` when supported. The harness validates settings when the agent is composed; the service determines whether your account can use the model. Unsupported reasoning or output limits fail instead of being silently ignored.

The custom [model loop](../model-loop/) requires an explicit model and a model provider. It does not install a coding-agent CLI.

## Give agents MCP tools

Every harness accepts `mcpServers`. See [MCP servers](../mcp-servers/).

## Fall back to another agent or model

Wrap several agents in `createFallbackAgent([...], { on })` to hand a dispatch to the next one when a limit or an outage stops the current one. See [Fallback agents](../agent-fallback/).

API: [createAgent](../../reference/createagent/) · [AgentOptions](../../reference/agentoptions/).
