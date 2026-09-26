---
title: "Agent configuration"
description: "Choose the CLI protocol and model independently of the sandbox."
---

Compose an agent with `agent({ harness, model })`. The harness drives the CLI protocol; `sandboxProvider` chooses where commands execute.

```ts
import { agent, claudeHarness } from "@elie-laloum/outpost";

const reviewer = agent({
  harness: claudeHarness({ authentication: "account" }),
});
```

## Choose a harness

| Harness                               | Native continuation and fork | Access                                   |
| ------------------------------------- | ---------------------------- | ---------------------------------------- |
| [Codex](../codex/)                    | Yes                          | Account or API key                       |
| [Claude Code](../claude-code/)        | Yes                          | Account, subscription token or API key   |
| [Antigravity](../antigravity/)        | No                           | Account or API key                       |
| [GitHub Copilot CLI](../copilot-cli/) | No                           | Account or Copilot token                 |
| [Kimi Code](../kimi-code/)            | No                           | Account or API key; API requires a model |

Antigravity, Copilot and Kimi start fresh sessions. They cannot use automatic response repairs that require continuation.

## Select a model

Omit `model` to use a CLI’s default. Supply a name or `{ name, reasoning, maxOutputTokens }` when supported. The harness validates settings when the agent is composed; the service determines whether your account can use the model. Unsupported reasoning or output limits fail instead of being silently ignored.

The custom [model loop](../model-loop/) requires an explicit model and a model provider. It does not install a coding-agent CLI.

API: [agent](../../reference/agent/) · [AgentOptions](../../reference/agentoptions/).
